#!/usr/bin/env node

/**
 * CLI script to batch upload images, GIFs, and videos from a local directory
 * into the Sanity "Keep Going" collection.
 *
 * Usage:
 *   npm run upload:keep-going -- /path/to/directory
 *   node scripts/batch-upload-keep-going.mjs /path/to/directory
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "next-sanity";
import { LexoRank } from "lexorank";

// Supported extensions
const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".svg"]);
const GIF_EXTS = new Set([".gif"]);
const VIDEO_EXTS = new Set([".mp4", ".mov", ".webm", ".m4v", ".avi", ".mkv"]);

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, "utf-8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  }
  return env;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getNextRank(currentRankStr) {
  try {
    if (currentRankStr) {
      return LexoRank.parse(currentRankStr).genNext().genNext().toString();
    }
  } catch {
    // fallback
  }
  return LexoRank.min().genNext().genNext().toString();
}

async function main() {
  const localEnv = loadEnvFile(path.resolve(process.cwd(), ".env.local"));
  const token =
    process.env.SANITY_API_WRITE_TOKEN ||
    process.env.SANITY_AUTH_TOKEN ||
    process.env.SANITY_TOKEN ||
    localEnv.SANITY_API_WRITE_TOKEN ||
    localEnv.SANITY_AUTH_TOKEN ||
    localEnv.SANITY_TOKEN;

  const targetDir = process.argv[2];

  if (!targetDir) {
    console.log(`
Usage:
  npm run upload:keep-going -- <directory-path>
  node scripts/batch-upload-keep-going.mjs <directory-path>

Example:
  npm run upload:keep-going -- ~/Pictures/keep-going
`);
    process.exit(1);
  }

  const resolvedDir = path.resolve(process.cwd(), targetDir);
  if (!fs.existsSync(resolvedDir) || !fs.statSync(resolvedDir).isDirectory()) {
    console.error(`Error: Directory not found: ${resolvedDir}`);
    process.exit(1);
  }

  if (!token) {
    console.error(`
Error: No Sanity write token found!

To upload via CLI, set SANITY_API_WRITE_TOKEN in .env.local:
  1. Go to https://sanity.io/manage
  2. Select your project ("naas.work" / ouskx1kr) -> API -> Tokens
  3. Create an "Editor" or "Contributor" write token
  4. Add to .env.local:
     SANITY_API_WRITE_TOKEN="your-token"

Tip: You can also batch upload directly from the browser WITHOUT any token!
  1. Run 'npm run dev'
  2. Open http://localhost:3000/studio
  3. Click "Keep Going (Batch Upload)" in the sidebar or "Batch Upload" in the top bar!
`);
    process.exit(1);
  }

  const client = createClient({
    projectId: "ouskx1kr",
    dataset: "production",
    useCdn: false,
    apiVersion: "2024-01-01",
    token,
  });

  // Read and filter files
  const allEntries = fs.readdirSync(resolvedDir);
  const collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: "base",
  });
  const files = allEntries
    .filter((name) => {
      const ext = path.extname(name).toLowerCase();
      return IMAGE_EXTS.has(ext) || GIF_EXTS.has(ext) || VIDEO_EXTS.has(ext);
    })
    .sort(collator.compare);

  if (files.length === 0) {
    console.log(`No supported image or video files found in ${resolvedDir}.`);
    process.exit(0);
  }

  console.log(`\nFound ${files.length} file(s) to upload in ${resolvedDir}:`);
  files.forEach((f, idx) => {
    const stat = fs.statSync(path.join(resolvedDir, f));
    console.log(`  [${idx + 1}] ${f} (${formatBytes(stat.size)})`);
  });

  console.log(`\nQuerying existing Keep Going documents to preserve ordering...`);
  const lastRank = await client.fetch(
    `*[_type == "keepGoing"] | order(orderRank desc)[0].orderRank`
  );
  let currentRankStr = getNextRank(lastRank || undefined);

  console.log(`Starting upload...\n`);
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const filePath = path.join(resolvedDir, filename);
    const ext = path.extname(filename).toLowerCase();
    const stat = fs.statSync(filePath);

    let mediaType = "image";
    if (GIF_EXTS.has(ext)) {
      mediaType = "gif";
    } else if (VIDEO_EXTS.has(ext)) {
      mediaType = "video";
    }

    const isVideo = mediaType === "video";
    const assetType = isVideo ? "file" : "image";

    process.stdout.write(
      `[${i + 1}/${files.length}] Uploading ${filename} (${formatBytes(stat.size)}, ${mediaType.toUpperCase()})... `
    );

    try {
      const stream = fs.createReadStream(filePath);
      const asset = await client.assets.upload(assetType, stream, {
        filename,
      });

      const doc = {
        _type: "keepGoing",
        mediaType,
        orderRank: currentRankStr,
      };

      if (isVideo) {
        doc.video = {
          _type: "file",
          asset: {
            _type: "reference",
            _ref: asset._id,
          },
        };
      } else {
        doc.image = {
          _type: "image",
          asset: {
            _type: "reference",
            _ref: asset._id,
          },
        };
      }

      const created = await client.create(doc);
      currentRankStr = getNextRank(currentRankStr);
      successCount++;
      console.log(`✓ Published (ID: ${created._id})`);
    } catch (err) {
      failCount++;
      console.log(`✗ Failed: ${err.message}`);
    }
  }

  console.log(`\n========================================`);
  console.log(
    `Finished: ${successCount} succeeded, ${failCount} failed out of ${files.length} file(s).`
  );
  console.log(`========================================\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
