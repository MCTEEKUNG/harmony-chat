"use client";

import Link from "next/link";
import {
  MessageCircle,
  MessageSquare,
  ShieldCheck,
  Users,
  Settings,
  MousePointerClick,
  IdCard,
  Zap,
  ArrowRight,
} from "lucide-react";
import { Reveal } from "@/components/Reveal";

const FEATURES = [
  {
    icon: <MessageSquare size={26} />,
    title: "Real-time chat",
    body: "Messages are written to Postgres and pushed to every open client through Supabase Realtime (a WebSocket channel). No refresh, no polling — you also get a live typing indicator and presence-driven online status.",
  },
  {
    icon: <ShieldCheck size={26} />,
    title: "Authentication",
    body: "Email + password sign-up and login via Supabase Auth, which issues a JWT and keeps the session fresh. New accounts auto-create a profile. Routes redirect based on session state.",
  },
  {
    icon: <Users size={26} />,
    title: "Roles & permissions",
    body: "Every server has an owner and members. Authorization is enforced in the database with Row Level Security — you can only edit or delete your own messages, and only an owner can create channels in their server. Rules live server-side, not just in the UI.",
  },
  {
    icon: <Settings size={26} />,
    title: "Server config",
    body: "Create a server and it comes with starter text and voice channels. The server header copies an invite code so others can join. Profiles and statuses are managed from a settings panel that saves straight to the database.",
  },
  {
    icon: <MousePointerClick size={26} />,
    title: "Quick actions",
    body: "Hover a message to edit or delete your own, collapse channel categories, and copy invite codes from the server header — the fast, keyboard-and-mouse interactions you expect from a desktop chat app.",
  },
  {
    icon: <IdCard size={26} />,
    title: "Profile card & settings",
    body: "Click any avatar or name to pop a profile card with status, roles and mutual servers. Your own settings panel updates display name, custom status, status and avatar with validation, a disabled-until-changed save button, and toasts.",
  },
];

const STACK_USED = [
  ["Next.js 16 + React 19", "App Router, TypeScript"],
  ["Tailwind CSS v4", "utility-first dark theme"],
  ["lucide-react", "open-source icon set"],
  ["Supabase Postgres", "relational database"],
  ["Supabase Auth", "JWT sessions"],
  ["Supabase Realtime", "WebSocket layer"],
  ["Row Level Security", "server-side authorization"],
  ["Vercel", "deployment"],
];

const CONCEPTS = [
  "REST / PostgREST data access",
  "WebSocket realtime events",
  "Authentication & authorization",
  "Role-based access control",
  "Relational schema & foreign keys",
  "React state management",
  "Responsive design",
  "XSS-safe rendering",
];

export default function ShowcasePage() {
  return (
    <div className="d-scroll h-screen overflow-y-auto bg-white text-zinc-900">
      {/* nav */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-200 bg-white/80 px-6 py-4 backdrop-blur">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-zinc-900">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-blurple text-white">
            <MessageCircle size={18} strokeWidth={2.4} />
          </span>
          Harmony
        </Link>
        <Link
          href="/app"
          className="flex items-center gap-1.5 rounded-full bg-blurple px-4 py-2 text-sm font-semibold text-white transition hover:bg-blurple-hover"
        >
          Open App <ArrowRight size={16} />
        </Link>
      </header>

      {/* hero */}
      <section className="bg-gradient-to-b from-blurple to-[#4651d4] px-6 py-24 text-center text-white">
        <Reveal>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">How Harmony works</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
            A guided tour of the chat, auth, roles, and real-time pieces that power the app — and
            the stack behind them.
          </p>
        </Reveal>
      </section>

      {/* features */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="grid gap-6 sm:grid-cols-2">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 2) * 100}>
              <div className="group h-full rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blurple/40 hover:shadow-xl">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blurple/10 text-blurple transition group-hover:bg-blurple group-hover:text-white">
                  {f.icon}
                </div>
                <h3 className="mt-4 text-xl font-bold">{f.title}</h3>
                <p className="mt-2 leading-relaxed text-zinc-600">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* tech stack used */}
      <section className="bg-zinc-100 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <div className="flex items-center gap-2">
              <Zap className="text-blurple" />
              <h2 className="text-3xl font-extrabold">Tech stack we actually use</h2>
            </div>
            <p className="mt-2 text-zinc-600">
              A Next.js + Supabase stack. Supabase Realtime is the WebSocket layer, Supabase Auth
              issues JWTs, and Postgres + Row Level Security is the database and permission system.
            </p>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STACK_USED.map(([name, desc], i) => (
              <Reveal key={name} delay={(i % 4) * 80}>
                <div className="rounded-xl border border-zinc-200 bg-white p-4 transition hover:-translate-y-1 hover:shadow-lg">
                  <p className="font-bold">{name}</p>
                  <p className="mt-1 text-sm text-zinc-500">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* concepts */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <Reveal>
          <h2 className="text-3xl font-extrabold">Concepts worth knowing</h2>
          <p className="mt-2 text-zinc-600">The ideas this project is built on.</p>
        </Reveal>
        <div className="mt-8 flex flex-wrap gap-3">
          {CONCEPTS.map((c, i) => (
            <Reveal key={c} delay={(i % 4) * 60}>
              <span className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm">
                {c}
              </span>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-b from-[#4651d4] to-blurple px-6 py-20 text-center text-white">
        <Reveal>
          <h2 className="text-3xl font-extrabold sm:text-4xl">See it in action</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/90">
            Jump in, send a message, hop into voice, and watch it sync in real time.
          </p>
          <Link
            href="/app"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-blurple shadow-lg transition hover:scale-105"
          >
            <MessageCircle size={20} /> Open Harmony
          </Link>
        </Reveal>
      </section>

      <footer className="bg-d-darkest px-6 py-8 text-center text-xs text-d-muted">
        © 2026 Harmony. A student project — not affiliated with or endorsed by Discord Inc.
      </footer>
    </div>
  );
}
