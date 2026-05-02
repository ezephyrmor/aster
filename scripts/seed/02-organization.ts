/**
 * Phase 2: Organization Base Tables Seeder
 * Seeds the 5 recommended standard organization tables
 *
 * Execution Order:
 * 1. industries
 * 2. departments
 * 3. positions
 * 4. brands
 * 5. teams
 */

import { PrismaClient, BrandStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function seedOrganization() {
  try {
    console.log("🌱 Starting Phase 2: Organization Base Seeding");

    // Get default company
    const defaultCompany = await prisma.company.findUniqueOrThrow({
      where: { id: "00000000-0000-0000-0000-000000000001" },
    });

    // ---------------------------------------------------------------------------
    // 1. Industries
    // ---------------------------------------------------------------------------
    console.log("\n1/5 - Seeding industries");
    const industries = [
      { id: "00000000-0000-0000-0000-000000001101", name: "Technology" },
      { id: "00000000-0000-0000-0000-000000001102", name: "Healthcare" },
      { id: "00000000-0000-0000-0000-000000001103", name: "Finance" },
      { id: "00000000-0000-0000-0000-000000001104", name: "Education" },
      { id: "00000000-0000-0000-0000-000000001105", name: "Retail" },
      { id: "00000000-0000-0000-0000-000000001106", name: "Manufacturing" },
      { id: "00000000-0000-0000-0000-000000001107", name: "Services" },
      { id: "00000000-0000-0000-0000-000000001108", name: "Other" },
    ];

    for (const industry of industries) {
      await prisma.industry.upsert({
        where: { id: industry.id },
        update: {},
        create: industry,
      });
    }
    console.log(`✅ ${industries.length} industries created`);

    // ---------------------------------------------------------------------------
    // 2. Departments
    // ---------------------------------------------------------------------------
    console.log("\n2/5 - Seeding departments");
    const departments = [
      {
        id: "00000000-0000-0000-0000-000000001201",
        companyId: defaultCompany.id,
        name: "Executive",
      },
      {
        id: "00000000-0000-0000-0000-000000001202",
        companyId: defaultCompany.id,
        name: "Human Resources",
      },
      {
        id: "00000000-0000-0000-0000-000000001203",
        companyId: defaultCompany.id,
        name: "Finance",
      },
      {
        id: "00000000-0000-0000-0000-000000001204",
        companyId: defaultCompany.id,
        name: "Information Technology",
      },
      {
        id: "00000000-0000-0000-0000-000000001205",
        companyId: defaultCompany.id,
        name: "Operations",
      },
      {
        id: "00000000-0000-0000-0000-000000001206",
        companyId: defaultCompany.id,
        name: "Sales",
      },
      {
        id: "00000000-0000-0000-0000-000000001207",
        companyId: defaultCompany.id,
        name: "Marketing",
      },
    ];

    for (const dept of departments) {
      await prisma.department.upsert({
        where: { id: dept.id },
        update: {},
        create: dept,
      });
    }
    console.log(`✅ ${departments.length} departments created`);

    // ---------------------------------------------------------------------------
    // 3. Positions
    // ---------------------------------------------------------------------------
    console.log("\n3/5 - Seeding positions");
    const positions = [
      {
        id: "00000000-0000-0000-0000-000000001301",
        companyId: defaultCompany.id,
        name: "Chief Executive Officer",
      },
      {
        id: "00000000-0000-0000-0000-000000001302",
        companyId: defaultCompany.id,
        name: "Chief Technology Officer",
      },
      {
        id: "00000000-0000-0000-0000-000000001303",
        companyId: defaultCompany.id,
        name: "Manager",
      },
      {
        id: "00000000-0000-0000-0000-000000001304",
        companyId: defaultCompany.id,
        name: "Supervisor",
      },
      {
        id: "00000000-0000-0000-0000-000000001305",
        companyId: defaultCompany.id,
        name: "Senior Staff",
      },
      {
        id: "00000000-0000-0000-0000-000000001306",
        companyId: defaultCompany.id,
        name: "Staff",
      },
      {
        id: "00000000-0000-0000-0000-000000001307",
        companyId: defaultCompany.id,
        name: "Junior Staff",
      },
      {
        id: "00000000-0000-0000-0000-000000001308",
        companyId: defaultCompany.id,
        name: "Intern",
      },
    ];

    for (const position of positions) {
      await prisma.position.upsert({
        where: { id: position.id },
        update: {},
        create: position,
      });
    }
    console.log(`✅ ${positions.length} positions created`);

    // ---------------------------------------------------------------------------
    // 4. Brands
    // ---------------------------------------------------------------------------
    console.log("\n4/5 - Seeding brands");
    const brands = [
      {
        id: "00000000-0000-0000-0000-000000001401",
        companyId: defaultCompany.id,
        name: "Main Organization",
        status: BrandStatus.active,
        industryId: industries[0].id,
        createdBy: "00000000-0000-0000-0000-000000000002",
      },
    ];

    for (const brand of brands) {
      await prisma.brand.upsert({
        where: { id: brand.id },
        update: {},
        create: brand,
      });
    }
    console.log(`✅ ${brands.length} brands created`);

    // ---------------------------------------------------------------------------
    // 5. Teams
    // ---------------------------------------------------------------------------
    console.log("\n5/5 - Seeding teams");
    const teams = [
      {
        id: "00000000-0000-0000-0000-000000001501",
        companyId: defaultCompany.id,
        name: "Administration",
        brandId: brands[0].id,
      },
      {
        id: "00000000-0000-0000-0000-000000001502",
        companyId: defaultCompany.id,
        name: "Engineering",
        brandId: brands[0].id,
      },
      {
        id: "00000000-0000-0000-0000-000000001503",
        companyId: defaultCompany.id,
        name: "Support",
        brandId: brands[0].id,
      },
    ];

    for (const team of teams) {
      await prisma.team.upsert({
        where: { id: team.id },
        update: {},
        create: team,
      });
    }
    console.log(`✅ ${teams.length} teams created`);

    console.log("\n✅ Phase 2 Organization Seeding Complete!");
    console.log("\n📋 Summary:");
    console.log("   - 5 base organization tables seeded");
    console.log("   - Standard industry classifications");
    console.log("   - Default department structure");
    console.log("   - Standard position hierarchy");
    console.log("   - Base brand and teams setup");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedOrganization();
}

export default seedOrganization;
