# Free hosting (pick one)

You need **Supabase** set up first (see [README.md](README.md)). Hosting is **$0** on Vercel or Cloudflare Pages.

**Important:** `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` must be set **before the build runs**. Expo embeds them into the JavaScript bundle at build time.

---

## Option A — Vercel (easiest)

### With GitHub (recommended)

1. Create a free [GitHub](https://github.com) repo and push this project.
2. Sign up at [vercel.com](https://vercel.com) → **Add New → Project** → import the repo.
3. Vercel should read [`vercel.json`](vercel.json) automatically:
   - Build: `npm run export:web`
   - Output: `dist`
4. Before deploying, open **Environment Variables** and add:

   | Name | Value |
   |------|--------|
   | `EXPO_PUBLIC_SUPABASE_URL` | your Supabase project URL |
   | `EXPO_PUBLIC_SUPABASE_ANON_KEY` | your Supabase anon key |

   Apply to **Production** (and Preview if you want).

5. **Deploy**. Your site will be at `https://something.vercel.app`.
6. Share that URL; join links look like `https://something.vercel.app/join/ABC123`.

### Without GitHub (Vercel CLI)

```powershell
cd "C:\Users\mattd\OneDrive\Documents\Yam Sushi Contest"
npm install -g vercel
vercel login
```

Add env vars (one-time for the project):

```powershell
vercel env add EXPO_PUBLIC_SUPABASE_URL
vercel env add EXPO_PUBLIC_SUPABASE_ANON_KEY
```

Deploy:

```powershell
vercel --prod
```

---

## Option B — Cloudflare Pages (free)

### Connect Git

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → Connect to Git.
2. **Build settings:**
   - Build command: `npm run export:web`
   - Build output directory: `dist`
   - Node version: 20 (in Environment variables: `NODE_VERSION` = `20`)
3. Add **Environment variables** (Production):
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy. URL: `https://your-project.pages.dev`

### SPA routing (join links)

After first deploy, add a **/_redirects** rule if needed: this repo already includes `public/_redirects` (`/* → /index.html 200`) copied into `dist` on export.

---

## Option C — Manual upload (no Git)

Build on your PC with Supabase keys in `.env`:

```powershell
copy .env.example .env
# edit .env with your keys
npm run export:web
```

Upload the **`dist`** folder:

- **Cloudflare Pages** → **Create project** → **Direct Upload** → drag `dist` in.
- Re-upload whenever you change the app (remember to rebuild with `.env` present).

Vercel does not support long-term static folder upload; use A or CLI for Vercel.

---

## After deploy — quick test

1. Open your live URL → **Create contest** → **Share link**.
2. Open the link in a private/incognito window → different name → tap **+**.
3. Both windows should show the same live leaderboard.

Wake Supabase before contest night if the free project was paused.