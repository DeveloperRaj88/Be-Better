# Be Better

Dark responsive productivity app built with React + Vite + TypeScript + Tailwind + Supabase.

## 1. Requirements
- Node.js 18+
- A Supabase project
- VS Code

## 2. Install
```bash
npm install
```

## 3. Supabase
Open Supabase Dashboard → SQL Editor → paste and run:
`supabase/migrations/001_initial_schema.sql`

Then enable Email auth under Authentication → Providers.

## 4. Environment
Copy `.env.example` to `.env` and fill:
```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```
Never put the Supabase service-role key in Vite/client code.

## 5. Run
```bash
npm run dev
```

## 6. Production build
```bash
npm run build
npm run preview
```

## 7. Daily quote
The frontend has a safe fallback and can fetch a daily quote. For production, deploy the included Supabase Edge Function and call it from the client if you want all quote fetching server-side.

## 8. Reports
Email/WhatsApp delivery requires a provider (for example an email transactional service and an approved WhatsApp Business provider). Put provider secrets only in Supabase Edge Function secrets. Do not claim delivery until the provider returns success.

## Important
The dashboard's streak is currently a UI MVP value. For production, calculate it from completed task dates rather than hardcoding it.
