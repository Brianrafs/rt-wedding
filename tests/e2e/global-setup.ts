import { mkdir, readFile, readdir, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { createClient } from "@libsql/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../../src/generated/prisma/client";
import { seedDevelopmentData, seedInitialAdmin } from "../../prisma/seed-data";

export default async function globalSetup() {
  const databasePath = resolve("test-results/e2e/e2e.db");
  await mkdir(resolve("test-results/e2e"), { recursive: true });
  await rm(databasePath, { force: true });
  const url = `file:${databasePath.replaceAll("\\", "/")}`;
  const migrationClient = createClient({ url });
  try {
    const migrationRoot = resolve("prisma/migrations");
    const migrations = (await readdir(migrationRoot, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
    for (const migration of migrations) {
      await migrationClient.executeMultiple(await readFile(join(migrationRoot, migration, "migration.sql"), "utf8"));
    }
  } finally {
    migrationClient.close();
  }

  const db = new PrismaClient({ adapter: new PrismaLibSql({ url }) });
  try {
    await seedDevelopmentData(db);
    await seedInitialAdmin(db, { username: "admin-e2e", password: "test-password-123" });
  } finally {
    await db.$disconnect();
  }
}
