import { PrismaClient } from "@prisma/client";
import { generateSalt, hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding demo companies...");

  const companies = [
    {
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

  for (const companyData of companies) {
    const { profile, ...company } = companyData;

    const createdCompany = await prisma.company.upsert({
      where: { name: company.name },
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
  }

  // Backfill all existing records with default company id
  const defaultCompany = await prisma.company.findFirst({
    where: { name: "Aster HR System" },
  });

  if (defaultCompany) {
    await prisma.$executeRaw`UPDATE users SET company_id = ${defaultCompany.id} WHERE company_id IS NULL`;
    await prisma.$executeRaw`UPDATE brands SET company_id = ${defaultCompany.id} WHERE company_id IS NULL`;
    await prisma.$executeRaw`UPDATE teams SET company_id = ${defaultCompany.id} WHERE company_id IS NULL`;
  }

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
