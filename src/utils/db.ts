import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Connection pool configuration for PostgreSQL
export const dbConfig = {
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || "20"),
  acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT || "60000"),
  timeout: parseInt(process.env.DB_TIMEOUT || "60000"),
  releaseTimeout: parseInt(process.env.DB_RELEASE_TIMEOUT || "60000"),
};

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});