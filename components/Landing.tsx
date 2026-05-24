import Link from "next/link";
import { MessageCircle, Mic, Search, Users, Sparkles, ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="d-scroll h-screen overflow-y-auto bg-white text-zinc-900">
      {/* ===== Hero ===== */}
      <div className="relative overflow-hidden bg-gradient-to-b from-blurple to-[#4651d4]">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-40 h-96 w-96 rounded-full bg-[#3b44b8]/40 blur-3xl" />

        {/* nav */}
        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-2 text-xl font-extrabold text-white">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-blurple">
              <MessageCircle size={20} strokeWidth={2.4} />
            </span>
            Harmony
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-white md:flex">
            <a href="#features" className="hover:underline">Features</a>
            <Link href="/showcase" className="hover:underline">How it works</Link>
            <a href="#footer" className="hover:underline">Support</a>
          </nav>
          <Link
            href="/login"
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900 shadow-sm transition hover:text-blurple hover:shadow-md"
          >
            Login
          </Link>
        </header>

        {/* hero content */}
        <div className="relative z-10 mx-auto max-w-4xl px-6 pb-32 pt-16 text-center sm:pt-24">
          <h1 className="text-4xl font-extrabold uppercase leading-tight tracking-tight text-white sm:text-6xl">
            A place to talk,
            <br />
            play &amp; hang out
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90 sm:text-xl">
            Harmony is the easiest way to chat in real time, jump into voice or video, and grow
            your communities — right from your browser.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/app"
              className="flex items-center gap-2 rounded-full bg-zinc-900 px-7 py-3.5 text-base font-semibold text-white shadow-lg transition hover:bg-zinc-800"
            >
              <MessageCircle size={20} /> Open Harmony
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-zinc-900 shadow-lg transition hover:text-blurple"
            >
              Log in <ArrowRight size={18} />
            </Link>
          </div>

          {/* product preview card */}
          <div className="mx-auto mt-16 max-w-3xl overflow-hidden rounded-2xl bg-d-mid text-left shadow-2xl ring-1 ring-black/20">
            <PreviewCard />
          </div>
        </div>

        {/* wave divider */}
        <svg
          className="relative z-10 block w-full"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0 80 L0 40 Q 360 0 720 40 T 1440 40 L1440 80 Z" fill="#ffffff" />
        </svg>
      </div>

      {/* ===== Features ===== */}
      <section id="features" className="mx-auto max-w-6xl space-y-24 px-6 py-24">
        <Feature
          icon={<Users size={28} />}
          eyebrow="Communities"
          title="Spin up a server in seconds"
          body="Harmony servers are organized into channels where you can collaborate, share, and just talk about your day — without the chaos of group chats."
        />
        <Feature
          reverse
          icon={<Mic size={28} />}
          eyebrow="Voice & Video"
          title="Hang out in voice & video"
          body="Hop into a voice channel when you're free. Flip on your camera or share your screen — no scheduling, no links, no friction."
        />
        <Feature
          icon={<Search size={28} />}
          eyebrow="Real-time"
          title="Never lose the thread"
          body="Messages arrive instantly, presence stays in sync, and full-text search means you can always find that link someone dropped last week."
        />
      </section>

      {/* ===== Final CTA ===== */}
      <section id="community" className="bg-zinc-100 px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <Sparkles size={40} className="mx-auto text-blurple" />
          <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
            Ready to start your journey?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-lg text-zinc-600">
            Join your community and pick up the conversation right where it left off.
          </p>
          <Link
            href="/app"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-blurple px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-blurple-hover"
          >
            <MessageCircle size={20} /> Open Harmony
          </Link>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer id="footer" className="bg-d-darkest px-6 py-14 text-d-text">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2 text-xl font-extrabold text-blurple">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-blurple text-white">
                <MessageCircle size={20} strokeWidth={2.4} />
              </span>
              Harmony
            </div>
            <p className="mt-4 max-w-xs text-sm text-d-muted">
              Real-time chat, voice &amp; video for your communities.
            </p>
          </div>
          <FooterCol title="Product" links={["Features", "Voice & Video", "Search"]} />
          <FooterCol title="Company" links={["About", "Blog", "Careers"]} />
          <FooterCol title="Resources" links={["Support", "Safety", "Community"]} />
        </div>
        <div className="mx-auto mt-12 max-w-6xl border-t border-white/10 pt-6 text-xs text-d-muted">
          © 2026 Harmony. A student project — not affiliated with or endorsed by Discord Inc.
        </div>
      </footer>
    </div>
  );
}

function Feature({
  icon,
  eyebrow,
  title,
  body,
  reverse,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  body: string;
  reverse?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-10 md:gap-16 ${
        reverse ? "md:flex-row-reverse" : "md:flex-row"
      }`}
    >
      <div className="flex-1">
        <p className="text-sm font-bold uppercase tracking-wide text-blurple">{eyebrow}</p>
        <h3 className="mt-2 text-3xl font-extrabold sm:text-4xl">{title}</h3>
        <p className="mt-4 text-lg leading-relaxed text-zinc-600">{body}</p>
      </div>
      <div className="grid aspect-[4/3] w-full max-w-md flex-1 place-items-center rounded-3xl bg-gradient-to-br from-blurple/10 to-blurple/30">
        <div className="grid h-24 w-24 place-items-center rounded-3xl bg-blurple text-white shadow-lg">
          {icon}
        </div>
      </div>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-blurple">{title}</h4>
      <ul className="space-y-2 text-sm text-d-muted">
        {links.map((l) => (
          <li key={l}>
            <a href="#" className="hover:text-d-bright hover:underline">
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** A small, original product-preview mock shown in the hero. */
function PreviewCard() {
  const rows = [
    { name: "Alice", color: "bg-dnd", text: "welcome to the server! 👋", seed: "Alice" },
    { name: "Bob", color: "bg-online", text: "this UI looks just like the real thing", seed: "Bob" },
    { name: "Carol", color: "bg-idle", text: "voice channel in 5?", seed: "Carol" },
  ];
  return (
    <div className="flex h-64">
      {/* server rail */}
      <div className="flex w-14 flex-col items-center gap-2 bg-d-darkest py-3">
        <div className="grid h-9 w-9 place-items-center rounded-2xl bg-blurple text-white">
          <MessageCircle size={16} />
        </div>
        <div className="h-9 w-9 rounded-2xl bg-d-dark" />
        <div className="h-9 w-9 rounded-2xl bg-d-dark" />
      </div>
      {/* channels */}
      <div className="hidden w-36 flex-col bg-d-dark p-2 sm:flex">
        <p className="px-1 py-2 text-xs font-bold uppercase text-d-muted">Text Channels</p>
        <p className="rounded bg-d-active px-2 py-1 text-sm text-d-bright"># general</p>
        <p className="px-2 py-1 text-sm text-d-muted"># random</p>
      </div>
      {/* chat */}
      <div className="flex flex-1 flex-col justify-end gap-3 p-3">
        {rows.map((r) => (
          <div key={r.name} className="flex items-start gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${r.seed}`}
              alt=""
              className="h-7 w-7 rounded-full bg-d-darkest"
            />
            <div>
              <p className="text-xs font-semibold text-d-bright">
                {r.name}
                <span className="ml-1 font-normal text-d-muted">today</span>
              </p>
              <p className="text-sm text-d-text">{r.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
