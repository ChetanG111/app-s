# Setup & Environment

> "If you can't run the app in 5 minutes, the docs are broken. Fix them."

## Prerequisites

- **Node.js**: v20+ (Required for `bcrypt` and `opencv-wasm` compatibility).
- **PostgreSQL**: Local or hosted (Supabase/Neon).

## 1. Environment Variables

Copy `.env.example` to `.env`.

```bash
cp .env.example .env
```

### Critical Keys

| Key | Purpose | Where to get it |
| --- | --- | --- |
| `DATABASE_URL` | Prisma connection | Supabase/Neon |
| `AUTH_SECRET` | NextAuth encryption | `npx auth secret` |
| `GEMINI_API_KEY` | AI Generation & Translation | Google AI Studio |
| `DODO_PAYMENTS_API_KEY` | Checkout & Verification | Dodo Dashboard |
| `GOOGLE_CLIENT_ID` | OAuth Login | Google Cloud Console |

## 2. Install & Init

```bash
npm install
npm run postinstall # Generates Prisma Client
```

## 3. Database Migration

```bash
npx prisma migrate dev
```

## 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## Troubleshooting

### `opencv-wasm` issues?
If you see errors related to `cv` or `opencv`:
1. Ensure you are on Node 20+.
2. We load it synchronously in `api/generate` routes. Check `app/api/generate/step1-warp/route.ts` if it crashes.

### Webhook failures?
Dodo webhooks need to reach your localhost.
1. Use **ngrok** or **localtunnel**.
2. Update the webhook URL in Dodo Dashboard to your ngrok URL (`/api/webhooks/dodo`).
