/**
 * Seed script to create standard user count for each company
 * Creates 2 HR, 2 Managers, 20 Employees per company (in addition to existing admin)
 * Run with: npx tsx scripts/seed-standard-company-users.ts
 */

import { PrismaClient, Company, Role } from "@prisma/client";
import { generateUsername, generatePassword } from "../src/lib/userGenerator";
import { generateSalt, hashPassword } from "../src/lib/password";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = "Password123!";

interface UserToCreate {
  firstName: string;
  lastName: string;
  email: string;
  roleName: string;
}

async function createUserForCompany(company: Company, role: Role) {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const username = generateUsername(firstName, lastName);
  const salt = generateSalt();
  const passwordHash = await hashPassword(DEFAULT_PASSWORD, salt);

  const user = await prisma.user.create({
    data: {
      companyId: company.id,
      username,
      passwordHash,
      salt,
      employeeProfile: {
        create: {
          roleId: role.id,
          firstName,
          lastName,
          hireDate: faker.date.past({ years: 5 }),
        },
      },
    },
    include: {
      employeeProfile: true,
    },
  });

  return user;
}

async function processCompany(company: Company) {
  console.log(`🏢 Processing company: ${company.name} (id: ${company.id})`);

  // Get company roles
  const roles = await prisma.role.findMany({
    where: { companyId: company.id },
  });

  const roleMap = {
    hr: roles.find((r) => r.name === "hr")!,
    manager: roles.find((r) => r.name === "manager")!,
    employee: roles.find((r) => r.name === "employee")!,
  };

  // Create 2 HR users
  console.log(`   Creating 2 HR users...`);
  for (let i = 0; i < 2; i++) {
    await createUserForCompany(company, roleMap.hr);
  }

  // Create 2 Manager users
  console.log(`   Creating 2 Manager users...`);
  for (let i = 0; i < 2; i++) {
    await createUserForCompany(company, roleMap.manager);
  }

  // Create 20 Employee users
  console.log(`   Creating 20 Employee users...`);
  for (let i = 0; i < 20; i++) {
    await createUserForCompany(company, roleMap.employee);
  }

  console.log(`   ✅ Created 24 new users for ${company.name}`);
  console.log("");
}

async function main() {
  console.log("🌱 Seeding standard company users\n");

  // Get all companies
  const companies = await prisma.company.findMany({
    orderBy: { id: "asc" },
  });

  console.log(`📋 Found ${companies.length} companies\n`);

  for (const company of companies) {
    await processCompany(company);
  }

  console.log("✅ All companies processed successfully!");
  console.log("\n📊 Summary:");
  console.log(`   - Companies processed: ${companies.length}`);
  console.log(`   - New users per company: 24`);
  console.log(`   - Total new users created: ${companies.length * 24}`);
  console.log("\n   Final user count per company:");
  console.log("     • 1 Admin");
  console.log("     • 2 HR");
  console.log("     • 2 Managers");
  console.log("     • 20 Employees");
  console.log("     = 25 total users per company");
  console.log(`\n   Default password for all new users: ${DEFAULT_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding users:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
