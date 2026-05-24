"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  async function register(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNote(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName.trim() || email.split("@")[0] } },
    });
    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }
    // Auto-confirm trigger means we can sign in right away.
    if (!data.session) {
      const { error: e2 } = await supabase.auth.signInWithPassword({ email, password });
      if (e2) {
        setLoading(false);
        setNote("Account created! You can now log in.");
        setTimeout(() => router.replace("/login"), 1500);
        return;
      }
    }
    router.replace("/app");
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-gradient-to-br from-blurple via-[#404eed] to-[#1e1f22]">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-d-mid p-8 shadow-2xl md:p-10">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-lg font-bold text-white"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-blurple text-white">
              <MessageCircle size={20} strokeWidth={2.2} />
            </span>
            Harmony
          </Link>

          <h1 className="text-2xl font-bold text-d-bright">Create an account</h1>
          <p className="mt-1 text-sm text-d-muted">
            Join Harmony and start talking in seconds.
          </p>

          <form className="mt-6 space-y-4" onSubmit={register}>
            <Field label="Display name">
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-md border border-black/30 bg-[#1e1f22] px-3 py-2.5 text-d-bright outline-none focus:border-blurple"
              />
            </Field>
            <Field label="Email" required>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full rounded-md border border-black/30 bg-[#1e1f22] px-3 py-2.5 text-d-bright outline-none focus:border-blurple"
              />
            </Field>
            <Field label="Password" required>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="At least 6 characters"
                className="w-full rounded-md border border-black/30 bg-[#1e1f22] px-3 py-2.5 text-d-bright outline-none focus:border-blurple"
              />
            </Field>

            {error && <p className="text-sm text-dnd">{error}</p>}
            {note && <p className="text-sm text-online">{note}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-blurple py-2.5 font-medium text-white transition hover:bg-blurple-hover disabled:opacity-60"
            >
              {loading ? "Creating account…" : "Continue"}
            </button>

            <p className="text-sm text-d-muted">
              <Link href="/login" className="font-medium text-blurple hover:underline">
                Already have an account?
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-d-muted">
        {label} {required && <span className="text-dnd">*</span>}
      </label>
      {children}
    </div>
  );
}
