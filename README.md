# MyNinho

House OS SaaS — modular monolith (Feature First).

## Stack

- Next.js 15 (App Router) · React 19 · TypeScript
- Tailwind CSS v4 · shadcn-style primitives · Motion · Lucide
- TanStack Query · Zustand · React Hook Form · Zod
- Supabase · PostgreSQL · Drizzle ORM
- IndexedDB + Dexie (Offline First)
- PWA (Serwist) · Vitest · Playwright · Biome

## Multi-tenant

The primary unit is a **Workspace** (UI may say "Família").  
All shared data is scoped by `workspace_id` with Supabase RLS.

## Getting started

```bash
cp .env.example .env.local
# fill Supabase + DATABASE_URL values

npm install
npm run dev
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run lint` | Biome check |
| `npm run format` | Biome format |
| `npm run typecheck` | TypeScript |
| `npm run test` | Vitest |
| `npm run test:e2e` | Playwright |
| `npm run db:generate` | Drizzle generate |
| `npm run db:migrate` | Drizzle migrate |
| `npm run db:studio` | Drizzle Studio |

## Architecture

```
src/
  app/                 # routes only (composition)
  features/            # Feature First modules
  db/                  # Drizzle schema + RLS SQL
  lib/                 # infra (supabase, offline, actions)
  config/              # brand, env, app constants
  messages/            # i18n (pt-BR)
  styles/              # design tokens
```

## Phase 1 + 2 — Auth, Workspace, Shopping, Inventory

See **[docs/SUPABASE_SETUP.md](./docs/SUPABASE_SETUP.md)** for the full checklist.

```bash
cp .env.example .env.local
# fill Supabase credentials
npm run db:push
# then run SQL files in src/db/rls/ (001 → 004) in the Supabase SQL editor
npm run dev
```

Without Supabase credentials, the shell still loads for local UI work; auth stays disabled.

Phase 0 delivers foundation. Phase 1 = Auth + Workspace. Phase 2 = Shopping + Inventory (offline adapters registered).
