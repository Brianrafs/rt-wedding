import "dotenv/config";
import { defineConfig } from "prisma/config";
import { prismaCliDatasource } from "./src/lib/database-config";

const datasource = prismaCliDatasource();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node --conditions=react-server --import tsx prisma/seed.ts",
  },
  // Prisma CLI manages local SQLite only. Reviewed SQL goes to Turso separately.
  ...(datasource ? { datasource } : {}),
});
