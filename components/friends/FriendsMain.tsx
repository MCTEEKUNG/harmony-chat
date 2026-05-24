"use client";

import { useMemo, useState } from "react";
import { Users, UserPlus, Search } from "lucide-react";
import { Profile } from "@/lib/types";
import FriendRow from "./FriendRow";

type Tab = "online" | "all" | "pending" | "blocked";

export default function FriendsMain({ friends }: { friends: Profile[] }) {
  const [tab, setTab] = useState<Tab>("online");
  const [search, setSearch] = useState("");

  const online = useMemo(
    () => friends.filter((p) => p.status !== "offline"),
    [friends]
  );

  const visible = useMemo(() => {
    const base = tab === "online" ? online : tab === "all" ? friends : [];
    const q = search.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (p) =>
        p.display_name.toLowerCase().includes(q) ||
        p.username.toLowerCase().includes(q)
    );
  }, [tab, online, friends, search]);

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "online", label: "Online", count: online.length },
    { key: "all", label: "All", count: friends.length },
    { key: "pending", label: "Pending" },
    { key: "blocked", label: "Blocked" },
  ];

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-d-mid">
      {/* Header */}
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-black/20 px-4 shadow-sm shadow-black/10">
        <div className="flex items-center gap-2 text-d-bright">
          <Users size={20} className="text-d-muted" />
          <span className="font-semibold">Friends</span>
        </div>
        <div className="hidden h-6 w-px bg-d-active sm:block" />
        <nav className="flex items-center gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex shrink-0 items-center gap-1.5 rounded px-2.5 py-1 text-sm font-medium transition-colors ${
                tab === t.key
                  ? "bg-d-active text-d-bright"
                  : "text-d-muted hover:bg-d-hover hover:text-d-text"
              }`}
            >
              <span>{t.label}</span>
              {typeof t.count === "number" && t.count > 0 && (
                <span className="rounded bg-d-darkest px-1.5 text-xs text-d-muted">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </nav>
        <button
          type="button"
          className="ml-auto shrink-0 rounded bg-online px-2.5 py-1 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Add Friend
        </button>
      </header>

      {/* Body */}
      <div className="flex min-h-0 flex-1 flex-col px-6 pt-4">
        <div className="relative mb-4 shrink-0">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="h-9 w-full rounded bg-d-darkest pl-3 pr-9 text-sm text-d-text placeholder:text-d-muted focus:outline-none"
          />
          <Search
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-d-muted"
          />
        </div>

        <h2 className="mb-2 shrink-0 text-xs font-semibold uppercase tracking-wide text-d-muted">
          {tab === "online" && `Online — ${visible.length}`}
          {tab === "all" && `All Friends — ${visible.length}`}
          {tab === "pending" && "Pending"}
          {tab === "blocked" && "Blocked"}
        </h2>

        <div className="d-scroll min-h-0 flex-1 overflow-y-auto pb-4">
          {tab === "pending" ? (
            <EmptyState
              title="No pending requests"
              body="When someone wants to connect, their request will land right here."
            />
          ) : tab === "blocked" ? (
            <EmptyState
              title="You haven't blocked anyone"
              body="Blocked people will appear in this list."
            />
          ) : visible.length === 0 ? (
            <EmptyState
              title={
                search.trim()
                  ? "No one matches that search"
                  : tab === "online"
                    ? "No one's around right now"
                    : "No friends yet"
              }
              body={
                search.trim()
                  ? "Try a different name."
                  : "Once people join, you'll see them here."
              }
            />
          ) : (
            <ul className="divide-y divide-black/10">
              {visible.map((p) => (
                <FriendRow key={p.id} profile={p} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="mb-3 grid h-16 w-16 place-items-center rounded-full bg-d-dark text-d-muted">
        <UserPlus size={28} />
      </div>
      <h3 className="text-base font-semibold text-d-bright">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-d-muted">{body}</p>
    </div>
  );
}
