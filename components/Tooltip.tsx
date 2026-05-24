"use client";

import { ReactNode, useRef, useState } from "react";

/**
 * Dark hover tooltip styled like a chat app's server/icon tooltips.
 * Uses fixed positioning computed from the trigger rect so it escapes any
 * scroll-container overflow clipping.
 */
export function Tooltip({
  label,
  side = "right",
  children,
}: {
  label: string;
  side?: "right" | "top";
  children: ReactNode;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);

  function show() {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    if (side === "right") setCoords({ x: r.right + 12, y: r.top + r.height / 2 });
    else setCoords({ x: r.left + r.width / 2, y: r.top - 8 });
  }

  return (
    <span
      ref={ref}
      className="relative flex"
      onMouseEnter={show}
      onMouseLeave={() => setCoords(null)}
    >
      {children}
      {coords && (
        <span
          role="tooltip"
          style={{ left: coords.x, top: coords.y }}
          className={`pointer-events-none fixed z-[100] whitespace-nowrap rounded-md bg-[#111214] px-2.5 py-1.5 text-sm font-semibold text-white shadow-lg ${
            side === "right" ? "-translate-y-1/2" : "-translate-x-1/2 -translate-y-full"
          }`}
        >
          {label}
        </span>
      )}
    </span>
  );
}
