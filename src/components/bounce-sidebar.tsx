"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import Link from "next/link";
import { motion, useAnimate } from "motion/react";
import { arc } from "motion";
import { cn } from "@/lib/utils";

/*
 * Adapted from Rare UI's BounceSidebar (https://www.rareui.com/components/bouncesidebar).
 *
 * Changes made for this project:
 *  - Active/inactive colours use this site's theme tokens instead of Tailwind's
 *    `text-foreground`, which maps to --foreground here rather than the
 *    --text-color / --heading-color / --text-muted-color palette the rest of
 *    the site uses.
 *  - The dot defaults to the site accent (--link-color) instead of Rare UI's
 *    hardcoded orange, so it follows the theme.
 *  - `data-active` is emitted as a string: React drops `data-active={false}`
 *    from the DOM entirely rather than writing "false".
 *  - The dot offset is measured against the list's own coordinate space, and
 *    re-measured if the list resizes (long headings wrapping), which the
 *    original only did on mount and font load.
 */

const MotionLink = motion.create(Link);

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Diameter of the travelling dot, in CSS pixels. */
const DOT_BASE = 6;

export type BounceSidebarItem =
  | string
  | { label: string; href?: string }
  | { label: string; heading: true };

export type BounceSidebarProps = Omit<ComponentProps<"ul">, "onChange"> & {
  items: BounceSidebarItem[];
  value?: number;
  defaultValue?: number;
  onChange?: (index: number) => void;
  dotColor?: string;
};

export function BounceSidebar({
  items,
  value,
  defaultValue = 0,
  onChange,
  dotColor,
  className,
  ...props
}: BounceSidebarProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const activeIndex = value ?? internalValue;

  const [dot, animate] = useAnimate<HTMLSpanElement>();
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const listRef = useRef<HTMLUListElement | null>(null);
  const prevY = useRef<number | null>(null);

  const [ready, setReady] = useState(false);

  /**
   * The dot's diameter, snapped to whole device pixels so it is not blurred by
   * subpixel rendering. Applied straight to the DOM rather than held in state:
   * it depends on window.devicePixelRatio, which does not exist during SSR, and
   * setting state from an effect would cause a cascading render.
   */
  const applyDotSize = (el: HTMLSpanElement) => {
    const dpr = window.devicePixelRatio || 1;
    const size = Math.round(DOT_BASE * dpr) / dpr;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    return size;
  };

  /**
   * Centre offset of a row, relative to the list, snapped to device pixels.
   * Defined in each effect's closure rather than as a shared helper so the
   * dependency arrays stay honest.
   */
  const measureRow = (index: number, size: number): number | null => {
    const el = itemRefs.current[index];
    if (!el) return null;
    const dpr = window.devicePixelRatio || 1;
    return Math.round((el.offsetTop + el.offsetHeight / 2 - size / 2) * dpr) / dpr;
  };

  // Position without animating on first paint, or the dot flies in from 0.
  useIsomorphicLayoutEffect(() => {
    let cancelled = false;

    const snap = () => {
      if (cancelled || !dot.current) return;
      const size = applyDotSize(dot.current);
      const toY = measureRow(activeIndex, size);
      if (toY === null) return;
      animate(dot.current, { x: 0, y: toY }, { duration: 0 });
      prevY.current = toY;
      setReady(true);
    };

    snap();
    const raf = requestAnimationFrame(snap);
    // Web fonts land after first paint and change row heights.
    document.fonts?.ready.then(snap);

    // Re-snap whenever the list geometry changes (wrapping headings, resize).
    const list = listRef.current;
    const observer = list ? new ResizeObserver(snap) : null;
    if (list && observer) observer.observe(list);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      observer?.disconnect();
    };
    // Runs once: this establishes the dot's initial position. Later changes are
    // handled by the animation effect below.
  }, []);

  // Animate on subsequent changes, arcing rather than travelling in a line.
  useEffect(() => {
    if (!dot.current) return;
    const dpr = window.devicePixelRatio || 1;
    const size = Math.round(DOT_BASE * dpr) / dpr;
    const el = itemRefs.current[activeIndex];
    if (!el) return;

    const toY =
      Math.round((el.offsetTop + el.offsetHeight / 2 - size / 2) * dpr) / dpr;

    if (prevY.current === null) {
      animate(dot.current, { x: 0, y: toY }, { duration: 0 });
      prevY.current = toY;
      return;
    }

    const fromY = prevY.current;
    const delta = toY - fromY;
    prevY.current = toY;
    if (delta === 0) return;

    const distance = Math.abs(delta);
    const path = arc({
      strength: Math.min(0.8, 14 / distance),
      direction: delta > 0 ? "ccw" : "cw",
    });

    animate(
      dot.current,
      { x: 0, y: toY },
      { duration: 0.25, ease: "easeOut", path }
    );
  }, [activeIndex, animate, dot]);

  const select = (index: number) => {
    if (value === undefined) setInternalValue(index);
    onChange?.(index);
  };

  return (
    <ul
      ref={listRef}
      data-slot="bounce-sidebar"
      className={cn("relative flex flex-col gap-1 pl-6", className)}
      {...props}
    >
      <span
        ref={dot}
        aria-hidden
        className="absolute left-2 top-0 rounded-full transition-opacity duration-150"
        style={{
          // The layout effect rewrites these to the device-pixel-snapped size.
          width: DOT_BASE,
          height: DOT_BASE,
          backgroundColor: dotColor ?? "var(--link-color)",
          opacity: ready ? 1 : 0,
        }}
      />

      {items.map((item, index) => {
        const label = typeof item === "string" ? item : item.label;

        if (typeof item !== "string" && "heading" in item) {
          return (
            <li
              key={`${index}-${label}`}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              role="presentation"
              data-slot="bounce-sidebar-heading"
              className="px-1 pb-1 pt-7 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted-color)] first:pt-0"
            >
              {label}
            </li>
          );
        }

        const href = typeof item === "string" ? undefined : item.href;
        const isActive = index === activeIndex;
        const itemClassName = cn(
          "flex w-full cursor-pointer items-center rounded-lg p-1 text-left text-sm transition-colors duration-200",
          isActive
            ? "text-[color:var(--heading-color)]"
            : "text-[color:var(--text-muted-color)] hover:text-[color:var(--text-color)]"
        );

        return (
          <li
            key={`${index}-${label}`}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
          >
            {href ? (
              <MotionLink
                href={href}
                data-slot="bounce-sidebar-item"
                data-active={String(isActive)}
                aria-current={isActive ? "page" : undefined}
                onClick={() => select(index)}
                className={itemClassName}
              >
                {label}
              </MotionLink>
            ) : (
              <motion.button
                type="button"
                data-slot="bounce-sidebar-item"
                data-active={String(isActive)}
                aria-current={isActive ? "true" : undefined}
                onClick={() => select(index)}
                className={itemClassName}
              >
                {label}
              </motion.button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
