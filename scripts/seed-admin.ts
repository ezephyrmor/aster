/**
 * Seed script to create admin and HR users in the database
 * Run with: npx tsx scripts/seed-admin.ts
 *
 * This script demonstrates secure password hashing with:
 * - Salt: Explicitly generated and stored in the database
 * - Pepper: Secret value from environment variable
 * - Bcrypt: Industry-standard hashing algorithm
 */

import { PrismaClient } from "@prisma/client";
import { generateSalt, hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

interface UserProfile {
  firstName: string;
  lastName: string;
  positionId: number;
  departmentId: number;
  statusId: number;
}

async function createOrUpdateUser(
  username: string,
  password: string,
  roleId: number,
  profile: UserProfile,
) {
  // Generate explicit salt for demonstration
  const salt = generateSalt();

  // Hash password with salt and pepper
  const passwordHash = await hashPassword(password, salt);

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { username },
    include: { employeeProfile: true },
  });

  if (existingUser) {
    // Update existing user
    await prisma.user.update({
      where: { username },
      data: {
        passwordHash,
        salt,
      },
    });

    // Update role on employee profile
    await prisma.employeeProfile.update({
      where: { userId: existingUser.id },
      data: {
        roleId,
      },
    });

    // Update or create profile
    if (existingUser.employeeProfile) {
      await prisma.employeeProfile.update({
        where: { userId: existingUser.id },
        data: {
          firstName: profile.firstName,
          lastName: profile.lastName,
          positionId: profile.positionId,
          departmentId: profile.departmentId,
          statusId: profile.statusId,
        },
      });
    } else {
      await prisma.employeeProfile.create({
        data: {
          userId: existingUser.id,
          firstName: profile.firstName,
          lastName: profile.lastName,
          positionId: profile.positionId,
          departmentId: profile.departmentId,
          statusId: profile.statusId,
        },
      });
    }

    return { updated: true, userId: existingUser.id };
  } else {
    // Create new user
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
        salt,
        employeeProfile: {
          create: {
            firstName: profile.firstName,
            lastName: profile.lastName,
            roleId,
            positionId: profile.positionId,
            departmentId: profile.departmentId,
            statusId: profile.statusId,
          },
        },
      },
    });

    return { created: true, userId: user.id };
  }
}

async function main() {
  console.log("🌱 Seeding users...\n");
  console.log("🔐 Using salt + pepper + bcrypt for secure password hashing\n");

  try {
    // Get lookup table IDs
    const roles = await prisma.role.findMany();
    const positions = await prisma.position.findMany();
    const departments = await prisma.department.findMany();
    const statuses = await prisma.employeeStatusModel.findMany();

    const adminRole = roles.find((r) => r.name === "admin");
    const hrRole = roles.find((r) => r.name === "hr");
    const activeStatus = statuses.find((s) => s.name === "active");

    if (!adminRole || !hrRole || !activeStatus) {
      console.error(
        "❌ Required lookup data not found. Please run seed-lookup-tables.ts first.",
      );
      process.exit(1);
    }

    // Create admin user
    console.log("📋 Creating Admin User...");
    const adminResult = await createOrUpdateUser(
      "admin",
      "password123",
      adminRole.id,
      {
        firstName: "System",
        lastName: "Administrator",
        positionId:
          positions.find((p) => p.name === "Engineering Manager")?.id ||
          positions[0].id,
        departmentId:
          departments.find((d) => d.name === "Engineering")?.id ||
          departments[0].id,
        statusId: activeStatus.id,
      },
    );
    console.log(
      `✅ Admin user ${adminResult.updated ? "updated" : "created"} successfully`,
    );

    // Create HR user
    console.log("\n📋 Creating HR User...");
    const hrResult = await createOrUpdateUser("hr", "password123", hrRole.id, {
      firstName: "Human",
      lastName: "Resources",
      positionId:
        positions.find((p) => p.name === "Engineering Manager")?.id ||
        positions[0].id,
      departmentId:
        departments.find((d) => d.name === "Human Resources")?.id ||
        departments[0].id,
      statusId: activeStatus.id,
    });
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
  } catch (err) {
    console.error("❌ Error seeding database:", err);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
