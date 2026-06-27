
# Firebase Google Auth App — Finalized Plan

> Scaffold replacement: the current TanStack Start scaffold will be removed in implementation — delete `src/routes/`, `src/router.tsx`, `src/server.ts`, `src/start.ts`, `src/routeTree.gen.ts`, and strip `@tanstack/*` deps from `package.json`. The plan below assumes a clean React + Vite project.

## 1. Project summary
A minimal, premium-feeling SaaS-style auth app. Public `/login` with "Continue with Google" via Firebase `signInWithPopup`. After auth, user is redirected to a protected `/profile` page displaying photo, display name, and email, plus a logout button. No backend, no DB. Session is restored on refresh via Firebase's built-in persistence + `onAuthStateChanged`.

## 2. Recommended tech architecture
- **Build**: Vite + React 18 (`.jsx`).
- **Styling**: **Tailwind CSS v3** with classic `tailwind.config.js` + PostCSS (chosen for stability and broad doc coverage; v4 Vite plugin is NOT used — single approach only).
- **Routing**: `react-router-dom` v6 (`BrowserRouter`, `Routes`, `Route`, `Navigate`, `Outlet`, `useNavigate`, `useLocation`).
- **Auth**: `firebase/app` + `firebase/auth` (`GoogleAuthProvider`, `signInWithPopup`, `signOut`, `onAuthStateChanged`).
- **State**: React Context (`AuthContext`) — no Redux, no localStorage writes.
- **Toasts**: `react-hot-toast`.
- **Icons**: `lucide-react`.
- **Deploy**: Vercel (SPA) from GitHub.

## 3. Folder structure
```text
.
├─ public/
│  └─ favicon.svg
├─ src/
│  ├─ components/
│  │  ├─ Avatar.jsx           # photo + initials fallback
│  │  ├─ GoogleButton.jsx     # styled Google CTA + pending state
│  │  ├─ Spinner.jsx
│  │  └─ ProtectedRoute.jsx   # auth guard wrapper
│  ├─ context/
│  │  └─ AuthContext.jsx      # provider + useAuth hook
│  ├─ lib/
│  │  └─ firebase.js          # Firebase init (only place)
│  ├─ pages/
│  │  ├─ Login.jsx
│  │  ├─ Profile.jsx
│  │  └─ NotFound.jsx
│  ├─ App.jsx                 # <BrowserRouter> + <Routes>
│  ├─ main.jsx                # ReactDOM + <AuthProvider> + <Toaster>
│  └─ index.css               # @tailwind base/components/utilities
├─ .env                       # gitignored, holds VITE_FIREBASE_* values
├─ .env.example               # committed template, empty values
├─ .gitignore
├─ index.html
├─ package.json
├─ postcss.config.js
├─ tailwind.config.js
├─ vite.config.js
└─ vercel.json                # SPA rewrite to /index.html
```

## 4. Route structure
| Path       | Access     | Behavior |
|------------|------------|----------|
| `/`        | public     | If signed in → `<Navigate to="/profile" replace />`, else `<Navigate to="/login" replace />`. Respects `loading`. |
| `/login`   | public     | Renders `Login`. If already signed in → `<Navigate to="/profile" replace />` (prevents revisiting login post-auth). |
| `/profile` | protected  | Wrapped in `<ProtectedRoute>`. Renders `Profile`. |
| `*`        | public     | `NotFound` with link back to `/`. |

## 5. Component breakdown
- **`AuthProvider`** — owns `{ user, loading, error, signInWithGoogle, signOutUser, clearError }`. Subscribes to `onAuthStateChanged` once on mount; unsubscribes on unmount.
- **`useAuth()`** — thin hook returning the context value.
- **`ProtectedRoute`** — `if (loading) <Spinner/>; if (!user) <Navigate to="/login" replace state={{ from: location }}/>; return <Outlet/>`.
- **`GoogleButton`** — handles its own `pending` state; calls `signInWithGoogle`; disabled while pending.
- **`Avatar`** — props `{ src, name, size }`; `<img onError>` flips to initials tile.
- **`Spinner`** — Tailwind-only loader; used by `ProtectedRoute` and root redirect gate.
- **`Login`** — centered card layout, heading, subcopy, `GoogleButton`, inline error region tied to `error` from context; on mount clears stale error.
- **`Profile`** — card with `Avatar` (80px), display name, email, "Sign out" button.
- **`NotFound`** — minimal 404 card.

