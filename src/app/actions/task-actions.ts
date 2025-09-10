"use server";

import { prismaMaster } from "@/app/lib/prisma-master"; // master DB
import { getProjectPrismaClient } from "@/app/lib/prisma-project"; // per-project DB
import { pinecone } from "@/app/lib/pinecone";
import { getEmbedding } from "@/app/lib/ai";
import type { Status, Priority } from "@/app/lib/project-client";

// --- Utility: Get Pinecone index for a project ---
async function getTaskIndex(projectId: number) {
  const project = await prismaMaster.project.findUnique({
    where: { id: projectId },
    select: { pineconeIndex: true },
  });
  if (!project?.pineconeIndex) {
    throw new Error("Pinecone index not found for project");
  }
  return pinecone.index(project.pineconeIndex);
}

// --- Get tasks in a group ---
export async function getTasks(projectId: number, groupId: string) {
  const project = await prismaMaster.project.findUnique({
    where: { id: projectId },
    select: { databaseUrl: true },
  });
  if (!project) return [];

  const projectPrisma = getProjectPrismaClient(project.databaseUrl);

  return projectPrisma.task.findMany({
    where: { groupId },
    orderBy: { position: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      createdAt: true,
      groupId: true,
      position: true,
    },
  });
}

// --- Create a new task ---
export async function createTask(
  projectId: number,
  data: {
    title: string;
    description?: string | null;
    status: Status;
    priority: Priority;
    groupId: string;
  }
) {
  const project = await prismaMaster.project.findUnique({
    where: { id: projectId },
    select: { databaseUrl: true },
  });
  if (!project) throw new Error("Project not found");

  const projectPrisma = getProjectPrismaClient(project.databaseUrl);

  const task = await projectPrisma.task.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      status: data.status,
      priority: data.priority,
      groupId: data.groupId,
    },
  });

  try {
    const index = await getTaskIndex(projectId);
    const embedding = await getEmbedding(
      `${task.title} ${task.description ?? ""}`
    );

    await index.namespace(task.groupId).upsert([
      {
        id: String(task.id),
        values: embedding,
        metadata: {
          title: task.title,
          description: task.description ?? "",
          status: task.status,
          priority: task.priority,
        },
      },
    ]);
  } catch (err) {
    console.error("Failed to sync Pinecone:", err);
  }

  return task;
}

// --- Update a task ---
export async function updateTask(
  projectId: number,
  taskId: string,
  data: {
    title?: string;
    description?: string | null;
    status?: Status;
    priority?: Priority;
  }
) {
  const project = await prismaMaster.project.findUnique({
    where: { id: projectId },
    select: { databaseUrl: true },
  });
  if (!project) throw new Error("Project not found");

  const projectPrisma = getProjectPrismaClient(project.databaseUrl);

  const task = await projectPrisma.task.update({
    where: { id: taskId },
    data,
  });

  try {
    const index = await getTaskIndex(projectId);
    const embedding = await getEmbedding(
      `${task.title} ${task.description ?? ""}`
    );

    await index.namespace(task.groupId).upsert([
      {
        id: String(task.id),
        values: embedding,
        metadata: {
          title: task.title,
          description: task.description ?? "",
          status: task.status,
          priority: task.priority,
        },
      },
    ]);
  } catch (err) {
    console.error("Failed to update Pinecone:", err);
  }

  return task;
}

// --- Convenience for drag/drop ---
export async function updateTaskStatus(
  projectId: number,
  taskId: string,
  status: Status
) {
  return updateTask(projectId, taskId, { status });
}

// --- Delete a task ---
export async function deleteTask(projectId: number, taskId: string) {
  const project = await prismaMaster.project.findUnique({
    where: { id: projectId },
    select: { databaseUrl: true },
  });
  if (!project) throw new Error("Project not found");

  const projectPrisma = getProjectPrismaClient(project.databaseUrl);

  const task = await projectPrisma.task.delete({
    where: { id: taskId },
  });

  try {
    const index = await getTaskIndex(projectId);
    await index.namespace(task.groupId).deleteMany([String(task.id)]);
  } catch (err) {
    console.error("Failed to delete from Pinecone:", err);
  }

  return task;
}
