/**
 * Seed script to populate lookup tables for normalized data
 * Run with: npx tsx scripts/seed-lookup-tables.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding lookup tables...\n");

  // Create default company first
  console.log("🏢 Creating default company...");
  await prisma.company.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Aster HR System",
      status: "active",
      timezone: "Asia/Manila",
    },
  });
  console.log("   ✅ Default company created\n");

  // Seed roles for ALL companies
  console.log("📋 Seeding roles for all companies...");
  const roles = [
    { name: "admin", description: "System Administrator" },
    { name: "hr", description: "Human Resources" },
    { name: "manager", description: "Department Manager" },
    { name: "employee", description: "Regular Employee" },
  ];

  const companies = await prisma.company.findMany();
  let roleCount = 0;

  for (const company of companies) {
    for (const role of roles) {
      await prisma.role.upsert({
        where: {
          companyId_name: {
            companyId: company.id,
            name: role.name,
          },
        },
        update: {},
        create: {
          ...role,
          companyId: company.id,
        },
      });
      roleCount++;
    }
  }
  console.log(
    `   ✅ Created ${roleCount} roles for ${companies.length} companies`,
  );

  // Seed employee statuses
  console.log("\n📋 Seeding employee statuses...");
  const statuses = [
    {
      id: 1,
      name: "active",
      description: "Currently active employee",
      color: "green",
      sortOrder: 1,
      isActive: true,
    },
    {
      id: 2,
      name: "probation",
      description: "Probationary employee",
      color: "amber",
      sortOrder: 2,
      isActive: true,
    },
    {
      id: 3,
      name: "contract",
      description: "Contract / temporary worker",
      color: "blue",
      sortOrder: 3,
      isActive: true,
    },
    {
      id: 4,
      name: "on_leave",
      description: "On approved leave",
      color: "indigo",
      sortOrder: 4,
      isActive: true,
    },
    {
      id: 5,
      name: "suspended",
      description: "Suspended pending investigation",
      color: "orange",
      sortOrder: 5,
      isActive: true,
    },
    {
      id: 6,
      name: "inactive",
      description: "Temporarily inactive",
      color: "slate",
      sortOrder: 6,
      isActive: true,
    },
    {
      id: 7,
      name: "resigned",
      description: "Employee resigned",
      color: "violet",
      sortOrder: 7,
      isActive: true,
    },
    {
      id: 8,
      name: "terminated",
      description: "Employment terminated",
      color: "red",
      sortOrder: 8,
      isActive: true,
    },
    {
      id: 9,
      name: "retired",
      description: "Retired employee",
      color: "emerald",
      sortOrder: 9,
      isActive: true,
    },
    {
      id: 10,
      name: "deceased",
      description: "Deceased",
      color: "rose",
      sortOrder: 10,
      isActive: true,
    },
  ];

  for (const status of statuses) {
    const { id, ...statusWithoutId } = status;
    await prisma.employeeStatusModel.upsert({
      where: { name: status.name },
      update: {
        description: status.description,
        color: status.color,
        sortOrder: status.sortOrder,
        isActive: status.isActive,
      },
      create: statusWithoutId,
    });
  }
  console.log(`   ✅ Created ${statuses.length} employee statuses`);

  // Seed common positions
  console.log("\n📋 Seeding positions...");
  const positions = [
    {
      name: "Software Engineer",
      description: "Develops and maintains software applications",
    },
    {
      name: "Senior Software Engineer",
      description: "Senior-level software development role",
    },
    { name: "Engineering Manager", description: "Manages engineering team" },
    {
      name: "Product Manager",
      description: "Manages product strategy and roadmap",
    },
    {
      name: "Designer",
      description: "Creates user interfaces and experiences",
    },
    {
      name: "Data Analyst",
      description: "Analyzes data to inform business decisions",
    },
    {
      name: "DevOps Engineer",
      description: "Manages infrastructure and deployment pipelines",
    },
    {
      name: "QA Engineer",
      description: "Ensures software quality through testing",
    },
    {
      name: "Technical Lead",
      description: "Leads technical direction for projects",
    },
    { name: "Intern", description: "Entry-level training position" },
  ];

  for (const position of positions) {
    await prisma.position.upsert({
      where: {
        companyId_name: {
          companyId: 1,
          name: position.name,
        },
      },
      update: {},
      create: {
        ...position,
        companyId: 1,
      },
    });
  }
  console.log(`   ✅ Created ${positions.length} positions`);

  // NOTE: Departments are now created by seed-multi-company.ts with company-specific appropriate departments
  // No generic departments are seeded here anymore

  // Seed common industries
  console.log("\n📋 Seeding industries...");
  const industries = [
    { name: "Technology", description: "Software and technology companies" },
    { name: "Healthcare", description: "Healthcare and medical services" },
    { name: "Finance", description: "Financial services and banking" },
    { name: "Retail", description: "Retail and e-commerce" },
    { name: "Manufacturing", description: "Manufacturing and production" },
    { name: "Education", description: "Education and training" },
    { name: "Media", description: "Media and entertainment" },
    { name: "Consulting", description: "Business consulting services" },
    { name: "Real Estate", description: "Real estate and property" },
    { name: "Transportation", description: "Transportation and logistics" },
  ];

  for (const industry of industries) {
    await prisma.industry.upsert({
      where: { name: industry.name },
      update: {},
      create: industry,
    });
  }
  console.log(`   ✅ Created ${industries.length} industries`);

  console.log("\n✅ Lookup tables seeded successfully!");
  console.log("\n📊 Summary:");
  console.log(`   - Roles: ${roles.length}`);
  console.log(`   - Employee Statuses: ${statuses.length}`);
  console.log(`   - Positions: ${positions.length}`);
  console.log(
    `   - Departments: See seed-multi-company.ts for company-specific departments`,
  );
  console.log(`   - Industries: ${industries.length}`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding lookup tables:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