## 6. Authentication flow (step-by-step)
1. App mounts → `AuthProvider` calls `onAuthStateChanged(auth, cb)`; `loading=true`.
2. Firebase rehydrates persisted session (IndexedDB default) → `cb(user|null)` → `loading=false`.
3. `/` evaluates: signed in → `/profile`; otherwise → `/login`.
4. On `/login`, user clicks Google button → `signInWithPopup(auth, googleProvider)`.
5. Success: `onAuthStateChanged` fires with `user` → context updates → `Login`'s "already signed in" redirect sends them to `/profile` → success toast.
6. Refresh on `/profile`: `ProtectedRoute` waits for `loading=false`, then allows render — no flash redirect.
7. Logout: `signOut(auth)` → context clears `user` → `ProtectedRoute` redirects to `/login` → toast "Signed out".

## 7. Firebase integration points
- **Init (only place)**: `src/lib/firebase.js` — `initializeApp(firebaseConfig)`, `getAuth(app)`. Exports `auth` and `googleProvider = new GoogleAuthProvider()`.
- **Sign-in**: `AuthContext.signInWithGoogle` → `signInWithPopup(auth, googleProvider)`.
- **Session listener**: `AuthContext` `useEffect` → `onAuthStateChanged(auth, setUser)`.
- **Sign-out**: `AuthContext.signOutUser` → `signOut(auth)`.
- **Persistence**: Firebase default (`browserLocalPersistence`); we do not write to `localStorage` ourselves.

## 8. Required environment variables
All client-exposed, so they must be `VITE_`-prefixed:
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```
Read via `import.meta.env.VITE_FIREBASE_*` inside `src/lib/firebase.js`.

## 9. What goes into `.env`
```
VITE_FIREBASE_API_KEY=replace_me
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=000000000000
VITE_FIREBASE_APP_ID=1:000000000000:web:xxxxxxxxxxxx
```
Commit a `.env.example` with the same keys and empty values as the teammate template.

## 10. What must be added to `.gitignore`
```
node_modules
dist
.env
.env.local
.env.*.local
.vercel
.DS_Store
*.log
```
Do NOT ignore `.env.example`.

## 11. Protected route logic
Used in `App.jsx`:
```jsx
<Route element={<ProtectedRoute />}>
  <Route path="/profile" element={<Profile />} />
