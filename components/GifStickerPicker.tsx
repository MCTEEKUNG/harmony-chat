"use client";

import { useEffect, useMemo, useState } from "react";
import { Film, Search, Sticker } from "lucide-react";
import { GIFS, STICKERS, MediaItem } from "@/lib/mockMedia";

type Tab = "gif" | "stickers";

export default function GifStickerPicker({
  initialTab = "gif",
  onSelect,
  onClose,
}: {
  initialTab?: Tab;
  onSelect: (url: string) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [query, setQuery] = useState("");

  // Close on Escape.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const items = tab === "gif" ? GIFS : STICKERS;

  const filtered = useMemo<MediaItem[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) => it.id.toLowerCase().includes(q) || it.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [items, query]);

  return (
    <>
      {/* Click-outside backdrop */}
      <div className="fixed inset-0 z-30" onClick={onClose} />

      <div className="absolute bottom-11 right-0 z-40 flex h-80 w-80 flex-col overflow-hidden rounded-lg border border-black/40 bg-d-dark shadow-2xl animate-fade-in">
        {/* Tabs */}
        <div className="flex shrink-0 gap-1 border-b border-black/30 p-2">
          <button
            type="button"
            onClick={() => setTab("gif")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded px-2 py-1.5 text-sm font-medium transition-colors ${
              tab === "gif" ? "bg-blurple text-white" : "text-d-muted hover:bg-d-hover hover:text-d-text"
            }`}
          >
            <Film size={16} /> GIF
          </button>
          <button
            type="button"
            onClick={() => setTab("stickers")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded px-2 py-1.5 text-sm font-medium transition-colors ${
              tab === "stickers" ? "bg-blurple text-white" : "text-d-muted hover:bg-d-hover hover:text-d-text"
            }`}
          >
            <Sticker size={16} /> Stickers
          </button>
        </div>

        {/* Search */}
        <div className="relative shrink-0 p-2">
          <Search
            size={14}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-d-muted"
          />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${tab === "gif" ? "GIFs" : "stickers"}`}
            className="w-full rounded bg-d-darkest py-1.5 pl-8 pr-3 text-sm text-d-text outline-none placeholder:text-d-muted"
          />
        </div>

        {/* Grid */}
        <div className="d-scroll flex-1 overflow-y-auto px-2 pb-2">
          {filtered.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-d-muted">No results.</p>
          ) : (
            <div className={`grid gap-2 ${tab === "gif" ? "grid-cols-2" : "grid-cols-4"}`}>
              {filtered.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => {
                    onSelect(it.url);
                    onClose();
                  }}
                  title={it.tags.join(", ")}
                  className="overflow-hidden rounded-md bg-d-darkest transition-transform hover:scale-105 hover:ring-2 hover:ring-blurple"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={it.url}
                    alt={it.tags[0] ?? it.id}
                    loading="lazy"
                    className={
                      tab === "gif"
                        ? "h-24 w-full object-cover"
                        : "aspect-square w-full object-contain p-1"
                    }
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
