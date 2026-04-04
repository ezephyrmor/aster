/**
 * Seed script to create admin and HR users in the database
 * Run with: npx tsx scripts/seed-admin.ts
 *
 * This script demonstrates secure password hashing with:
 * - Salt: Explicitly generated and stored in the database
 * - Pepper: Secret value from environment variable
 * - Bcrypt: Industry-standard hashing algorithm
 */

import mysql from "mysql2/promise";
import { generateSalt, hashPassword } from "../src/lib/password";

interface UserProfile {
  firstName: string;
  lastName: string;
  position?: string;
  department?: string;
}

async function createOrUpdateUser(
  connection: mysql.Connection,
  username: string,
  password: string,
  role: string,
  profile: UserProfile,
) {
  // Generate explicit salt for demonstration
  const salt = generateSalt();

  // Hash password with salt and pepper
  const passwordHash = await hashPassword(password, salt);

  // Check if user exists
  const [rows] = await connection.execute(
    "SELECT id, username FROM users WHERE username = ?",
    [username],
  );

  const existingUser =
    Array.isArray(rows) && rows.length > 0 ? (rows[0] as any) : null;

  if (existingUser) {
    // Update existing user
    await connection.execute(
      "UPDATE users SET password_hash = ?, salt = ?, role = ? WHERE username = ?",
      [passwordHash, salt, role, username],
    );

    // Update or create profile
    const [profileRows] = await connection.execute(
      "SELECT id FROM employee_profiles WHERE user_id = ?",
      [existingUser.id],
    );

    const existingProfile =
      Array.isArray(profileRows) && profileRows.length > 0
        ? (profileRows[0] as any)
        : null;

    if (existingProfile) {
      await connection.execute(
        `UPDATE employee_profiles SET 
         first_name = ?, last_name = ?, position = ?, department = ?, updated_at = NOW()
         WHERE user_id = ?`,
        [
          profile.firstName,
          profile.lastName,
          profile.position,
          profile.department,
          existingUser.id,
        ],
      );
    } else {
      await connection.execute(
        `INSERT INTO employee_profiles 
         (user_id, first_name, last_name, position, department, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          existingUser.id,
          profile.firstName,
          profile.lastName,
          profile.position,
          profile.department,
        ],
      );
    }

    return { updated: true, userId: existingUser.id };
  } else {
    // Create new user
    const [result] = await connection.execute(
      "INSERT INTO users (username, password_hash, salt, role) VALUES (?, ?, ?, ?)",
      [username, passwordHash, salt, role],
    );

    const userId = (result as mysql.ResultSetHeader).insertId;

    // Create profile
    await connection.execute(
      `INSERT INTO employee_profiles 
       (user_id, first_name, last_name, position, department, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        userId,
        profile.firstName,
        profile.lastName,
        profile.position,
        profile.department,
      ],
    );

    return { created: true, userId };
  }
}

async function main() {
  console.log("🌱 Seeding users...\n");
  console.log("🔐 Using salt + pepper + bcrypt for secure password hashing\n");

  // Connect to MySQL
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "aster_root_password",
    database: "aster_db",
  });

  try {
    // Create admin user
    console.log("📋 Creating Admin User...");
    const adminResult = await createOrUpdateUser(
      connection,
      "admin",
      "password123",
      "admin",
      {
        firstName: "System",
        lastName: "Administrator",
        position: "System Administrator",
        department: "IT",
      },
    );
    console.log(
      `✅ Admin user ${adminResult.updated ? "updated" : "created"} successfully`,
    );

    // Create HR user
    console.log("\n📋 Creating HR User...");
    const hrResult = await createOrUpdateUser(
      connection,
      "hr",
      "password123",
      "hr",
      {
        firstName: "Human",
        lastName: "Resources",
        position: "HR Manager",
        department: "Human Resources",
      },
    );
    console.log(
      `✅ HR user ${hrResult.updated ? "updated" : "created"} successfully`,
    );

    console.log("\n📋 Login credentials:");
    console.log("   Admin: username='admin', password='password123'");
    console.log("   HR: username='hr', password='password123'");

    console.log("\n🔐 Security features demonstrated:");
    console.log("   • Salt: Explicitly stored in database (unique per user)");
    console.log(
      "   • Pepper: Secret value from PASSWORD_PEPPER environment variable",
    );
    console.log("   • Bcrypt: 12 rounds of hashing");

    console.log("\n🔒 Remember to change the passwords in production!");
  } finally {
    await connection.end();
  }
}

main().catch((e) => {
  console.error("❌ Error seeding database:", e);
  process.exit(1);
});
