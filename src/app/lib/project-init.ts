import { execSync } from "child_process";
import path from "path";
import fs from "fs";

export async function initializeProjectDatabase(
  databaseUrl: string
): Promise<void> {
  console.log("🔧 Initializing project database...");
  console.log("📍 Database URL:", databaseUrl.replace(/:([^:@]+)@/, ":****@")); // hide password in logs

  try {
    console.log("🚀 Running Prisma migrations...");

    // Resolve the Prisma binary path from local node_modules
    const prismaBinary = path.resolve("./node_modules/.bin/prisma");
    console.log("📍 Looking for Prisma binary at:", prismaBinary);

    if (!fs.existsSync(prismaBinary)) {
      console.error("❌ Prisma binary not found in node_modules/.bin");
      console.log(
        "📂 node_modules/.bin contents:",
        fs.readdirSync("./node_modules/.bin")
      );
      throw new Error("Prisma CLI missing in deployment");
    }

    // Run migrations with PROJECT_DATABASE_URL injected dynamically
    execSync(
      `${prismaBinary} migrate deploy --schema=prisma-project/projectSchema.prisma`,
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
