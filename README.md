# Harmony — Discord Clone

Real-time chat, voice & video for communities. Built for the Web Development Competition (Final).

A single-page web app where users log in, browse servers (guilds) and channels, chat in
real time (with edit/delete + search), join servers via invite code, manage their profile &
status, and connect to voice/video channels.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | **Next.js 16** (App Router) + **React 19** + **TypeScript** |
| Styling | **Tailwind CSS v4** (custom Discord-style dark theme) |
| Database | **Supabase Postgres** (with Row Level Security) |
| Realtime | **Supabase Realtime** — Postgres Changes (live messages) + Presence (online status) + Broadcast (typing indicator, voice signaling) |
| Auth | **Supabase Auth** (email/password) |
| Voice/Video | **WebRTC** media (`getUserMedia` / `getDisplayMedia`) |

> Supabase Realtime replaces a custom Socket.io server — same event-driven model, zero server to host.

---

## Running it

```bash
npm install        # already done
npm run dev        # dev server → http://localhost:3000
# For a snappy demo build instead:
npm run build && npm run start
```

First set up env vars: `cp .env.example .env.local` (the example already contains a working
Supabase publishable URL + key — safe to expose, protected by Row Level Security).

### Demo logins (click the avatar on the login page, or type the email)

| User  | Email           | Password      |
|-------|-----------------|---------------|
| Alice | alice@demo.com  | `password123` |
| Bob   | bob@demo.com    | `password123` |
| Carol | carol@demo.com  | `password123` |
| Dave  | dave@demo.com   | `password123` |

To see **real-time** between two users: open two browser windows (e.g. Chrome + Edge, or a
normal + incognito window), log in as **Alice** in one and **Bob** in the other.

---

## เกณฑ์: Functional Requirements ที่ทำเสร็จ (ตามข้อ 5 ในโจทย์)

ทุกข้อที่ระบุว่า "บันทึกลง Database" บันทึกจริงทั้งหมด ✅

- **5.1 แสดงเซิร์ฟเวอร์และห้องย่อย** — หลัง login เห็นรายการ Server ที่เป็นสมาชิก (ซ้ายมือ),
  ห้อง Text/Voice ของแต่ละเซิร์ฟเวอร์ (มาจาก DB), และรายชื่อสมาชิกที่ออนไลน์ ✅
- **5.2 ระบบค้นหา** — ค้นหาข้อความย้อนหลังด้วย keyword ทุกห้องในเซิร์ฟเวอร์ แสดงผลพร้อมชื่อห้อง คลิกเพื่อกระโดดไปห้องนั้น ✅
- **5.3 ห้องแชท Real-time (DB)** — ส่ง / แก้ไข / ลบ ข้อความของตัวเอง, กระจายแบบ real-time,
  โหลดประวัติแบบ Infinite Scroll พร้อมชื่อผู้ส่ง/เวลา/รูปโปรไฟล์ ✅
- **5.4 เข้าร่วมเซิร์ฟเวอร์ผ่าน Invite + เชื่อมต่อเสียง (DB)** — ใส่ Invite Code → แสดงสรุป
  (ชื่อ/ไอคอน/จำนวนสมาชิก) → ยืนยันเข้าร่วม (บันทึก DB); เข้าห้องเสียงสร้าง log การเข้าร่วมใน DB,
  sync สถานะผ่าน Socket (Realtime), แสดงสัญลักษณ์ "Voice Connected" ✅
- **โปรไฟล์ & สถานะ (Scope item 5)** — แก้ชื่อ/รูป, ตั้งสถานะ online/idle/dnd/offline + custom status (DB) ✅
- **โบนัส: Typing indicator** — "X is typing…" แบบ real-time (Realtime Broadcast, ไม่แตะ DB) ✅

---

## Architecture (สำหรับอธิบายกรรมการ)

```
app/
  page.tsx              เช็ค session → redirect ไป /login หรือ /app
  login/page.tsx        หน้า Login (quick-login + email/password)
  app/page.tsx          ตัวหลัก: state, data fetching, Realtime subscriptions, handlers
components/
  ServerRail.tsx        แถบไอคอนเซิร์ฟเวอร์ซ้ายสุด + ปุ่มเข้าร่วม (+)
  ChannelSidebar.tsx    รายการห้อง Text/Voice + user panel (เป็น drawer บนมือถือ)
  ChatArea.tsx          ข้อความ + Infinite Scroll + ช่องพิมพ์ + ค้นหา + typing indicator
  MessageItem.tsx       ข้อความเดี่ยว + แก้ไข/ลบ (เฉพาะของตัวเอง) + highlight ผลค้นหา
  MemberList.tsx        รายชื่อสมาชิก แยก Online/Offline (ขับด้วย Presence)
  JoinServerModal.tsx   ใส่ invite code → preview → ยืนยันเข้าร่วม
  UserSettingsModal.tsx แก้โปรไฟล์ + สถานะ
  VoiceConnection.tsx   แถบเชื่อมต่อเสียง/วิดีโอ (mic / camera / screen share)
lib/
  supabaseClient.ts     Supabase client (singleton)
  queries.ts            ฟังก์ชันเข้าถึงข้อมูลทั้งหมด (CRUD + search + join + voice)
  types.ts              TypeScript types ของตาราง
```

**Database tables:** `profiles`, `servers`, `channels`, `server_members`, `messages`,
`voice_participants`. ทุกตารางเปิด Row Level Security — ผู้ใช้แก้/ลบได้เฉพาะข้อความของตัวเอง
(`user_id = auth.uid()`).

