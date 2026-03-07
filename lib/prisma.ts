import { PrismaClient } from "@prisma/client";

// Prevent multiple PrismaClient instances in development (hot-reload)
// and avoid connection pool exhaustion in serverless (one instance per function).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
