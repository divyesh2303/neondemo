import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prismaMaster?: PrismaClient;
};

export const prismaMaster =
  globalForPrisma.prismaMaster ??
  new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL! } },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaMaster = prismaMaster;
}
