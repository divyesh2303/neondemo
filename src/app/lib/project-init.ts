// lib/project-init.ts
import { execSync } from "child_process";

export async function initializeProjectDatabase(
  databaseUrl: string
): Promise<void> {
  console.log("🔧 Initializing project database...");
  console.log("📍 Database URL:", databaseUrl.replace(/:([^:@]+)@/, ":****@")); // Hide password in logs

  try {
    console.log("🚀 Running Prisma migrations...");

    try {
      // Run Prisma migrations instead of db push
      execSync(
        `prisma migrate deploy --schema=prisma-project/projectSchema.prisma`,
        {
          stdio: "inherit",
          env: {
            ...process.env,
            PROJECT_DATABASE_URL: databaseUrl,
          },
        }
      );

      console.log("✅ Database migrations applied successfully");
    } catch (migrateError) {
      console.error("⚠️ Migration failed...", migrateError);
    }
  } catch (error) {
    console.error("❌ Failed to initialize project database:", error);
  } finally {
    console.log(
      "Migration step attempted for creating the USER table in DB of newly created Neon Project"
    );
  }
}
