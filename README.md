# Nestly

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
| `npm run db:push` | Drizzle push (dev) |
| `npm run brand:assets` | Regenerate favicon / PWA / OG icons |

## Docs

- [Supabase setup](./docs/SUPABASE_SETUP.md)

## License

Private — Nestly.
