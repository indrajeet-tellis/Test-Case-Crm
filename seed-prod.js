// Simple production seed script using raw pg (no Prisma dependency needed)
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
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
