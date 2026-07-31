import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_SUPABASE_AUTH_REDIRECT_URL: z.string().url().optional(),
});

export type ClientEnv = z.infer<typeof clientSchema>;
export type ServerEnv = z.infer<typeof serverSchema> & ClientEnv;

function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  return (
    value.includes("your-project") ||
    value.includes("your-anon-key") ||
    value.includes("your-service-role-key") ||
    value.includes("password@db.your-project")
  );
}

function getClientEnv(): ClientEnv {
  return clientSchema.parse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_AUTH_REDIRECT_URL: process.env.NEXT_PUBLIC_SUPABASE_AUTH_REDIRECT_URL,
  });
}

export function getServerEnv(): ServerEnv {
  const client = getClientEnv();
  const server = serverSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
  return { ...client, ...server };
}

export function getPublicEnv(): ClientEnv {
  return getClientEnv();
}

/** True when Supabase public credentials are real (not placeholders). */
export function isSupabaseConfigured(): boolean {
  const env = getClientEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return false;
  if (isPlaceholder(url) || isPlaceholder(key)) return false;

  return true;
}
