"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Card,
  Stack,
  Flex,
  Box,
  Text,
  Heading,
  Button,
  Badge,
  Spinner,
  Inline,
  useToast,
} from "@sanity/ui";
import {
  UploadIcon,
  TrashIcon,
  CheckmarkCircleIcon,
  ErrorOutlineIcon,
  ResetIcon,
  AddIcon,
} from "@sanity/icons";
import { useClient } from "sanity";
import { LexoRank } from "lexorank";

export type UploadStatus =
  | "pending"
  | "uploading"
  | "creating"
  | "success"
  | "error";

export interface QueueItem {
  id: string;
  file: File;
  previewUrl: string;
  mediaType: "image" | "gif" | "video";
  status: UploadStatus;
  progress?: number;
  error?: string;
  docId?: string;
}

function detectMediaType(file: File): "image" | "gif" | "video" {
  const name = file.name.toLowerCase();
  if (file.type === "image/gif" || name.endsWith(".gif")) {
    return "gif";
  }
  if (
    file.type.startsWith("video/") ||
    /\.(mp4|mov|webm|m4v|avi|mkv)$/i.test(name)
  ) {
    return "video";
  }
  return "image";
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getNextRank(currentRankStr?: string): string {
  try {
    if (currentRankStr) {
      return LexoRank.parse(currentRankStr).genNext().genNext().toString();
    }
  } catch {
    // fallback
  }
  return LexoRank.min().genNext().genNext().toString();
}

interface KeepGoingDocumentStub {
  _type: "keepGoing";
  mediaType: "image" | "gif" | "video";
  orderRank: string;
  image?: {
    _type: "image";
    asset: {
      _type: "reference";
      _ref: string;
    };
  };
  video?: {
    _type: "file";
    asset: {
      _type: "reference";
      _ref: string;
    };
  };
}

export function BatchUploadKeepGoing() {
  const client = useClient({ apiVersion: "2024-01-01" });
  const toast = useToast();

  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [overallProgress, setOverallProgress] = useState<{
    completed: number;
    total: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const queueRef = useRef<QueueItem[]>([]);
  queueRef.current = queue;

  // Revoke preview object URLs when unmounted
  useEffect(() => {
    return () => {
      queueRef.current.forEach((item) => {
        try {
          URL.revokeObjectURL(item.previewUrl);
        } catch {
          // ignore
        }
      });
    };
  }, []);

  const addFiles = useCallback((files: FileList | File[]) => {
    const newItems: QueueItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Only accept images and videos
      if (
        !file.type.startsWith("image/") &&
        !file.type.startsWith("video/") &&
        !/\.(jpg|jpeg|png|webp|gif|svg|mp4|mov|webm|m4v|avi|mkv)$/i.test(
          file.name
        )
      ) {
        continue;
      }

      newItems.push({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        mediaType: detectMediaType(file),
        status: "pending",
      });
    }

    if (newItems.length === 0) return;

    setQueue((prev) => [...prev, ...newItems]);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer?.files?.length) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      addFiles(e.target.files);
      // Reset input value so re-selecting same file triggers change
      e.target.value = "";
    }
  };

  const removeItem = (id: string) => {
    setQueue((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) {
        try {
          URL.revokeObjectURL(item.previewUrl);
        } catch {
          // ignore
        }
      }
      return prev.filter((i) => i.id !== id);
    });
  };

  const clearQueue = () => {
    queue.forEach((item) => {
      try {
        URL.revokeObjectURL(item.previewUrl);
      } catch {
        // ignore
      }
    });
    setQueue([]);
    setOverallProgress(null);
  };

  const clearCompleted = () => {
    setQueue((prev) => {
      const toKeep: QueueItem[] = [];
      prev.forEach((item) => {
        if (item.status === "success") {
          try {
            URL.revokeObjectURL(item.previewUrl);
          } catch {
            // ignore
          }
        } else {
          toKeep.push(item);
        }
      });
      return toKeep;
    });
    setOverallProgress(null);
  };

  const updateItem = (id: string, updates: Partial<QueueItem>) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const changeMediaType = (
    id: string,
    newType: "image" | "gif" | "video"
  ) => {
    updateItem(id, { mediaType: newType });
  };

  const startUpload = async () => {
    if (isProcessing) return;

    const pendingItems = queue.filter(
      (item) => item.status === "pending" || item.status === "error"
    );
    if (pendingItems.length === 0) return;

    setIsProcessing(true);
    let completedCount = 0;
    const totalToUpload = pendingItems.length;
    setOverallProgress({ completed: 0, total: totalToUpload });

    try {
      // 1. Fetch current highest orderRank so new items go to the end of the collection
      const lastRank = await client.fetch<string | null>(
        `*[_type == "keepGoing"] | order(orderRank desc)[0].orderRank`
      );

      let currentRankStr = getNextRank(lastRank || undefined);

      // 2. Upload files in sequence or controlled batch to ensure stability and preserved order
      for (const item of pendingItems) {
        updateItem(item.id, { status: "uploading", error: undefined });

        try {
          const isVideo = item.mediaType === "video";
          const assetType = isVideo ? "file" : "image";

          // Upload asset to Sanity
          const asset = await client.assets.upload(assetType, item.file, {
            filename: item.file.name,
            contentType: item.file.type || undefined,
          });

          updateItem(item.id, { status: "creating" });

          // Create keepGoing document
          const doc: KeepGoingDocumentStub = {
            _type: "keepGoing",
            mediaType: item.mediaType,
            orderRank: currentRankStr,
            ...(isVideo
              ? {
                  video: {
                    _type: "file",
                    asset: {
                      _type: "reference",
                      _ref: asset._id,
                    },
                  },
                }
              : {
                  image: {
                    _type: "image",
                    asset: {
                      _type: "reference",
                      _ref: asset._id,
                    },
                  },
                }),
          };

          const createdDoc = await client.create(doc);

          // Advance rank for next document
          currentRankStr = getNextRank(currentRankStr);

          updateItem(item.id, {
            status: "success",
            docId: createdDoc._id,
          });

          completedCount++;
          setOverallProgress({
            completed: completedCount,
            total: totalToUpload,
          });
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Failed to upload file";
          updateItem(item.id, {
            status: "error",
            error: message,
          });
        }
      }

      toast.push({
        title: "Batch upload finished",
        status: completedCount === totalToUpload ? "success" : "warning",
        description: `Successfully uploaded ${completedCount} of ${totalToUpload} item(s) to Keep Going.`,
      });
    } catch (globalErr) {
      toast.push({
        title: "Upload failed",
        status: "error",
        description:
          globalErr instanceof Error
            ? globalErr.message
            : "An error occurred while preparing batch upload.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const totalBytes = queue.reduce((acc, item) => acc + item.file.size, 0);
  const pendingCount = queue.filter(
    (i) => i.status === "pending" || i.status === "error"
  ).length;
  const successCount = queue.filter((i) => i.status === "success").length;

  return (
    <Box padding={[3, 4, 5]} style={{ maxWidth: 1100, margin: "0 auto" }}>
      <Stack space={4}>
        {/* Header */}
        <Card padding={4} radius={3} tone="transparent">
          <Stack space={2}>
            <Heading as="h1" size={2}>
              Keep Going: Batch Upload
            </Heading>
            <Text size={1} muted>
              Upload multiple images, GIFs, and videos at once to the Keep Going
              gallery. New items will automatically be appended to the bottom in
              order, and can be drag-and-drop reordered anytime.
            </Text>
          </Stack>
        </Card>

        {/* Dropzone */}
        <Card
          padding={5}
          radius={3}
          border
          style={{
            borderStyle: "dashed",
            borderWidth: 2,
            borderColor: isDragging
              ? "var(--card-focus-ring-color, #2276fc)"
              : "var(--card-border-color, #ccc)",
            backgroundColor: isDragging
              ? "var(--card-badge-default-bg-color, #f0f7ff)"
              : undefined,
            cursor: "pointer",
            textAlign: "center",
            transition: "all 0.15s ease-in-out",
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.gif,.mp4,.mov,.webm,.webp,.png,.jpg,.jpeg"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <Stack space={3} style={{ alignItems: "center" }}>
            <Box style={{ fontSize: 36, opacity: 0.8 }}>
              <UploadIcon />
            </Box>
            <Stack space={1}>
              <Text size={2} weight="semibold">
                Drop images or videos here, or click to browse
              </Text>
              <Text size={1} muted>
                Supports JPG, PNG, WEBP, GIF, MP4, MOV, WEBM. Select multiple
                files at once.
              </Text>
            </Stack>
          </Stack>
        </Card>

        {/* Action Bar when files are in queue */}
        {queue.length > 0 && (
          <Card padding={3} radius={3} tone="default" border>
            <Flex
              direction={["column", "row"]}
              justify="space-between"
              align={["stretch", "center"]}
              gap={3}
            >
              <Inline space={2} style={{ alignItems: "center" }}>
                <Badge tone="primary">{queue.length} file(s)</Badge>
                <Text size={1} muted>
                  ({formatFileSize(totalBytes)})
                </Text>
                {successCount > 0 && (
                  <Badge tone="positive">{successCount} published</Badge>
                )}
                {overallProgress && (
                  <Text size={1} weight="medium">
                    Progress: {overallProgress.completed} / {overallProgress.total}
                  </Text>
                )}
              </Inline>

              <Inline space={2}>
                {successCount > 0 && !isProcessing && (
                  <Button
                    text="Clear Completed"
                    mode="ghost"
                    fontSize={1}
                    onClick={clearCompleted}
                  />
                )}
                {!isProcessing && (
                  <Button
                    text="Clear All"
                    mode="ghost"
                    tone="critical"
                    icon={ResetIcon}
                    fontSize={1}
                    onClick={clearQueue}
                  />
                )}
                <Button
                  text="Add More"
                  mode="ghost"
                  icon={AddIcon}
                  fontSize={1}
                  disabled={isProcessing}
                  onClick={() => fileInputRef.current?.click()}
                />
                <Button
                  text={
                    isProcessing
                      ? "Uploading..."
                      : `Upload ${pendingCount} Item${pendingCount === 1 ? "" : "s"}`
                  }
                  tone="primary"
                  icon={isProcessing ? undefined : UploadIcon}
                  disabled={isProcessing || pendingCount === 0}
                  loading={isProcessing}
                  fontSize={1}
                  onClick={startUpload}
                />
              </Inline>
            </Flex>
          </Card>
        )}

        {/* Queue Items */}
        {queue.length > 0 && (
          <Stack space={2}>
            {queue.map((item, index) => (
              <Card
                key={item.id}
                padding={3}
                radius={2}
                border
                tone={
                  item.status === "success"
                    ? "positive"
                    : item.status === "error"
                    ? "critical"
                    : "default"
                }
              >
                <Flex align="center" justify="space-between" gap={3}>
                  {/* Left: Thumbnail & Details */}
                  <Flex align="center" gap={3} style={{ minWidth: 0, flex: 1 }}>
                    <Text size={1} muted style={{ width: 24, textAlign: "right" }}>
                      #{index + 1}
                    </Text>

                    {/* Preview box */}
                    <Box
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 6,
                        overflow: "hidden",
                        backgroundColor: "rgba(0,0,0,0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {item.mediaType === "video" ? (
                        <video
                          src={item.previewUrl}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          muted
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.previewUrl}
                          alt={item.file.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      )}
                    </Box>

                    {/* Metadata */}
                    <Stack space={1} style={{ minWidth: 0, flex: 1 }}>
                      <Text
                        size={1}
                        weight="medium"
                        textOverflow="ellipsis"
                        title={item.file.name}
                      >
                        {item.file.name}
                      </Text>
                      <Inline space={2} style={{ alignItems: "center" }}>
                        <Text size={0} muted>
                          {formatFileSize(item.file.size)}
                        </Text>
                        <Badge
                          tone={
                            item.mediaType === "video"
                              ? "caution"
                              : item.mediaType === "gif"
                              ? "primary"
                              : "default"
                          }
                          fontSize={0}
                        >
                          {item.mediaType.toUpperCase()}
                        </Badge>
                        {item.status === "error" && item.error && (
                          <Text size={0} style={{ color: "var(--card-focus-ring-color, #e00)" }}>
                            Error: {item.error}
                          </Text>
                        )}
                      </Inline>
                    </Stack>
                  </Flex>

                  {/* Right: Media type selector & status */}
                  <Flex align="center" gap={2} style={{ flexShrink: 0 }}>
                    {/* Media type toggle when pending */}
                    {item.status === "pending" && (
                      <select
                        value={item.mediaType}
                        onChange={(e) =>
                          changeMediaType(
                            item.id,
                            e.target.value as "image" | "gif" | "video"
                          )
                        }
                        style={{
                          fontSize: "12px",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          border: "1px solid var(--card-border-color, #ccc)",
                          background: "var(--card-bg-color, transparent)",
                          color: "inherit",
                        }}
                      >
                        <option value="image">Image</option>
                        <option value="gif">GIF</option>
                        <option value="video">Video</option>
                      </select>
                    )}

                    {/* Status Badge */}
                    {item.status === "pending" && (
                      <Badge tone="default">Ready</Badge>
                    )}
                    {item.status === "uploading" && (
                      <Badge tone="primary">
                        <Flex align="center" gap={1}>
                          <Spinner size={1} />
                          <span>Uploading...</span>
                        </Flex>
                      </Badge>
                    )}
                    {item.status === "creating" && (
                      <Badge tone="primary">
                        <Flex align="center" gap={1}>
                          <Spinner size={1} />
                          <span>Publishing...</span>
                        </Flex>
                      </Badge>
                    )}
                    {item.status === "success" && (
                      <Badge tone="positive">
                        <Flex align="center" gap={1}>
                          <CheckmarkCircleIcon />
                          <span>Published</span>
                        </Flex>
                      </Badge>
                    )}
                    {item.status === "error" && (
                      <Badge tone="critical">
                        <Flex align="center" gap={1}>
                          <ErrorOutlineIcon />
                          <span>Failed</span>
                        </Flex>
                      </Badge>
                    )}

                    {/* Remove button */}
                    {!isProcessing && item.status !== "success" && (
                      <Button
                        icon={TrashIcon}
                        mode="bleed"
                        tone="critical"
                        fontSize={1}
                        padding={2}
                        onClick={() => removeItem(item.id)}
                        title="Remove from queue"
                      />
                    )}
                  </Flex>
                </Flex>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}

export default BatchUploadKeepGoing;
