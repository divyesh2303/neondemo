// src/app/lib/getProjectClient.ts
import { prisma, getProjectPrismaClient } from "@/app/lib/prisma";

/**
 * Get a Prisma client connected to a project's database
 */
export async function getProjectClient(projectId: number) {
  // Find project in Master DB
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error(`Project with ID ${projectId} not found`);
  }

  // Return cached Project Prisma client
  return getProjectPrismaClient(project.databaseUrl);
}
