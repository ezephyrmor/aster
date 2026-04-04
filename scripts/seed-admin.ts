/**
 * Seed script to create an admin user in the database
 * Run with: npx tsx scripts/seed-admin.ts
 */

import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Seeding admin user...");

  const username = "admin";
  const password = "password123";
  const saltRounds = 12;

  // Hash the password
  const passwordHash = await bcrypt.hash(password, saltRounds);
  console.log("🔒 Password hashed successfully");

  // Connect to MySQL
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "aster_root_password",
    database: "aster_db",
  });

  try {
    // Check if admin user already exists
    const [rows] = await connection.execute(
      "SELECT id, username, password_hash FROM users WHERE username = ?",
      [username],
    );

    const existingUser = Array.isArray(rows) ? rows[0] : null;

    if (existingUser) {
      console.log("⚠️  Admin user already exists. Updating password...");
      await connection.execute(
        "UPDATE users SET password_hash = ? WHERE username = ?",
        [passwordHash, username],
      );
      console.log("✅ Admin password updated successfully");
    } else {
      // Create admin user
      await connection.execute(
        "INSERT INTO users (username, password_hash) VALUES (?, ?)",
        [username, passwordHash],
      );
      console.log("✅ Admin user created successfully");
    }

    console.log("\n📋 Login credentials:");
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log("\n🔒 Remember to change the password in production!");
  } finally {
    await connection.end();
  }
}

main().catch((e) => {
  console.error("❌ Error seeding database:", e);
  process.exit(1);
});
