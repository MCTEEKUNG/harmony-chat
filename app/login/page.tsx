"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { DEMO_PASSWORD, DEMO_USERS } from "@/lib/types";
import { Avatar } from "@/components/Avatar";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [qrSrc, setQrSrc] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/app");
    });
    const origin = window.location.origin;
    setQrSrc(
      `https://api.qrserver.com/v1/create-qr-code/?size=170x170&margin=0&data=${encodeURIComponent(
        origin + "/login"
      )}`
    );
  }, [router]);

  async function signIn(em: string, pw: string) {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email: em, password: pw });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.replace("/app");
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-gradient-to-br from-blurple via-[#404eed] to-[#1e1f22]">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="flex w-full max-w-4xl overflow-hidden rounded-2xl bg-d-mid shadow-2xl">
          {/* Form panel */}
          <div className="flex-1 p-8 md:p-10">
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-2 text-lg font-bold text-white"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-blurple text-white">
                <MessageCircle size={20} strokeWidth={2.2} />
              </span>
              Harmony
            </Link>

            <h1 className="text-2xl font-bold text-d-bright">Welcome back!</h1>
            <p className="mt-1 text-sm text-d-muted">
              Log in to jump back into your communities.
            </p>

            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                signIn(email, password);
              }}
            >
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-d-muted">
                  Email <span className="text-dnd">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-md border border-black/30 bg-[#1e1f22] px-3 py-2.5 text-d-bright outline-none focus:border-blurple"
                  placeholder="alice@demo.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-d-muted">
                  Password <span className="text-dnd">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-md border border-black/30 bg-[#1e1f22] px-3 py-2.5 text-d-bright outline-none focus:border-blurple"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() =>
                    setNote("Password reset isn't available in this demo — use a demo account below.")
                  }
                  className="mt-1.5 text-sm font-medium text-blurple hover:underline"
                >
                  Forgot your password?
                </button>
              </div>

              {error && <p className="text-sm text-dnd">{error}</p>}
              {note && <p className="text-sm text-idle">{note}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-blurple py-2.5 font-medium text-white transition hover:bg-blurple-hover disabled:opacity-60"
              >
                {loading ? "Logging in…" : "Log In"}
              </button>

              <p className="text-sm text-d-muted">
                Need an account?{" "}
                <Link href="/register" className="font-medium text-blurple hover:underline">
                  Register
                </Link>
              </p>
            </form>

            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="mb-2 text-xs uppercase tracking-wide text-d-muted">
                Quick login (demo users)
              </p>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_USERS.map((u) => (
                  <button
                    key={u.email}
                    onClick={() => signIn(u.email, DEMO_PASSWORD)}
                    disabled={loading}
                    className="flex items-center gap-2 rounded-md bg-d-dark px-3 py-2 text-left transition hover:bg-d-hover disabled:opacity-60"
                  >
                    <Avatar alt={u.name} size={28} />
                    <span className="text-sm font-medium text-d-bright">{u.name}</span>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-d-muted">
                password for all demo users: <code className="text-d-text">password123</code>
              </p>
            </div>
          </div>

          {/* QR panel */}
          <div className="hidden w-72 flex-col items-center justify-center gap-5 border-l border-black/20 bg-d-dark p-8 lg:flex">
            <div className="rounded-2xl bg-white p-3 shadow-lg">
              {qrSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrSrc} alt="Login QR code" width={170} height={170} />
              ) : (
                <div className="h-[170px] w-[170px] animate-pulse rounded bg-zinc-200" />
              )}
            </div>
            <h2 className="text-xl font-bold text-d-bright">Log in with QR Code</h2>
            <p className="text-center text-sm text-d-muted">
              Scan this with the Harmony mobile app to log in instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
