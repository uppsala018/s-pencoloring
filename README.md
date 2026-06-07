# ColorBook — Paint by Numbers for Adults

S-Pen optimized paint-by-numbers coloring app. Built with Next.js 14, Firebase, Stripe, and Replicate.

## Setup Checklist

### 1. Environment Variables
Copy `.env.local` (already present) and verify all values are set.

Add these after deployment:
```
NEXT_PUBLIC_APP_URL=https://your-vercel-url.vercel.app
SEED_SECRET=any-random-secret-you-choose
STRIPE_WEBHOOK_SECRET=whsec_... (from Stripe dashboard)
```

### 2. Firebase
- Enable **Email/Password** auth in Firebase Console → Authentication → Sign-in method
- Enable **Google** sign-in (add your Vercel URL as authorized domain)
- Create Firestore database (production mode)
- Enable Firebase Storage

### 3. Stripe (after deployment)
1. Create two products in Stripe dashboard:
   - **Credit Pack** (one-time, €2.99) → copy price ID → set as `STRIPE_CREDITS_PRICE_ID`
   - **Unlimited** (recurring monthly, €4.99) → copy price ID → set as `STRIPE_UNLIMITED_PRICE_ID`
2. Add webhook endpoint: `https://your-vercel-url.vercel.app/api/stripe/webhook`
   - Events to listen: `checkout.session.completed`, `customer.subscription.deleted`
   - Copy signing secret → set as `STRIPE_WEBHOOK_SECRET`

### 4. Google OAuth
- Firebase Console → Authentication → Sign-in method → Google → Add authorized domain (your Vercel URL)
- Google Cloud Console → OAuth → Authorized redirect URIs: `https://your-vercel-url/__/auth/handler`

### 5. Seed Coloring Pages
After deploying, run once:
```bash
curl -X POST https://your-vercel-url.vercel.app/api/seed \
  -H "x-seed-key: YOUR_SEED_SECRET"
```

### 6. Deploy to Vercel
```bash
git init
git remote add origin https://github.com/uppsala018/s-pencoloring.git
git add .
git commit -m "Initial commit"
git push -u origin main
```
Then import the GitHub repo in Vercel and add all env vars.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Architecture

- `/app` — Next.js App Router pages
- `/components` — React components (ColoringCanvas, ColorPalette, AudioPlayer…)
- `/lib` — Firebase, Stripe, Replicate clients
- `/context` — AuthContext (Firebase auth + Firestore user profile)
- `/public/coloring-pages` — SVG coloring pages
- `/api/seed` — One-time Firestore seeder
- `/api/stripe` — Checkout + webhook handlers
- `/api/generate` — Replicate image generation

## S-Pen Support

The coloring canvas uses the [Web Pointer Events API](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events) which supports:
- `pointerType === "pen"` detection
- Pressure sensitivity via `e.pressure`
- Works in Samsung Internet Browser and Chrome on Android
