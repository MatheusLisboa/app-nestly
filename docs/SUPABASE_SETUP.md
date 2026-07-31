# Supabase setup — MyNinho (Auth + Workspace + core modules)

## 1. Create project

1. Create a project at [supabase.com](https://supabase.com)
2. Copy URL and anon key into `.env.local`:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
NEXT_PUBLIC_SUPABASE_AUTH_REDIRECT_URL=http://localhost:3000/auth/callback
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
DATABASE_URL=postgresql://postgres.YOUR_REF:YOUR_PASSWORD@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

Use the **Session pooler** connection string (port **5432**). Avoid Transaction pooler (`6543`) with `drizzle-kit`.
If the password has special characters, copy the URI from the dashboard or URL-encode it.

## 2. Auth providers

In Supabase Dashboard → **Authentication → Providers**:

- Enable **Email** (Email/Password — disable Magic Link if you prefer password-only)
- Enable **Google** (optional; add Client ID / Secret from Google Cloud Console)

For local development, disable **Confirm email** under Authentication → Providers → Email  
(or keep it on and use the confirmation message after sign-up).

In **Authentication → URL Configuration**:

- Site URL: `http://localhost:3000`
- Redirect URLs must include:
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/**` (optional wildcard for local)

Auth flow (e-mail/senha):

1. **Entrar** com e-mail + senha → sessão → `/`
2. **Cadastre-se** com nome, e-mail, senha → cria `auth.users` + upsert em `profiles` (`display_name`, `email`, `locale`)
3. Sem Família → `/onboarding` · Com Família → dashboard

Google OAuth continua disponível (opcional) e usa `/auth/callback`.

## 3. Database schema

### Option A — Drizzle push (recommended while iterating)

```bash
npm run db:push
```

Then run RLS + seed SQL in the Supabase **SQL Editor**, in order:

1. `src/db/rls/001_workspace_rls.sql`
2. `src/db/rls/002_profile_trigger.sql`
3. `src/db/rls/003_shopping_inventory_rls.sql`
4. `src/db/rls/004_permissions_seed.sql`
5. `src/db/rls/005_fix_workspace_create.sql` (atomic create workspace + owner)
6. `src/db/rls/006_checklists_rls.sql` (tables + RLS — safe idempotent SQL; prefer over `db:push` for this module)
7. `src/db/rls/007_cleaning_rls.sql` (cleaning tasks + logs + RLS)
8. `src/db/rls/008_bills_rls.sql` (household bills + RLS)
9. `src/db/rls/009_calendar_rls.sql` (calendar events + RLS)
10. `src/db/rls/010_baby_rls.sql` (baby profile + care logs + RLS)
11. `src/db/rls/011_baby_refine.sql` (gestação/nascido + enxoval/farmácia/quarto)
12. `src/db/rls/012_baby_prep_items_category.sql` (categoria Itens + sugestões por tamanho)

### Option B — Generate migrations

```bash
npm run db:generate
npm run db:migrate
```

Then apply the same RLS SQL files above.

## 4. Verify

```bash
npm run dev
```

1. Open `/login` → e-mail/senha ou Google  
2. Create a Família on `/onboarding`  
3. Invite partner in **Settings**  
4. Use **Compras**, **Estoque**, **Checklists**, **Limpeza**, **Contas**, **Agenda** e **Bebê**  
5. From Estoque “Acabando” → **Comprar** (adds to shopping list)  
6. Em Checklists: criar lista → itens → marcar → **Recomeçar**  
7. Em Limpeza: criar tarefa com frequência → **Marquei limpo**  
8. Em Contas: cadastrar conta mensal → **Paguei** (avança o vencimento)  
9. Em Agenda: ver **Próximos** + criar eventos  
10. Em Bebê: gestação ou nascido → enxoval / farmácia / quarto → cuidados (se nascido)

## Troubleshooting

### `URIError: URI malformed`
A senha do banco tem caracteres especiais (`%`, `@`, `#`, etc.).  
Encode a senha com `encodeURIComponent`, ou copie a URI pronta do dashboard (já vem encoded).

### `db:push` fica em “Pulling schema…”
Muitas vezes é falha de auth. Teste:

```bash
node -e "require('dotenv').config({path:'.env.local'}); const postgres=require('postgres'); const sql=postgres(process.env.DATABASE_URL,{ssl:'require',connect_timeout:8,prepare:false}); sql\`select 1\`.then(r=>{console.log('ok',r); return sql.end()}).catch(e=>{console.error(e.message); process.exit(1)})"
```

Se aparecer `password authentication failed`:
1. Supabase → **Project Settings → Database → Database password → Reset**
2. Copie de novo a **Connection string (URI)** — Session pooler, porta `5432`
3. Cole em `DATABASE_URL` (substitua `[YOUR-PASSWORD]` se o dashboard deixar placeholder)
4. Rode `npm run db:push` outra vez

Prefira **Session pooler (`5432`)** ou **Direct**. Evite Transaction pooler (`6543`) com Drizzle Kit.
