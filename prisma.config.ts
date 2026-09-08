import "dotenv/config";
import { defineConfig } from "prisma/config";
import { localDatabaseUrl } from "./src/lib/database-config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node --conditions=react-server --import tsx prisma/seed.ts",
  },
  // Prisma CLI manages local SQLite only. Reviewed SQL goes to Turso separately.
  datasource: { url: localDatabaseUrl(process.env.DATABASE_URL || undefined) },
});
