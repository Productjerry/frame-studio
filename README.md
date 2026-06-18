# Rain Conference — Frame Studio

Two apps on two URLs, sharing one backend:

- **`/admin`** — password-protected dashboard where admins upload + publish frame templates
- **`/user`** — Frame Studio where attendees pick a published frame, position their photo, and download their framed DP

Admin uploads land in **Supabase** (database + file storage), so a frame you
publish appears on every attendee's phone in real time. Attendees never log in;
only admins do.

---

## Easiest path: no terminal, no coding

You can do this entirely in your web browser by uploading this folder to GitHub's
website and letting Vercel build it. You will NOT need to install anything or type
commands. Three free accounts, ~25 minutes total:

1. **Supabase** — https://supabase.com  (the shared backend)
2. **GitHub** — https://github.com  (stores the code)
3. **Vercel** — https://vercel.com  (puts it online)

Do the three parts (A, B, C) in order.

---

## A. Set up Supabase (the shared backend) — ~12 min

1. Go to https://supabase.com → sign in → **New project**. Give it a name, set a
   database password (save it somewhere safe), pick a region near your users,
   create it. Wait ~2 minutes while it provisions.

2. Left sidebar → **SQL Editor** → **New query**. Open the file
   `supabase_setup.sql` from this folder, copy ALL of its text, paste it into the
   editor, click **Run**. You should see "Success". This builds the templates
   table, the live-update feed, the image storage bucket, and the security rules
   (public can view frames; only logged-in admins can upload/publish).

3. Confirm storage: left sidebar → **Storage**. You should see a public bucket
   named **frames**. If not, click **New bucket**, name it exactly `frames`, turn
   ON **Public bucket**, save.

4. **Create your admin account.** Left sidebar → **Authentication** → **Users** →
   **Add user** → **Create new user**. Enter the email + password you want to log
   in with. Turn ON **Auto Confirm User** (so you don't need to click an email
   link). Click create. This is the ONLY way admin accounts are made — there is no
   public sign-up, which keeps the dashboard private.

5. Get your keys: left sidebar → **Project Settings** (gear) → **API**. Keep this
   tab open — you'll copy the **Project URL** and the **anon public** key into
   Vercel in part C. (The anon key is safe to use in a browser app.)

---

## B. Put the code on GitHub (browser only) — ~6 min

1. Create a GitHub account if you don't have one.

2. Click the **+** (top-right) → **New repository**. Name it `frame-studio`, leave
   everything else default, click **Create repository**.

3. On the new empty repo page, click the link **uploading an existing file**
   (in the "Quick setup" box). 

