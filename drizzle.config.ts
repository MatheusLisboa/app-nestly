import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

function withSsl(url: string): string {
  if (!url) return url;
  if (url.includes("sslmode=")) return url;
  return url.includes("?") ? `${url}&sslmode=require` : `${url}?sslmode=require`;
}

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: withSsl(process.env.DATABASE_URL ?? ""),
  },
  strict: true,
  verbose: true,
});
