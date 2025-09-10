// lib/project-init.ts
import { execSync } from "child_process";
import path from "path";

export async function initializeProjectDatabase(
  databaseUrl: string
): Promise<void> {
  console.log("🔧 Initializing project database...");
  console.log("📍 Database URL:", databaseUrl.replace(/:([^:@]+)@/, ":****@"));

  try {
    console.log("🚀 Running Prisma migrations...");

    // Resolve the local Prisma binary path
    const prismaBinary = path.resolve("node_modules/.bin/prisma");

    execSync(
      `${prismaBinary} migrate deploy --schema=prisma-project/projectSchema.prisma`,
      {
        stdio: "inherit",
        env: {
          ...process.env,
          PROJECT_DATABASE_URL: databaseUrl,
        },
      }
    );

    console.log("✅ Database migrations applied successfully");
  } catch (error) {
    console.error("⚠️ Migration failed...", error);
  } finally {
    console.log(
      "Migration step attempted for creating the USER table in DB of newly created Neon Project"
    );
  }
}
