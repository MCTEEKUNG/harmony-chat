"use client";

import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Hash, Menu, Search, Smile, Users, X } from "lucide-react";
import { Channel, Message, Profile } from "@/lib/types";
import { searchMessages } from "@/lib/queries";
import MessageItem from "./MessageItem";
import { Avatar } from "./Avatar";

const GROUP_WINDOW_MS = 5 * 60 * 1000;

const EMOJIS = ["😀","😂","😍","👍","🎉","🔥","🚀","❤️","😎","🙌","✅","💯","👀","🤔","😅","🥳","☕","🎮","📌","✨","🙏","😭","🤝","💪"];

function DateDivider({ iso }: { iso: string }) {
  const label = new Date(iso).toLocaleDateString([], {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return (
    <div className="relative my-4 flex items-center px-4">
      <div className="h-px flex-1 bg-d-hover" />
      <span className="px-2 text-xs font-semibold text-d-muted">{label}</span>
      <div className="h-px flex-1 bg-d-hover" />
    </div>
  );
}

export default function ChatArea({
  channel,
  channels,
  messages,
  me,
  hasMore,
  loadingMore,
  onSend,
  onEdit,
  onDelete,
  onLoadMore,
  onSelectChannel,
  onOpenNav,
  onTyping,
  typingNames,
  onToggleMembers,
  onShowProfile,
}: {
  channel: Channel | null;
  channels: Channel[];
  messages: Message[];
  me: Profile | null;
  hasMore: boolean;
  loadingMore: boolean;
  onSend: (content: string) => void;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onLoadMore: () => void;
  onSelectChannel: (id: string) => void;
  onOpenNav: () => void;
  onTyping: () => void;
  typingNames: string[];
  onToggleMembers: () => void;
  onShowProfile: (userId: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevHeightRef = useRef(0);
  const stickRef = useRef(true);
  const prependRef = useRef(false);
  const [draft, setDraft] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);

  // search
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Message[] | null>(null);
  const [searching, setSearching] = useState(false);

  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (el.scrollTop < 60 && hasMore && !loadingMore) {
      prevHeightRef.current = el.scrollHeight;
      prependRef.current = true;
      onLoadMore();
    }
  }

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (prependRef.current) {
      el.scrollTop = el.scrollHeight - prevHeightRef.current;
      prependRef.current = false;
    } else if (stickRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    stickRef.current = true;
  }, [channel?.id]);

  // Clear search when switching servers (channel set changes)
  const serverId = channels[0]?.server_id;
  useEffect(() => {
    setResults(null);
    setSearchTerm("");
  }, [serverId]);

  async function runSearch(term: string) {
    setSearchTerm(term);
    if (!term.trim()) {
      setResults(null);
      return;
    }
    setSearching(true);
    const ids = channels.filter((c) => c.type === "text").map((c) => c.id);
    const r = await searchMessages(term, ids);
    setResults(r);
    setSearching(false);
  }

  if (!channel) {
    return (
      <main className="relative flex flex-1 items-center justify-center bg-d-chat text-d-muted">
        <button
          onClick={onOpenNav}
          title="Channels"
          className="absolute left-3 top-3 rounded p-2 text-d-muted hover:bg-d-hover md:hidden"
        >
          <Menu size={20} />
        </button>
        Select a channel to start chatting.
      </main>
    );
  }

  const channelName = (id: string) => channels.find((c) => c.id === id)?.name ?? "unknown";

  return (
    <main className="relative flex min-w-0 flex-1 flex-col bg-d-chat">
      <header className="flex h-12 shrink-0 items-center gap-2 px-3 shadow-sm shadow-black/30 sm:px-4">
        <button
          onClick={onOpenNav}
          title="Channels"
          className="-ml-1 shrink-0 rounded p-1 text-d-muted hover:bg-d-hover md:hidden"
        >
          <Menu size={20} />
        </button>
        <Hash size={22} className="shrink-0 text-d-muted" />
        <h2 className="min-w-0 flex-1 truncate font-semibold text-d-bright">{channel.name}</h2>
        <div className="flex shrink-0 items-center gap-1">
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-d-muted"
            />
            <input
              value={searchTerm}
              onChange={(e) => runSearch(e.target.value)}
              placeholder="Search"
              className="w-28 rounded bg-d-darkest py-1.5 pl-8 pr-3 text-sm text-d-text outline-none transition-all sm:w-44 sm:focus:w-56"
            />
          </div>
          <button
            onClick={onToggleMembers}
            title="Members"
            className="rounded p-1.5 text-d-muted hover:bg-d-hover hover:text-d-text lg:hidden"
          >
            <Users size={20} />
          </button>
        </div>
      </header>

      {/* Search results overlay */}
      {results !== null && (
        <div className="absolute right-2 top-12 z-20 max-h-[60vh] w-96 overflow-y-auto rounded-md border border-black/40 bg-d-dark shadow-2xl d-scroll">
          <div className="flex items-center justify-between border-b border-black/30 px-3 py-2">
            <span className="text-xs font-semibold uppercase text-d-muted">
              {searching ? "Searching…" : `${results.length} result(s)`}
            </span>
            <button
              onClick={() => {
                setResults(null);
                setSearchTerm("");
              }}
              className="flex items-center gap-1 text-xs text-d-muted hover:text-d-text"
            >
              <X size={12} /> close
            </button>
          </div>
          {results.length === 0 && !searching && (
            <p className="px-3 py-4 text-sm text-d-muted">No messages found.</p>
          )}
          <ul>
            {results.map((m) => (
              <li key={m.id}>
                <button
                  onClick={() => {
                    onSelectChannel(m.channel_id);
                    setResults(null);
                    setSearchTerm("");
                  }}
                  className="flex w-full gap-2 border-b border-black/20 px-3 py-2 text-left hover:bg-d-hover"
                >
                  <Avatar src={m.profile?.avatar_url} alt={m.profile?.display_name ?? "?"} size={28} />
                  <div className="min-w-0">
                    <p className="text-xs text-d-muted">
                      <span className="font-semibold text-d-text">
                        {m.profile?.display_name}
                      </span>{" "}
                      in #{channelName(m.channel_id)}
                    </p>
                    <p className="truncate text-sm text-d-text">{m.content}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} onScroll={onScroll} className="d-scroll flex-1 overflow-y-auto py-4">
        {hasMore ? (
          <div className="py-2 text-center text-xs text-d-muted">
            {loadingMore ? "Loading earlier messages…" : "Scroll up for more"}
          </div>
        ) : (
          <div className="px-4 pb-2 pt-6">
            <div className="mb-3 flex h-[68px] w-[68px] items-center justify-center rounded-full bg-d-hover">
              <Hash size={40} className="text-d-bright" />
            </div>
            <h3 className="text-3xl font-extrabold text-d-bright">
              Welcome to #{channel.name}!
            </h3>
            <p className="mt-1 text-d-muted">
              This is the start of the #{channel.name} channel.
            </p>
          </div>
        )}

        {messages.map((m, i) => {
          const prev = messages[i - 1];
          const sameDay =
            !!prev &&
            new Date(prev.created_at).toDateString() ===
              new Date(m.created_at).toDateString();
          const grouped =
            !!prev &&
            sameDay &&
            prev.user_id === m.user_id &&
            new Date(m.created_at).getTime() - new Date(prev.created_at).getTime() <
              GROUP_WINDOW_MS;
          return (
            <Fragment key={m.id}>
              {!sameDay && <DateDivider iso={m.created_at} />}
              <MessageItem
                message={m}
                isMine={m.user_id === me?.id}
                grouped={grouped}
                onEdit={onEdit}
                onDelete={onDelete}
                onShowProfile={onShowProfile}
              />
            </Fragment>
          );
        })}
      </div>

      {/* Typing indicator */}
      <div className="h-5 px-4 text-xs text-d-muted">
        {typingNames.length > 0 && (
          <span className="animate-fade-in">
            <span className="font-semibold text-d-text">{typingNames.join(", ")}</span>
            {typingNames.length === 1 ? " is typing" : " are typing"}
            <span className="ml-0.5 inline-flex">
              <span className="animate-pulse">.</span>
              <span className="animate-pulse [animation-delay:0.15s]">.</span>
              <span className="animate-pulse [animation-delay:0.3s]">.</span>
            </span>
          </span>
        )}
      </div>

      {/* Composer */}
      <form
        className="px-4 pb-5 pt-1"
        onSubmit={(e) => {
          e.preventDefault();
          const v = draft.trim();
          if (!v) return;
          onSend(v);
          setDraft("");
        }}
      >
        <div className="relative flex items-end gap-2 rounded-lg bg-[#383a40] px-4 py-2.5">
          <textarea
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              onTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                const v = draft.trim();
                if (!v) return;
                onSend(v);
                setDraft("");
              }
            }}
            rows={1}
            placeholder={`Message #${channel.name}`}
            className="max-h-40 flex-1 resize-none bg-transparent text-d-text outline-none placeholder:text-d-muted"
          />

          <div className="relative">
            <button
              type="button"
              onClick={() => setEmojiOpen((v) => !v)}
              title="Emoji"
              className="grid h-8 w-8 place-items-center rounded text-d-muted transition-colors hover:text-d-text"
            >
              <Smile size={22} />
            </button>
            {emojiOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setEmojiOpen(false)} />
                <div className="absolute bottom-11 right-0 z-20 grid w-64 grid-cols-6 gap-1 rounded-lg border border-black/40 bg-d-dark p-2 shadow-2xl animate-fade-in">
                  {EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => {
                        setDraft((d) => d + e);
                        setEmojiOpen(false);
                      }}
                      className="rounded p-1 text-xl transition-transform hover:scale-125 hover:bg-d-hover"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            type="submit"
            className="rounded bg-blurple px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blurple-hover"
          >
            Send
          </button>
        </div>
      </form>
    </main>
  );
}
