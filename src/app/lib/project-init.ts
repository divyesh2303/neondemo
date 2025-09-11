import { execSync } from "child_process";

export async function initializeProjectDatabase(
  databaseUrl: string
): Promise<void> {
  console.log("🔧 Initializing project database...");
  console.log("📍 Database URL:", databaseUrl.replace(/:([^:@]+)@/, ":****@")); // hide password in logs

  try {
    console.log("🚀 Running Prisma migrations...");

    // Run migrations with PROJECT_DATABASE_URL injected dynamically
    execSync(
      ` npx migrate deploy --schema=prisma-project/projectSchema.prisma`,
      {
        stdio: "inherit",
        env: {
          ...process.env,
          PROJECT_DATABASE_URL: databaseUrl, // 👈 inject dynamically
        },
      }
    );

    console.log("✅ Migrations applied successfully");
  } catch (error) {
    console.error("⚠️ Migration failed...", error);
  } finally {
    console.log(
      "📌 Migration step attempted for creating required tables in new Neon project DB"
    );
  }
}
