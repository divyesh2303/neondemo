// Use the generated Prisma client from prisma-project
import { PrismaClient } from "../lib/project-client";

const globalForProject = globalThis as unknown as {
  projectClients?: Map<string, PrismaClient>;
};

const projectClientsCache =
  globalForProject.projectClients ?? new Map<string, PrismaClient>();

export function getProjectPrismaClient(databaseUrl: string): PrismaClient {
  if (!projectClientsCache.has(databaseUrl)) {
    const client = new PrismaClient({
      datasources: { db: { url: databaseUrl } },
    });
    projectClientsCache.set(databaseUrl, client);
  }
  return projectClientsCache.get(databaseUrl)!;
}

if (process.env.NODE_ENV !== "production") {
  globalForProject.projectClients = projectClientsCache;
}
