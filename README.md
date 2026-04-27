# Google Review Collection System

A production-ready full-stack review collection app with Firebase authentication, MongoDB persistence, AI review generation through OpenRouter, branded public review pages, QR codes, onboarding, and dashboard analytics.

## Stack

- Frontend: React, Vite, Firebase Auth, React Router, Lucide icons
- Backend: Node.js, Express, MongoDB, Mongoose, Firebase Admin, OpenRouter, QRCode
- Deploy: Vercel for frontend, Railway or Render for backend, MongoDB Atlas for database

## Local Setup

1. Install dependencies:

```bash
npm run install:all
```

2. Create environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Fill in every value in both `.env` files.

4. For local development, start MongoDB:

```bash
docker compose up -d mongo
```

5. Start both apps:

```bash
npm run dev:backend
npm run dev:frontend
```

The frontend runs at `http://localhost:5173`. The backend runs at `http://localhost:8080`.

## Firebase Setup

1. Create a Firebase project.
2. Go to Authentication and enable Email/Password and Google providers.
3. Add your local and production frontend domains to Authorized domains.
4. Create a Web App and copy these values into `frontend/.env`:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_APP_ID`
5. Go to Project settings > Service accounts > Generate new private key.
6. Copy these values into `backend/.env`:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`

Keep the private key quoted and preserve newline characters as `\n`.

## MongoDB Atlas Setup

1. Create a MongoDB Atlas cluster.
2. Create a database user with read/write access.
3. Add your backend host IP access rule. For Railway/Render, use their documented outbound IPs or allow `0.0.0.0/0` if needed.
4. Copy the connection string into `backend/.env` as `MONGODB_URI`.

## OpenRouter Setup

1. Create an OpenRouter account.
2. Generate an API key.
3. Set `OPENROUTER_API_KEY` in `backend/.env`.
4. The default model is `anthropic/claude-sonnet-4-5`; override with `OPENROUTER_MODEL` only if needed.

## Google Review URL

During onboarding, owners enter their Google Place ID and direct Google review URL. The helper link in the wizard points them to Google’s Place ID documentation. A typical direct review URL is generated from Google Business Profile or a Place ID review link and should be tested in Step 6 before finishing onboarding.

## Deployment

### Backend on Railway or Render

1. Create a new service from this repository.
2. Set the root directory to `backend`.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add every variable from `backend/.env.example`.
6. Set `FRONTEND_URL` and `PUBLIC_BASE_URL` to your deployed frontend URL.
7. Confirm `/health` returns `{ "ok": true }`.

### Frontend on Vercel

1. Create a Vercel project from this repository.
2. Set the root directory to `frontend`.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add every variable from `frontend/.env.example`.
6. Set `VITE_API_BASE_URL` to your deployed backend URL.

### Custom Domain

1. Add your custom domain in Vercel for the frontend.
2. Update DNS records as Vercel instructs.
3. Set backend `FRONTEND_URL` and `PUBLIC_BASE_URL` to `https://yourdomain.com`.
4. Add the custom domain to Firebase Authentication authorized domains.
5. Redeploy backend and frontend.

## Important Environment Variables

Backend:

- `PORT`: API server port.
- `FRONTEND_URL`: Allowed CORS origin.
- `PUBLIC_BASE_URL`: Base URL used in generated review links and QR codes.
- `MONGODB_URI`: MongoDB Atlas connection string.
- `FIREBASE_PROJECT_ID`: Firebase project ID.
- `FIREBASE_CLIENT_EMAIL`: Firebase service account client email.
- `FIREBASE_PRIVATE_KEY`: Firebase service account private key.
- `OPENROUTER_API_KEY`: Server-side OpenRouter key.
- `OPENROUTER_MODEL`: Defaults to `anthropic/claude-sonnet-4-5`.

Frontend:

- `VITE_API_BASE_URL`: Backend API origin.
- `VITE_FIREBASE_API_KEY`: Firebase web API key.
- `VITE_FIREBASE_AUTH_DOMAIN`: Firebase auth domain.
- `VITE_FIREBASE_PROJECT_ID`: Firebase project ID.
- `VITE_FIREBASE_APP_ID`: Firebase web app ID.

## Reliability Notes

- Protected API routes verify Firebase ID tokens with Firebase Admin.
- Public review generation is rate-limited.
- OpenRouter keys are never sent to the browser.
- If AI generation fails or times out, the backend returns business-type fallback reviews.
- Review logs store timestamp, business ID, star rating, generated text, and source only. No customer personal data is stored.
- Clipboard copy uses the async Clipboard API on user gesture and falls back to `document.execCommand("copy")`.
