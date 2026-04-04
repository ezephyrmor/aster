/**
 * Seed script to create an admin user in the database
 * Run with: npx tsx scripts/seed-admin.ts
 *
 * This script demonstrates secure password hashing with:
 * - Salt: Explicitly generated and stored in the database
 * - Pepper: Secret value from environment variable
 * - Bcrypt: Industry-standard hashing algorithm
 */

import mysql from "mysql2/promise";
import { generateSalt, hashPassword } from "../src/lib/password";

async function main() {
  console.log("🌱 Seeding admin user...");
  console.log("🔐 Using salt + pepper + bcrypt for secure password hashing\n");

  const username = "admin";
  const password = "password123";

  // Generate explicit salt for demonstration
  const salt = generateSalt();
  console.log(`🧂 Generated salt: ${salt.substring(0, 29)}...`);

  // Hash password with salt and pepper
  const passwordHash = await hashPassword(password, salt);
  console.log(`🔒 Hashed password: ${passwordHash.substring(0, 30)}...`);

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
      "SELECT id, username, password_hash, salt FROM users WHERE username = ?",
      [username],
    );

    const existingUser = Array.isArray(rows) ? rows[0] : null;

    if (existingUser) {
      console.log(
        "⚠️  Admin user already exists. Updating password and salt...",
      );
      await connection.execute(
        "UPDATE users SET password_hash = ?, salt = ? WHERE username = ?",
        [passwordHash, salt, username],
      );
      console.log("✅ Admin password and salt updated successfully");
    } else {
      // Create admin user with salt
      await connection.execute(
        "INSERT INTO users (username, password_hash, salt) VALUES (?, ?, ?)",
        [username, passwordHash, salt],
      );
      console.log("✅ Admin user created successfully");
    }

    console.log("\n📋 Login credentials:");
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log("\n🔐 Security features demonstrated:");
    console.log("   • Salt: Explicitly stored in database (unique per user)");
    console.log(
      "   • Pepper: Secret value from PASSWORD_PEPPER environment variable",
    );
    console.log("   • Bcrypt: 12 rounds of hashing");
    console.log("\n🔒 Remember to change the password in production!");
  } finally {
    await connection.end();
  }
}

main().catch((e) => {
  console.error("❌ Error seeding database:", e);
  process.exit(1);
});
