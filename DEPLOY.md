# Deploying the Aqdi (عقدي) customer website

This is a **Next.js 16 (App Router, TypeScript, next-intl, shadcn/ui)** app that
talks to the Laravel backend over `NEXT_PUBLIC_BASE_URL`. All secrets the browser
needs are `NEXT_PUBLIC_*` values that are **inlined at build time** — so any env
change requires a **rebuild / redeploy**, not just a restart.

- **Node version:** 20 or newer (`package.json` → `engines.node: ">=20"`). Use Node 20 LTS on the host.
- **Package manager:** npm (a `package-lock.json` is committed).
- **Build:** `next build` — **Install:** `npm install` (or `npm ci`) — **Start:** `next start`.

---

## 1. Environment variables the owner MUST fill

Copy `.env.example` → `.env.local` for local dev, and set the **same keys** in your
host's environment for production. None of these can be left blank in production
except `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (optional, Analytics only).

| Variable | What it is | Where to get it |
| --- | --- | --- |
| `NEXT_PUBLIC_BASE_URL` | Laravel API base URL, **including** `/api/v2`, no trailing slash. | Your production API host, e.g. `https://api.your-domain.com/api/v2`. |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web app API key. | Firebase console → ⚙ Project settings → **General** → *Your apps* → **Web app** → *SDK setup and configuration*. |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | e.g. `your-project.firebaseapp.com`. | Same SDK config block. |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project id. | Same SDK config block. |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | e.g. `your-project.appspot.com`. | Same SDK config block. |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Numeric FCM sender id. | Same SDK config block. |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase Web app id. | Same SDK config block. |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | *(optional)* GA measurement id `G-XXXX`. | Same SDK config block (only if Analytics is on). |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | Web Push public key for browser push. | Firebase console → ⚙ Project settings → **Cloud Messaging** → *Web configuration* → **Web Push certificates** → *Key pair*. |

### 1a. Also update the push service worker (important, easy to miss)

`public/firebase-messaging-sw.js` is a **service worker** and cannot read
`process.env` at runtime, so its Firebase config is **hardcoded**. Open that file
and replace the `firebase.initializeApp({ ... })` values with the **same** Firebase
config used above (`apiKey`, `authDomain`, `projectId`, `storageBucket`,
`messagingSenderId`, `appId`, `measurementId`). If you skip this, background push
notifications will target the wrong Firebase project.

### 1b. Backend must allow the site origin

The Laravel API's CORS / allowed origins must include the deployed site's domain,
and image hosts must match `next.config.ts → images.remotePatterns`. They are
derived automatically: the production API host on Railway
(`aqdi-new-backend-main-production.up.railway.app`) plus the host of
`NEXT_PUBLIC_BASE_URL` (when https). Add any other image host there.

---

## 2. Deploy to Vercel (recommended)

1. Push the repo to GitHub/GitLab/Bitbucket and **Import Project** in Vercel.
2. Vercel auto-detects Next.js. A `vercel.json` is committed (framework `nextjs`,
   build `next build`, install `npm install`). Leave the defaults.
3. **Project → Settings → General → Node.js Version → 20.x.**
4. **Project → Settings → Environment Variables:** add every variable from the table
   in §1 for the **Production** (and **Preview**, if you use it) environment.
   Point `NEXT_PUBLIC_BASE_URL` at the **production** API.
5. **Deploy.** On every env change, trigger a **redeploy** (env is baked in at build).
6. Add your custom domain under **Project → Settings → Domains** and update the
   backend CORS/allowed origins accordingly.

> `vercel.json` pins the region to `fra1` (Frankfurt) — change or remove `regions`
> if you prefer another region.

---

## 3. Deploy without Vercel (self-hosted Node / `next start`)

Any host that runs Node 20+ (VPS, container, cPanel Node.js app, etc.):

```bash
# 1. Provide env vars (either a real .env.local file or real process env vars)
cp .env.example .env.local   # then edit with production values

# 2. Install deps + build
npm ci                       # or: npm install
npm run build                # runs `next build`

# 3. Start the production server (defaults to port 3000)
npm run start                # runs `next start`
# or bind a specific host/port:
#   npx next start -H 0.0.0.0 -p 3000
```

Put Nginx/Apache (or the platform's load balancer) in front as a TLS-terminating
reverse proxy to `http://127.0.0.1:3000`, and keep the process alive with
`pm2`, `systemd`, or your platform's process manager.

### cPanel / Passenger (Node.js Selector)

A `server.js` custom entry is included for Passenger:

1. Create a Node.js app in cPanel, set **Application startup file** to `server.js`
   and the **Node version** to 20.
2. Set the environment variables from §1 in the cPanel Node app UI.
3. Run `npm ci` then `npm run build` (the app's Node env), then restart the app.
   `server.js` respects `PORT` / `HOSTNAME` (defaults to `0.0.0.0:3001`).

> Reminder: `NEXT_PUBLIC_*` are compiled into the client bundle at **build** time.
> After changing any of them you must **rebuild** (`npm run build`) and restart —
> restarting alone will not pick up new values.

---

## 4. Post-deploy smoke check

- Home page loads; language switch (ar/en) works.
- Login/OTP works → confirms `NEXT_PUBLIC_BASE_URL` and Firebase auth config.
- Create-contract flow reaches the finance step and the payment screen shows the
  same grand total; a Moyasar payment redirect opens.
- Browser push permission prompt appears and a test notification arrives →
  confirms the VAPID key **and** the hardcoded service-worker config (§1a).
