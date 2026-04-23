/**
 * Fix script to create roles for all companies and assign them evenly to users
 * Run with: npx tsx scripts/fix-company-roles.ts
 */

import { PrismaClient, Company, Role } from "@prisma/client";

const prisma = new PrismaClient();

const STANDARD_ROLES = [
  { name: "admin", description: "System Administrator" },
  { name: "hr", description: "Human Resources" },
  { name: "manager", description: "Department Manager" },
  { name: "employee", description: "Regular Employee" },
];

// Fisher-Yates shuffle algorithm
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

async function createCompanyRoles(company: Company): Promise<Role[]> {
  console.log(
    `   Creating roles for company: ${company.name} (id: ${company.id})`,
  );

  const createdRoles: Role[] = [];

  for (const roleData of STANDARD_ROLES) {
    const role = await prisma.role.upsert({
      where: {
        companyId_name: {
          companyId: company.id,
          name: roleData.name,
        },
      },
      update: {},
      create: {
        ...roleData,
        companyId: company.id,
      },
    });
    createdRoles.push(role);
  }

  return createdRoles;
}

async function assignRolesToCompanyUsers(company: Company, roles: Role[]) {
  console.log(`   Assigning roles to users in ${company.name}...`);

  const users = await prisma.user.findMany({
    where: { companyId: company.id },
    select: { id: true },
  });

  if (users.length === 0) {
    console.log(`   ⚠️ No users found for company ${company.name}`);
    return;
  }

  console.log(`   Found ${users.length} users`);

  // Get role ids by name
  const roleIds = {
    admin: roles.find((r) => r.name === "admin")!.id,
    hr: roles.find((r) => r.name === "hr")!.id,
    manager: roles.find((r) => r.name === "manager")!.id,
    employee: roles.find((r) => r.name === "employee")!.id,
  };

  // Shuffle users for random assignment
  const shuffledUserIds = shuffle(users.map((u) => u.id));

  // Calculate role distribution
  const totalUsers = shuffledUserIds.length;

  const assignments: { userId: number; roleId: number }[] = [];
  let index = 0;

  // 1 Admin always
  assignments.push({ userId: shuffledUserIds[index++], roleId: roleIds.admin });

  // 2 HR or 1 if very small company
  const hrCount = Math.min(2, Math.max(1, Math.floor(totalUsers * 0.05)));
  for (let i = 0; i < hrCount && index < totalUsers; i++) {
    assignments.push({ userId: shuffledUserIds[index++], roleId: roleIds.hr });
  }

  // 20% Managers (minimum 1)
  const managerCount = Math.max(1, Math.floor(totalUsers * 0.2));
  for (let i = 0; i < managerCount && index < totalUsers; i++) {
    assignments.push({
      userId: shuffledUserIds[index++],
      roleId: roleIds.manager,
    });
  }

  // Remaining as Employees
  for (let i = index; i < totalUsers; i++) {
    assignments.push({ userId: shuffledUserIds[i], roleId: roleIds.employee });
  }

  console.log(
    `   Distribution: 1 Admin, ${hrCount} HR, ${managerCount} Managers, ${totalUsers - index} Employees`,
  );

  // Update all users
  for (const assignment of assignments) {
    await prisma.employeeProfile.update({
      where: { userId: assignment.userId },
      data: { roleId: assignment.roleId },
    });
  }

  console.log(`   ✅ Assigned roles to ${assignments.length} users`);
}

async function main() {
  console.log("🔧 Fixing company roles and user assignments\n");

  // Get all companies
  console.log("📋 Fetching all companies...");
  const companies = await prisma.company.findMany({
    orderBy: { id: "asc" },
  });

  console.log(`   Found ${companies.length} companies\n`);

  // Process each company
  for (const company of companies) {
    console.log(`🏢 Processing company: ${company.name} (id: ${company.id})`);

    // Step 1: Create standard roles for this company
    const roles = await createCompanyRoles(company);

    // Step 2: Assign roles evenly to users in this company
    await assignRolesToCompanyUsers(company, roles);

    console.log("");
  }

  console.log("✅ All companies processed successfully!");
  console.log("\n📊 Summary:");
  console.log(`   - Companies processed: ${companies.length}`);
  console.log(`   - Roles created per company: ${STANDARD_ROLES.length}`);
  console.log("   - Roles assigned evenly with distribution:");
  console.log("     • 1 Admin");
  console.log("     • 1-2 HR");
  console.log("     • 20% Managers");
  console.log("     • Remaining Employees");
}

main()
  .catch((e) => {
    console.error("❌ Error fixing roles:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