</Route>
```
Inside `ProtectedRoute`:
- `loading` → render `<Spinner/>` (prevents flash redirect on refresh while Firebase rehydrates).
- `!user` → `<Navigate to="/login" replace state={{ from: location }} />`.
- otherwise → `<Outlet />`.

Mirror behavior on `/login`: if `!loading && user`, `<Navigate to="/profile" replace />` so signed-in users never sit on `/login`.

## 12. Error handling plan
- Wrap `signInWithPopup` in try/catch inside `AuthContext`; set `error` to a friendly message based on Firebase code:
  - `auth/popup-closed-by-user` → "Sign-in cancelled."
  - `auth/cancelled-popup-request` → silently ignore (concurrent popup).
  - `auth/popup-blocked` → "Popup blocked — allow popups and retry."
  - `auth/network-request-failed` → "Network error. Check your connection."
  - `auth/unauthorized-domain` → "This domain isn't authorized in Firebase."
  - default → "Couldn't sign in. Please try again."
- `Login` clears stale errors on mount and at the start of every retry (`clearError()` called before each `signInWithGoogle`).
- Surface errors inline under the Google button AND via `toast.error(...)`.
- React Router `*` route for unknown URLs.

## 13. Loading state plan
- **Auth bootstrap**: `AuthProvider.loading` is `true` until first `onAuthStateChanged` callback. `ProtectedRoute` and `/` root redirect both gate on it; this avoids flash-redirecting authenticated users to `/login` on refresh.
- **Per-action**: `GoogleButton` keeps a local `pending` flag → disabled + inline spinner while popup is open.
- **Profile page**: no extra loading state — user data comes from context.

## 14. Toast notification plan
- Mount `<Toaster position="top-right" />` once in `main.jsx`.
- On successful login, show:

  `toast.success('Signed in as ' + (user.displayName || user.email))`
- Prevent duplicate login toasts by guarding with a ref or a toast id.
- On logout success, show:

  `toast.success('Signed out')`
- On auth errors, show:

  `toast.error(message)` alongside inline error text.

## 15. Fallback avatar plan
`Avatar.jsx` accepts `{ src, name, size = 40 }`:
- If `src` truthy, render `<img>` with `onError` setting local `failed=true` (covers expired Google CDN URLs).
- If `!src || failed`, render a Tailwind tile (`bg-gradient-to-br from-slate-200 to-slate-300 text-slate-700 font-semibold`) with initials derived from `name` (first letters of up to two words; `?` if name is empty).
- Used by `Profile` and any future header avatar.

## 16. Tailwind styling direction
- **Tailwind v3 only** (classic config). `tailwind.config.js` `content: ['./index.html','./src/**/*.{js,jsx}']`. `src/index.css` contains the three `@tailwind` directives. No v4 Vite plugin, no `@theme` blocks — one approach, no mixing.
- **Palette**: neutral slate base, single indigo accent for CTAs, rose for destructive (logout).
- **Type**: system font stack; `font-semibold` headings; `text-slate-600` body.
- **Layouts**: `min-h-dvh grid place-items-center bg-slate-50` page; card `max-w-sm w-full bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-8`.
- **Google button**: white surface, slate ring, Google "G" icon, `hover:bg-slate-50 active:scale-[0.99] transition`.
- **Focus**: visible `focus-visible:ring-2 ring-indigo-500 ring-offset-2` on all interactive elements.
- Mobile-first; no custom CSS beyond Tailwind directives.

## 17. Vercel deployment considerations
- **Framework preset**: Vite (auto-detected). Build: `npm run build` → `dist/`.
- **SPA rewrite** — required for deep links like `/profile` to work on refresh. `vercel.json`:
  ```json
  {
    "rewrites": [
      { "source": "/(.*)", "destination": "/index.html" }
    ]
  }
  ```
- **Env vars**: add all six `VITE_FIREBASE_*` in Vercel → Project Settings → Environment Variables for Production, Preview, AND Development. Redeploy after adding (Vite inlines env at build time).
- **Firebase Console → Authentication → Sign-in method**: enable Google provider.
- **Firebase Console → Authentication → Settings → Authorized domains**: add `localhost`, the production Vercel domain (e.g. `myapp.vercel.app` or custom domain), and any preview domains you actually use. `signInWithPopup` returns `auth/unauthorized-domain` if missing — call this out in the README.

## 18. GitHub push workflow
1. `git init && git add . && git commit -m "init"`.
2. Verify `.env` is NOT staged (`git status --ignored`) — only `.env.example` should be committed.
3. Create empty GitHub repo → `git remote add origin <url>` → `git push -u origin main`.
4. Vercel → Import Project → select repo → add the six env vars → Deploy.
5. After first successful deploy, add the resulting Vercel domain to Firebase Authorized domains.
6. Subsequent pushes to `main` auto-deploy; PRs get preview URLs (add their domains to Firebase if you'll test auth on them).

## 19. Future scalability suggestions
- Add `/dashboard` under the same `ProtectedRoute` parent route — no extra wiring.
- Add additional providers (GitHub, email/password) — extend `AuthContext` with `signInWithEmail`, etc.
- Promote to TypeScript: rename `.jsx` → `.tsx`, type `user: User | null` from `firebase/auth`.
- Add Firestore for per-user data, gated by security rules on `request.auth.uid`.
- Add Firebase custom claims for role-based routes (`AdminRoute` wrapper).
- Extract a `useRequireAuth()` hook for finer-grained guards inside components.
- Swap toast lib for shadcn/Sonner if you want richer UI components.

## 20. Final implementation checklist
- [ ] Remove TanStack Start scaffold: `src/routes/`, `src/router.tsx`, `src/server.ts`, `src/start.ts`, `src/routeTree.gen.ts`, and `@tanstack/*` deps in `package.json`.
- [ ] `npm i react-router-dom firebase react-hot-toast lucide-react`.
- [ ] `npm i -D tailwindcss@^3 postcss autoprefixer` → `npx tailwindcss init -p`.
- [ ] Configure `tailwind.config.js` `content`; add `@tailwind base/components/utilities` to `src/index.css`.
- [ ] Create `src/lib/firebase.js` reading `import.meta.env.VITE_FIREBASE_*`.
- [ ] Build `AuthContext` with `onAuthStateChanged`, `signInWithGoogle`, `signOutUser`, `clearError`.
- [ ] Build `ProtectedRoute`, `Avatar`, `Spinner`, `GoogleButton`.
- [ ] Build `Login` (redirect-if-signed-in + clear stale error on mount/retry), `Profile`, `NotFound`.
- [ ] Wire routes in `App.jsx` with `BrowserRouter`; mount `AuthProvider` + `Toaster` in `main.jsx`.
- [ ] Add `.env`, `.env.example`, update `.gitignore`.
- [ ] Add `vercel.json` with `/index.html` rewrite.
- [ ] Create Firebase project → enable Google provider → paste config into `.env`.
- [ ] Add `localhost` + Vercel production domain (+ any preview domains) to Firebase Authorized domains.
- [ ] Smoke test locally: login → redirect → refresh `/profile` (still signed in, no flash) → logout → guarded redirect → revisit `/login` while signed in → bounced to `/profile`.
- [ ] Push to GitHub → import in Vercel → add env vars → deploy → re-test on the production domain.
