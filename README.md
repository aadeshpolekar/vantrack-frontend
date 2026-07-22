# VanTrack Frontend

React app for VanTrack — talks to the vantrack-backend API you already deployed.
Login/signup, schools, student roster with live payment-status (on route /
due soon / lapsed), and renewals.

## 1. Local setup

```bash
npm install
cp .env.example .env
# edit .env and set VITE_API_BASE_URL to your backend's URL
npm run dev        # starts the app on http://localhost:5173
```

If you're running the backend locally too, the default
`VITE_API_BASE_URL=http://localhost:3000` in `.env.example` already matches it.

## 2. Point it at your deployed backend

Open `.env` and set:

```
VITE_API_BASE_URL=https://your-app.up.railway.app
```

(That's the URL Railway gave you when you deployed vantrack-backend.)

You can also change this at runtime from inside the app — there's a
Settings (gear icon) field on the login screen and in the dashboard header
that overrides it without needing a rebuild. Handy for testing against a
different backend without redeploying.

## 3. Backend CORS

Your backend needs to allow requests from wherever this frontend is served.
If `src/index.js` in the backend uses `app.use(cors())` with no options,
you're already covered. If you locked it down to specific origins, add this
app's URL to that list.

## 4. Build for production

```bash
npm run build      # outputs static files to dist/
npm run preview    # preview the production build locally
```

Deploy the contents of `dist/` anywhere that serves static files — Vercel,
Netlify, Railway (as a static site), GitHub Pages, or your own server.

## 5. Turning it into an installable Android/iOS app

Same route as before, run from this folder after `npm run build`:

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap init VanTrack com.yourcompany.vantrack
npx cap add android
npx cap add ios
npx cap sync
```

## What's inside

```
src/
  App.jsx       — the whole app: auth screen + dashboard
  main.jsx      — React entry point
  index.css     — Tailwind imports
index.html      — Vite entry HTML
vite.config.js
tailwind.config.js
postcss.config.js
```

## API endpoints this app calls

| Action | Endpoint |
|---|---|
| Sign up | `POST /api/auth/signup` |
| Log in | `POST /api/auth/login` |
| List schools | `GET /api/schools` |
| Add school | `POST /api/schools` |
| List students (with live status) | `GET /api/students` |
| Add student + first payment | `POST /api/students` |
| Renew payment | `POST /api/students/:id/payments` |
| Remove student | `DELETE /api/students/:id` |

All requests except signup/login send `Authorization: Bearer <token>`
automatically once you're logged in.