4. Drag the CONTENTS of this `frame-studio` folder into the upload area — that is,
   select everything inside the folder (the `src` folder, `index.html`,
   `package.json`, etc.) and drop them in. Don't drag the outer folder itself;
   drag what's inside it.
   - Tip: you can drag folders directly; GitHub keeps the structure.
   - You do NOT need `node_modules` or `dist` (they aren't included anyway).

5. Scroll down, click **Commit changes**. Your code is now on GitHub.

> Your Supabase keys are never in these files, so nothing secret goes to GitHub.
> You'll add the keys directly in Vercel next.

---

## C. Deploy on Vercel — ~6 min

1. Go to https://vercel.com → **Sign Up** / **Log In** → choose **Continue with
   GitHub** and authorize it.

2. Click **Add New…** → **Project**. You'll see your `frame-studio` repo in the
   list → click **Import**.

3. Vercel auto-detects it's a Vite app — leave all build settings as they are.

4. Expand **Environment Variables** and add these two (names must match exactly):

   | Name | Value |
   |------|-------|
   | `VITE_SUPABASE_URL` | your Project URL from Supabase A5 |
   | `VITE_SUPABASE_ANON_KEY` | your anon public key from Supabase A5 |

5. Click **Deploy**. After ~1 minute you get a live URL like
   `https://frame-studio-xxxx.vercel.app`.

Your two URLs are:

- **Admin:** `https://your-app.vercel.app/admin` — log in with the account from A4
- **User:** `https://your-app.vercel.app/user` — share this with attendees

---

## Try it end to end

1. Open the **/admin** URL → sign in.
2. In **New Template**, upload a transparent PNG frame (ideally 2000×2000, the
   conference ring with a clear circle in the middle).
3. Flip that template's toggle ON (or click **Publish All**).
4. Open the **/user** URL on your phone → upload a selfie → you should see it
   inside your published frame → tap **Download Framed DP** to save the PNG.

If an admin publishes while a user has the page open, it updates live — no refresh.

---

## Making changes later

Edit a file directly on GitHub (pencil icon) and commit, OR upload new files the
same way as part B. Vercel rebuilds and redeploys automatically within a minute.
To add another admin, repeat Supabase step A4 with a new email/password.

### IMPORTANT — database update for theme shapes + usage counts (v2)

This version lets admins choose each theme's photo shape (circle or square),
canvas size (1080×1080 or 1080×1350), and manually position the photo slot — and
shows how many users used each theme. It needs a one-time database update:

1. Supabase dashboard → SQL Editor → New query.
2. Paste ALL of `schema_v2.sql` and Run. (Safe to re-run; it only adds new
   columns if they're missing.)

Until you run it, new uploads still work but shape/size/slot won't be saved and
usage counts stay at zero.

### IMPORTANT — one-time database update for the DP gallery

This version adds a public "Recent Frames" gallery of DPs that users choose to
share. For it to work you must run the database setup script ONE more time so the
new pieces get created (a `generations` table and a `dps` storage bucket):

1. Supabase dashboard → SQL Editor → New query.
2. Paste ALL of `supabase_setup.sql` again and Run.
   (It's safe to re-run — existing tables/policies are skipped, only the new
   gallery pieces are added. If it complains a policy "already exists", that's
   harmless — it means that part was already there.)
3. Confirm under Storage that a public bucket named `dps` now exists.

Until you do this, downloads still work but the share-to-gallery step will
silently do nothing.

How the gallery works: after a user taps Download, a small popup asks whether to
add their DP to the public gallery. Only if they tap "Yes, share it" is the image
saved. No name is attached. The row shows placeholder avatars until the first real
shared DP exists, then shows real DPs newest-first, updating live.

---

## What's real vs. placeholder

- **Real:** admin login, admin upload → storage + database, publish/toggle/delete,
  the user side reading only published frames and updating live, photo upload,
  X/Y positioning, scale, **Download Framed DP** (composites a real 1080×1080 PNG),
  responsive desktop + mobile layouts.
- **Placeholder:** the dashboard's headline stats (Total Generations, Daily Active
  Users, the analytics chart) are sample numbers, and the Recent Generations table
  is sample data. Wiring these to real counts is a future step.
- The on-photo frame is drawn as SVG text until you upload a real transparent PNG
  frame in admin; once published, that PNG overlays the photo automatically and is
  baked into the download.

## A note on the download + uploaded frames (CORS)

The download composites the frame image onto a canvas. For a remotely-hosted frame
to be included without browser security blocking it, Supabase Storage must allow
cross-origin reads — public buckets do by default, so this works out of the box.
If you ever swap to a different image host and the downloaded frame comes out blank,
that host needs to send permissive CORS headers; the app falls back to the SVG ring
in that case so the download never fails outright.

## Project map

```
frame-studio/
├─ index.html              app shell + fonts
├─ package.json            dependencies + scripts
├─ vite.config.js
├─ vercel.json             SPA routing (so /admin survives a refresh)
├─ supabase_setup.sql      run once in Supabase (part A2)
├─ .env.example            only needed if you ever run it locally
└─ src/
   ├─ main.jsx             routes: /admin and /user
   ├─ lib/
   │  ├─ supabase.js       backend client
   │  ├─ templates.js      template data access
   │  ├─ auth.js           admin sign in / out
   │  └─ compose.js        builds the downloadable framed PNG
   ├─ components/
   │  ├─ ui.jsx            shared visual pieces
   │  └─ AdminLogin.jsx    the login screen
   └─ pages/
      ├─ AdminPage.jsx     gated behind login
      └─ UserPage.jsx      responsive: desktop + mobile in one
```

---

## Optional: running it locally first (needs Node + terminal)

Skippable — the browser path above is enough. But if you want to test on your own
machine before deploying: install Node.js 18+ (https://nodejs.org), then in a
terminal inside this folder run `npm install`, copy `.env.example` to `.env.local`
and fill in your two Supabase keys, then `npm run dev` and open the printed
localhost URL at `/admin` and `/user`.
