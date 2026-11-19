# Yam Sushi Contest

Mobile-first web app for a live sushi eating contest. Everyone taps a **join link**, enters a name once, and tallies their own score while a **live leaderboard** updates.

**Scoring:** sashimi & basic rolls **1 pt/piece** · nigiri (sushi) & special rolls **2 pts/piece**.

**Cost:** Supabase free tier + free static hosting (Vercel or Cloudflare Pages). No app installs for players.

## One-time setup (about 15 minutes)

### 1. Supabase (free)

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run the full script in [`supabase/migration.sql`](supabase/migration.sql).
3. Enable **Realtime** for `players`: **Database → Publications → `supabase_realtime`** → turn on `players` (or follow the note in the SQL file).
4. Copy **Project URL** and **anon public** key from **Settings → API**.

### 2. Local env

```bash
cp .env.example .env
```

Fill in `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

> Free Supabase projects **pause** after inactivity. Open the dashboard once before contest night to wake the project.

### 3. Install and run locally

```bash
npm install
npm run web
```

Open the URL in your browser (phone on same Wi‑Fi can test via your LAN URL from Expo).

## Contest night (joiners do almost nothing)

1. **Host:** open your deployed site → **Create contest** → **Share link** (or copy link).
2. **Everyone else:** tap the link in iMessage/WhatsApp/etc. → enter name if asked → tally.
3. Scores **stay saved** if someone closes the browser; they can reopen the link or use **Continue contest** on the home page.

Join link format: `https://YOUR_SITE/join/ABC123`

## Deploy for free (required for easy joining)

Build a static site:

```bash
npm run export:web
```

Output is in `dist/` (single-page app; `vercel.json` rewrites all paths to `index.html` for join links).

### Vercel

1. Push this folder to GitHub (optional) or use Vercel CLI.
2. Import project → framework **Other** → build command `npm run export:web`, output directory `dist`.
3. Add env vars `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
4. Deploy and share your `*.vercel.app` URL.

### Cloudflare Pages

1. Connect repo or upload `dist/` after local build (Pages can run `npm run export:web` in CI).
2. Set the same env vars for build.
3. Share your `*.pages.dev` URL.

## Features

- Live leaderboard (Supabase Realtime)
- Debounced saves (free-tier friendly)
- Persistent scores per device (no delete on leave)
- Host can **End contest** (locks tallying, keeps scores)
- Manual room code join as fallback

## Project structure

- `app/` — screens (home, `/join/[code]`, `/room/[id]`)
- `lib/` — Supabase, storage, scoring
- `components/` — tally rows, leaderboard