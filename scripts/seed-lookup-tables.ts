/**
 * Seed script to populate lookup tables for normalized data
 * Run with: npx tsx scripts/seed-lookup-tables.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding lookup tables...\n");

  // Seed roles
  console.log("📋 Seeding roles...");
  const roles = [
    { id: 1, name: "admin", description: "System Administrator" },
    { id: 2, name: "hr", description: "Human Resources" },
    { id: 3, name: "employee", description: "Regular Employee" },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }
  console.log(`   ✅ Created ${roles.length} roles`);

  // Seed employee statuses
  console.log("\n📋 Seeding employee statuses...");
  const statuses = [
    { id: 1, name: "active", description: "Currently active employee" },
    { id: 2, name: "on_leave", description: "On temporary leave" },
    { id: 3, name: "terminated", description: "Employment terminated" },
    { id: 4, name: "inactive", description: "Inactive employee" },
  ];

  for (const status of statuses) {
    await prisma.employeeStatusModel.upsert({
      where: { name: status.name },
      update: {},
      create: status,
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
      where: { name: position.name },
      update: {},
      create: position,
    });
  }
  console.log(`   ✅ Created ${positions.length} positions`);

  // Seed common departments
  console.log("\n📋 Seeding departments...");
  const departments = [
    {
      name: "Engineering",
      description: "Software development and technical operations",
    },
    { name: "Product", description: "Product management and strategy" },
    { name: "Design", description: "User experience and interface design" },
    { name: "Marketing", description: "Marketing and brand management" },
    { name: "Sales", description: "Sales and business development" },
    { name: "Human Resources", description: "HR and people operations" },
    { name: "Finance", description: "Financial planning and accounting" },
    { name: "Operations", description: "Business operations and logistics" },
    { name: "Customer Success", description: "Customer support and success" },
    { name: "Legal", description: "Legal and compliance" },
  ];

  for (const department of departments) {
    await prisma.department.upsert({
      where: { name: department.name },
      update: {},
      create: department,
    });
  }
  console.log(`   ✅ Created ${departments.length} departments`);

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
  console.log(`   - Departments: ${departments.length}`);
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
