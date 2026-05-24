"use client";

import { ReactNode, useEffect } from "react";

export type MenuItem = {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  danger?: boolean;
};

/** A right-click context menu positioned at the cursor; closes on any outside click, scroll, or Escape. */
export function ContextMenu({
  x,
  y,
  items,
  onClose,
}: {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
}) {
  useEffect(() => {
    const close = () => onClose();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("click", close);
    window.addEventListener("resize", close);
    window.addEventListener("blur", close);
    document.addEventListener("scroll", close, true);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("resize", close);
      window.removeEventListener("blur", close);
      document.removeEventListener("scroll", close, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const W = 210;
  const estH = items.length * 36 + 12;
  const left = typeof window !== "undefined" ? Math.min(x, window.innerWidth - W - 8) : x;
  const top = typeof window !== "undefined" ? Math.min(y, window.innerHeight - estH - 8) : y;

  return (
    <div
      className="fixed z-[80] w-[210px] rounded-lg border border-black/40 bg-d-darkest p-1.5 shadow-2xl animate-fade-in"
      style={{ left, top }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {items.map((it, i) => (
        <button
          key={i}
          onClick={() => {
            it.onClick();
            onClose();
          }}
          className={`flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-left text-sm transition ${
            it.danger
              ? "text-dnd hover:bg-dnd hover:text-white"
              : "text-d-text hover:bg-blurple hover:text-white"
          }`}
        >
          {it.icon}
          {it.label}
        </button>
      ))}
    </div>
  );
}
