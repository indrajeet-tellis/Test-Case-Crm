// Simple production seed script using raw pg (no Prisma dependency needed)
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // Ensure module column exists on TestCase table
    await pool.query(`
      ALTER TABLE "TestCase" ADD COLUMN IF NOT EXISTS "module" TEXT;
    `).catch(() => {
      console.log("Module column already exists or table not ready yet.");
    });

    // Ensure ActivityLog table exists (Manual sync for production if prisma db push has issues)
    // Note: Normally prisma db push handles this, but raw SQL ensures it for standalone builds
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "ActivityLog" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "projectId" TEXT,
        "action" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "metadata" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "ActivityLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE
      );
    `).catch((err) => {
      console.log("ActivityLog table sync skipped or failed:", err.message);
    });

    // Check if admin already exists
    const check = await pool.query(
      "SELECT id FROM \"User\" WHERE email = $1",
      ["indrajeet@tellistechnologies.com"]
    );

    if (check.rows.length > 0) {
      console.log("Admin user already exists, skipping seed.");
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("Tellis@$#2026", 10);
    const id = require("crypto").randomBytes(12).toString("hex");

    await pool.query(
      `INSERT INTO "User" (id, name, email, password, role, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [id, "Indrajeet Admin", "indrajeet@tellistechnologies.com", hashedPassword, "ADMIN"]
    );

    console.log("Admin user created successfully!");
  } catch (err) {
    console.error("Seed error:", err.message);
  } finally {
    await pool.end();
  }
}

main();
