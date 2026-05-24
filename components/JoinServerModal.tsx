"use client";

import { useState } from "react";
import { Check, Plus, Compass, ArrowLeft } from "lucide-react";
import { Profile } from "@/lib/types";
import { previewInvite, joinServer, createServer, ServerPreview } from "@/lib/queries";

export default function JoinServerModal({
  me,
  onClose,
  onJoined,
}: {
  me: Profile;
  onClose: () => void;
  onJoined: (serverId: string) => void;
}) {
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [preview, setPreview] = useState<ServerPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    if (!name.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const server = await createServer(name, me.id);
      onJoined(server.id);
    } catch {
      setError("Could not create the server. Please try again.");
      setLoading(false);
    }
  }

  async function lookup() {
    setError(null);
    setPreview(null);
    setLoading(true);
    try {
      const p = await previewInvite(code, me.id);
      if (!p) setError("No server found for that invite code.");
      else setPreview(p);
    } catch {
      setError("Something went wrong looking up that code.");
    }
    setLoading(false);
  }

  async function confirm() {
    if (!preview) return;
    setLoading(true);
    try {
      await joinServer(preview.id, me.id);
      onJoined(preview.id);
    } catch {
      setError("Could not join this server.");
      setLoading(false);
    }
  }

  return (
    <Backdrop onClose={onClose}>
      <div className="w-full max-w-md rounded-xl bg-d-mid p-6 shadow-2xl">
        {/* ---- Choose ---- */}
        {mode === "choose" && (
          <>
            <h2 className="text-center text-2xl font-bold text-d-bright">Add a Server</h2>
            <p className="mt-1 text-center text-sm text-d-muted">
              Your server is where you and your friends hang out. Make one or join an existing one.
            </p>
            <div className="mt-5 space-y-3">
              <ChooseRow
                icon={<Plus size={20} />}
                color="bg-blurple"
                title="Create My Own"
                subtitle="Start a brand-new server"
                onClick={() => {
                  setError(null);
                  setMode("create");
                }}
              />
              <ChooseRow
                icon={<Compass size={20} />}
                color="bg-online"
                title="Join a Server"
                subtitle="Enter an invite to join an existing one"
                onClick={() => {
                  setError(null);
                  setMode("join");
                }}
              />
            </div>
            <button
              onClick={onClose}
              className="mt-5 w-full rounded-md py-2 text-sm text-d-muted hover:text-d-text"
            >
              Cancel
            </button>
          </>
        )}

        {/* ---- Create ---- */}
        {mode === "create" && (
          <>
            <BackBtn onClick={() => { setError(null); setMode("choose"); }} />
            <h2 className="text-xl font-bold text-d-bright">Create your server</h2>
            <p className="mt-1 text-sm text-d-muted">
              Give your new server a name — it comes with starter channels.
            </p>
            <div className="mt-4">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-d-muted">
                Server name
              </label>
              <input
                value={name}
                autoFocus
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && create()}
                placeholder="My Awesome Server"
                className="w-full rounded-md border border-black/30 bg-[#1e1f22] px-3 py-2.5 text-d-bright outline-none focus:border-blurple"
              />
            </div>
            {error && <p className="mt-3 text-sm text-dnd">{error}</p>}
            <button
              onClick={create}
              disabled={loading || !name.trim()}
              className="mt-4 w-full rounded-md bg-blurple py-2.5 font-medium text-white hover:bg-blurple-hover disabled:opacity-50"
            >
              {loading ? "Creating…" : "Create Server"}
            </button>
          </>
        )}

        {/* ---- Join ---- */}
        {mode === "join" && (
          <>
            <BackBtn
              onClick={() => {
                setError(null);
                setPreview(null);
                setMode("choose");
              }}
            />
            <h2 className="text-xl font-bold text-d-bright">Join a Server</h2>
            <p className="mt-1 text-sm text-d-muted">
              Enter an invite code below to join an existing server.
            </p>

            <div className="mt-4">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-d-muted">
                Invite code
              </label>
              <div className="flex gap-2">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && lookup()}
                  placeholder="design-hub"
                  className="flex-1 rounded-md border border-black/30 bg-[#1e1f22] px-3 py-2 text-d-bright outline-none focus:border-blurple"
                />
                <button
                  onClick={lookup}
                  disabled={loading || !code.trim()}
                  className="rounded-md bg-d-dark px-4 font-medium text-d-text hover:bg-d-hover disabled:opacity-50"
                >
                  Look up
                </button>
              </div>
              <p className="mt-1 text-xs text-d-muted">
                Try <code className="text-d-text">design-hub</code>
              </p>
            </div>

            {error && <p className="mt-3 text-sm text-dnd">{error}</p>}

            {preview && (
              <div className="mt-4 rounded-lg bg-d-darkest p-4">
                <div className="flex items-center gap-3">
                  {preview.icon_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={preview.icon_url}
                      alt={preview.name}
                      className="h-14 w-14 rounded-2xl bg-d-dark object-cover"
                    />
                  ) : (
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-d-dark text-lg font-semibold text-d-text">
                      {preview.name
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-bold text-d-bright">{preview.name}</p>
                    <p className="text-sm text-d-muted">{preview.member_count} member(s)</p>
                  </div>
                </div>

                {preview.already_member ? (
                  <p className="mt-4 flex items-center gap-1.5 text-sm text-online">
                    <Check size={16} /> You&apos;re already a member of this server.
                  </p>
                ) : (
                  <button
                    onClick={confirm}
                    disabled={loading}
                    className="mt-4 w-full rounded-md bg-online py-2.5 font-medium text-white hover:brightness-110 disabled:opacity-60"
                  >
                    {loading ? "Joining…" : `Join ${preview.name}`}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Backdrop>
  );
}

function ChooseRow({
  icon,
  color,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  color: string;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg border border-white/10 bg-d-dark px-4 py-3 text-left transition hover:border-blurple hover:bg-d-hover"
    >
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-white ${color}`}>
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block font-semibold text-d-bright">{title}</span>
        <span className="block text-xs text-d-muted">{subtitle}</span>
      </span>
    </button>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mb-3 flex items-center gap-1 text-sm text-d-muted hover:text-d-text"
    >
      <ArrowLeft size={16} /> Back
    </button>
  );
}

export function Backdrop({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#0b0b12]/75 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}
