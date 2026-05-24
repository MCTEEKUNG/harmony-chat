"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Message } from "@/lib/types";
import { Avatar } from "./Avatar";

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtShort(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const IMAGE_EXT_RE = /\.(gif|png|jpe?g|webp|svg)$/i;
const MEDIA_HOSTS = ["picsum.photos", "api.dicebear.com"];

// Returns the trimmed URL if `content` is a single bare http(s) image/media URL,
// otherwise null (so the message renders as text).
function mediaUrl(content: string): string | null {
  const trimmed = content.trim();
  // Must be a single token (no whitespace) so normal text with a link stays text.
  if (!trimmed || /\s/.test(trimmed)) return null;
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  const host = parsed.hostname.toLowerCase();
  if (MEDIA_HOSTS.includes(host)) return trimmed;
  if (IMAGE_EXT_RE.test(parsed.pathname)) return trimmed;
  return null;
}

export default function MessageItem({
  message,
  isMine,
  grouped,
  highlight,
  onEdit,
  onDelete,
  onShowProfile,
}: {
  message: Message;
  isMine: boolean;
  grouped: boolean;
  highlight?: string;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onShowProfile?: (userId: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);
  const name = message.profile?.display_name ?? "Unknown";
  const media = mediaUrl(message.content);

  function save() {
    const v = draft.trim();
    if (v && v !== message.content) onEdit(message.id, v);
    setEditing(false);
  }

  return (
    <div
      className={`group relative flex gap-3 px-4 hover:bg-white/[0.03] ${
        grouped ? "py-0.5" : "mt-3 py-0.5"
      }`}
    >
      <div className="w-10 shrink-0">
        {!grouped ? (
          <button onClick={() => onShowProfile?.(message.user_id)} className="rounded-full hover:opacity-80">
            <Avatar src={message.profile?.avatar_url} alt={name} size={40} />
          </button>
        ) : (
          <span className="hidden select-none pr-1 pt-1 text-right text-[10px] leading-5 text-d-muted tabular-nums group-hover:block">
            {fmtShort(message.created_at)}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        {!grouped && (
          <div className="flex items-baseline gap-2">
            <button
              onClick={() => onShowProfile?.(message.user_id)}
              className="text-sm font-semibold text-d-bright hover:underline"
            >
              {name}
            </button>
            <span className="text-xs text-d-muted">{fmtTime(message.created_at)}</span>
          </div>
        )}

        {editing ? (
          <div className="mt-1">
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  save();
                }
                if (e.key === "Escape") setEditing(false);
              }}
              className="w-full resize-none rounded-md bg-d-darkest px-3 py-2 text-d-text outline-none"
              rows={Math.min(6, draft.split("\n").length)}
            />
            <p className="mt-1 text-xs text-d-muted">
              escape to{" "}
              <button className="text-blurple hover:underline" onClick={() => setEditing(false)}>
                cancel
              </button>{" "}
              • enter to{" "}
              <button className="text-blurple hover:underline" onClick={save}>
                save
              </button>
            </p>
          </div>
        ) : media ? (
          <div className="mt-1">
            <a href={media} target="_blank" rel="noopener noreferrer" className="inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={media}
                alt="attachment"
                loading="lazy"
                className="max-h-80 max-w-xs rounded-lg object-contain"
              />
            </a>
            {message.edited_at && (
              <span className="ml-1 text-[10px] text-d-muted">(edited)</span>
            )}
          </div>
        ) : (
          <p className="whitespace-pre-wrap break-words text-d-text">
            {highlight ? highlightText(message.content, highlight) : message.content}
            {message.edited_at && (
              <span className="ml-1 text-[10px] text-d-muted">(edited)</span>
            )}
          </p>
        )}
      </div>

      {isMine && !editing && (
        <div className="absolute right-3 top-[-10px] hidden gap-1 rounded-md border border-black/30 bg-d-dark p-0.5 shadow group-hover:flex">
          <button
            onClick={() => {
              setDraft(message.content);
              setEditing(true);
            }}
            title="Edit"
            className="rounded p-1.5 text-d-muted hover:bg-d-hover hover:text-d-text"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(message.id)}
            title="Delete"
            className="rounded p-1.5 text-dnd hover:bg-dnd hover:text-white"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

function highlightText(text: string, term: string) {
  const idx = text.toLowerCase().indexOf(term.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-idle/40 text-d-bright">{text.slice(idx, idx + term.length)}</mark>
      {text.slice(idx + term.length)}
    </>
  );
}
