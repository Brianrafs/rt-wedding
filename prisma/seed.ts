import "dotenv/config";
import { getDb } from "../src/lib/db";
import { parseEnv } from "../src/schemas/env.schema";
import { assertLocalSeed, seedDevelopmentData, seedInitialAdmin } from "./seed-data";

async function main() {
  assertLocalSeed(parseEnv(process.env));
  const db = getDb();
  try {
    await seedDevelopmentData(db);
    await seedInitialAdmin(db, {
      username: process.env.ADMIN_INITIAL_USERNAME,
      password: process.env.ADMIN_INITIAL_PASSWORD,
    });
    console.info("Development seed completed.");
  } finally {
    await db.$disconnect();
  }
}

main().catch(() => {
  console.error("Development seed failed. Check local configuration and apply migrations first.");
  process.exitCode = 1;
});