**Realtime 3 รูปแบบ:**
1. *Postgres Changes* → ข้อความเข้า/แก้/ลบ เห็นทันทีทุกคนในห้อง
2. *Presence* → ใครออนไลน์อยู่ (รายชื่อสมาชิก) + sync ผู้เข้าห้องเสียง
3. *Broadcast* → typing indicator + WebRTC signaling

---

## Demo script (~3 นาที)

1. **Login** — กดอวตาร Alice (quick login)
2. **Servers/Channels** — ชี้แถบเซิร์ฟเวอร์ซ้ายมือ, สลับห้อง #general / #random
3. **Real-time chat** — เปิดอีกหน้าต่าง login เป็น Bob → พิมพ์ข้อความ เห็นเด้งทันทีทั้งสองฝั่ง + "is typing…"
4. **Edit/Delete** — ชี้เมาส์ที่ข้อความตัวเอง → แก้ไข / ลบ (ขึ้น "edited", หายจริง)
5. **Search** — พิมพ์ใน "Search messages…" เช่น `react`
6. **Join via invite** — กด (+) → ใส่ `design-hub` → เห็นสรุป → Join
7. **Profile/Status** — กดเฟือง ⚙️ → เปลี่ยนสถานะ/custom status
8. **Voice** — กดห้องเสียง → "Voice Connected" → เปิดกล้อง/แชร์จอ

---

## Out of scope (ตามโจทย์ — ไม่ต้องทำ)
Admin Panel, Multi-language, Premium/Nitro payment, Helpdesk chatbot, Gamification, Mobile app.

---

# Architecture

A single Next.js app talks directly to Supabase from the browser; Supabase provides the
"backend" (database, auth, realtime) so there is no separate server to run.

```
Browser (Next.js App Router, React 19, client components)
   │  @supabase/supabase-js
   ▼
Supabase
   ├─ Postgres (data) + Row Level Security (authorization)
   ├─ Auth (email/password → JWT, auto-refresh, session in localStorage)
   └─ Realtime  ├─ Postgres Changes  → live messages (insert/update/delete)
                ├─ Presence          → online/offline + voice participants
                └─ Broadcast         → typing indicator + WebRTC signaling
WebRTC (browser-native) → local mic / camera / screen capture
```

**Data flow for a message:** client `insert` into `messages` (RLS checks `user_id = auth.uid()`)
→ Postgres write → Realtime publishes the change → every subscribed client in that channel
receives it and updates state. No polling, no custom socket server.

## Stack actually used (honest note)

The brief suggested Express / Socket.io / Prisma / NextAuth. This project intentionally uses a
**Next.js + Supabase** stack instead, which satisfies the same requirements with less moving parts:

| Requirement | Brief's example | What this project uses |
|---|---|---|
| Frontend | React + Vite | **Next.js 16 (App Router) + React 19 + TypeScript** |
| Styling | Tailwind / CSS Modules | **Tailwind CSS v4** + lucide-react icons |
| Realtime (WebSocket) | Socket.io | **Supabase Realtime** (WebSocket under the hood) |
| Auth (JWT/session) | NextAuth / Auth.js | **Supabase Auth** (issues JWTs, manages sessions) |
| Database | PostgreSQL / Mongo | **Supabase Postgres** |
| ORM / data access | Prisma | **supabase-js** + SQL migrations |
| AuthZ / permissions | app-layer checks | **Postgres Row Level Security** (enforced server-side) |
| Deploy | Vercel + Render | **Vercel** (single app) |

## Concepts applied
REST-ish data access (PostgREST), WebSocket realtime, JWT auth, Row Level Security (RBAC
foundation), relational schema with FKs, realtime event handling, React state management,
responsive design. Security: RLS enforces write rules server-side (can only edit/delete your
own messages); React escapes message text (XSS-safe by default); auth tokens auto-refresh.

# Feature checklist

**Done & verified**
- [x] Landing page (hero, nav, CTAs, feature sections, footer) — responsive
- [x] Auth: email + password, register (auto-confirm + profile trigger), JWT session, logout
- [x] Profile + status (online/idle/dnd/offline + custom status), Discord-style status shapes
- [x] Server / channel display (text + voice) from DB; collapsible categories
- [x] Real-time chat: send / edit / delete (own), infinite scroll, timestamps, date dividers
- [x] Typing indicator (realtime broadcast)
- [x] Online/offline presence + member list (docked desktop, drawer on mobile)
- [x] Search messages
- [x] Join server via invite code (preview + confirm)
- [x] **Create server** (own server + default channels) — see below
- [x] Emoji picker
- [x] Voice/Video: join voice (DB log), participant sync, mic/deafen, camera, screen share, connected indicator (local media)
- [x] Right-click "Copy invite code" on server header; custom tooltips; responsive 320px→desktop

**Partial**
- [~] Roles: only `owner` / `member` (no custom roles / colors yet)
- [~] Permissions: enforced via RLS for messages/membership; no per-channel permission UI
- [~] Voice: local media only (no peer-to-peer audio mesh)

**Not done (post-deadline roadmap)**
- [ ] OAuth (Google) sign-in
- [ ] Direct messages (DMs)
- [ ] Custom roles + colors + per-permission management UI (Server Settings)
- [ ] Right-click context menus (channel / member / message actions: kick, ban, mute, pin, report…)
- [ ] Sticker panel + GIF search (Tenor/Giphy)
- [ ] Announcement channels + webhooks
- [ ] Rate limiting, audit log
- [ ] File/image uploads (Supabase Storage)

## Mock data
Seeded in the database: 4 demo users (alice/bob/carol/dave @demo.com, `password123`),
3 servers (KU Coders, Gaming Lounge, Design Hub), text + voice channels, memberships,
and ~24 messages. New accounts can be created via **Register** or **Create a server**.
