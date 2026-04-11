import { PrismaClient } from "@prisma/client";
import { generateSalt, hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding demo companies...");

  const companies = [
    {
      id: 1,
      name: "Aster HR System",
      status: "active",
      timezone: "Asia/Manila",
      profile: {
        legalName: "Aster HR System Inc.",
        email: "admin@aster.local",
        country: "Philippines",
        city: "Manila",
      },
    },
    {
      id: 2,
      name: "Acme Corporation",
      status: "active",
      timezone: "America/New_York",
      profile: {
        legalName: "Acme Corporation International",
        email: "contact@acme-corp.com",
        country: "United States",
        city: "New York",
      },
    },
    {
      id: 3,
      name: "Global Tech Solutions",
      status: "active",
      timezone: "Europe/London",
      profile: {
        legalName: "Global Tech Solutions Ltd.",
        email: "info@globaltechsolutions.co.uk",
        country: "United Kingdom",
        city: "London",
      },
    },
    {
      id: 4,
      name: "Pacific Retail Group",
      status: "active",
      timezone: "Australia/Sydney",
      profile: {
        legalName: "Pacific Retail Group Pty Ltd",
        email: "support@pacificretail.com.au",
        country: "Australia",
        city: "Sydney",
      },
    },
    {
      id: 5,
      name: "Metro Healthcare Services",
      status: "active",
      timezone: "Asia/Tokyo",
      profile: {
        legalName: "Metro Healthcare Services KK",
        email: "hr@metrohealthcare.jp",
        country: "Japan",
        city: "Tokyo",
      },
    },
  ];

  // Get admin role first
  const adminRole = await prisma.role.findFirst({
    where: {
      companyId: 1,
      name: "admin",
    },
  });

  if (!adminRole) {
    console.error("❌ Admin role not found. Run seed-lookup-tables first.");
    process.exit(1);
  }

  // Get default position and department
  const defaultPosition = await prisma.position.findFirst({
    where: { companyId: 1 },
  });
  const defaultDepartment = await prisma.department.findFirst({
    where: { companyId: 1 },
  });
  const activeStatus = await prisma.employeeStatusModel.findFirst({
    where: { name: "active" },
  });

  for (const companyData of companies) {
    const { profile, ...company } = companyData;

    const createdCompany = await prisma.company.upsert({
      where: { id: company.id },
      update: {},
      create: {
        ...company,
        profiles: {
          create: profile,
        },
      },
    });

    console.log(
      `✅ Company created: ${createdCompany.name} (ID: ${createdCompany.id})`,
    );

    // Create admin user for this company
    const slug = createdCompany.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    const adminUsername = `admin-${slug}`;

    // Generate password
    const salt = generateSalt();
    const passwordHash = await hashPassword("password123", salt);

    // Create admin user if doesn't exist
    const existingAdmin = await prisma.user.findUnique({
      where: { username: adminUsername },
    });

    if (!existingAdmin) {
      await prisma.user.create({
        data: {
          username: adminUsername,
          passwordHash,
          salt,
          companyId: createdCompany.id,
          roleId: adminRole.id,
          employeeProfile: {
            create: {
              firstName: createdCompany.name,
              lastName: "Administrator",
              positionId: defaultPosition?.id || 1,
              departmentId: defaultDepartment?.id || 1,
              statusId: activeStatus?.id || 1,
            },
          },
        },
      });

      console.log(`   ✅ Admin user created: ${adminUsername}`);
    }
  }

  // Backfill all existing records with default company id
  await prisma.$executeRaw`UPDATE users SET company_id = 1 WHERE company_id IS NULL`;
  await prisma.$executeRaw`UPDATE brands SET company_id = 1 WHERE company_id IS NULL`;
  await prisma.$executeRaw`UPDATE teams SET company_id = 1 WHERE company_id IS NULL`;

  console.log("✅ All existing records backfilled with default company");
  console.log("\n✅ All companies seeded successfully!");

  console.log("\n📋 Company Admin Login Credentials:");
  console.log("   All admins use password: 'password123'");
  console.log("");
  for (const companyData of companies) {
    const slug = companyData.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    console.log(`   • ${companyData.name}: username='admin-${slug}'`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
