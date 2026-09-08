import "server-only";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/generated/prisma/client";
import { databaseConfig } from "@/lib/database-config";
import { getServerEnv } from "@/lib/env";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
let productionClient: PrismaClient | undefined;

export function getDb(): PrismaClient {
  const env = getServerEnv();
  if (env.NODE_ENV === "production") {
    return productionClient ??= new PrismaClient({
      adapter: new PrismaLibSql(databaseConfig(env)),
    });
  }
  return globalForPrisma.prisma ??= new PrismaClient({
    adapter: new PrismaLibSql(databaseConfig(env)),
  });
}
