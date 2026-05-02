/**
 * Seed script to populate Feature Navigation Templates and assign to roles
 * Run with: npx tsx scripts/seed-navigation-templates.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding navigation templates...\n");

  // Create default sidebar template
  console.log("📋 Creating default sidebar template...");
  const defaultTemplate = await prisma.featureNavigationTemplate.upsert({
    where: { code: "default.sidebar" },
    update: {
      name: "Default Sidebar",
      description: "Base navigation template for all users",
      isSystem: true,
      isActive: true,
    },
    create: {
      code: "default.sidebar",
      name: "Default Sidebar",
      description: "Base navigation template for all users",
      isSystem: true,
      isActive: true,
    },
  });

  const templateId = defaultTemplate.id;
  console.log("   ✅ Default sidebar template created\n");

  // Create navigation items
  console.log("📋 Creating navigation items...");

  const navigationItems = [
    // Level 0 - Root items
    {
      code: "dashboard",
      name: "Dashboard",
      icon: "home",
      type: "page",
      sortOrder: 0,
      featureCode: "dashboard.view",
      url: "/dashboard",
    },
    {
      code: "my-work",
      name: "My Work",
      icon: "briefcase",
      type: "container",
      sortOrder: 1,
    },
    {
      code: "management",
      name: "Management",
      icon: "folder",
      type: "container",
      sortOrder: 2,
    },
    {
      code: "schedules",
      name: "Schedules",
      icon: "clock",
      type: "page",
      sortOrder: 3,
      featureCode: "dashboard.schedules",
      url: "/dashboard/schedules",
    },
    {
      code: "calendar",
      name: "Calendar",
      icon: "calendar",
      type: "page",
      sortOrder: 4,
      featureCode: "dashboard.calendar",
      url: "/dashboard/calendar",
    },
    {
      code: "settings",
      name: "Settings",
      icon: "settings",
      type: "page",
      sortOrder: 5,
      featureCode: "dashboard.settings",
      url: "/dashboard/settings",
    },

    // Level 1 - My Work children
    {
      code: "request-leave",
      parentCode: "my-work",
      name: "Request Leave",
      icon: "calendar-plus",
      type: "page",
      sortOrder: 0,
      featureCode: "dashboard.leaves.request",
      url: "/dashboard/leaves/request",
    },
    {
      code: "my-infractions",
      parentCode: "my-work",
      name: "My Infractions",
      icon: "alert-triangle",
      type: "page",
      sortOrder: 1,
      featureCode: "dashboard.my-infractions",
      url: "/dashboard/my-infractions",
    },

    // Level 1 - Management children
    {
      code: "users",
      parentCode: "management",
      name: "Users",
      icon: "users",
      type: "page",
      sortOrder: 0,
      featureCode: "dashboard.users",
      url: "/dashboard/users",
    },
    {
      code: "brands",
      parentCode: "management",
      name: "Brands",
      icon: "tag",
      type: "page",
      sortOrder: 1,
      featureCode: "dashboard.brands",
      url: "/dashboard/brands",
    },
    {
      code: "teams",
      parentCode: "management",
      name: "Teams",
      icon: "users-2",
      type: "page",
      sortOrder: 2,
      featureCode: "dashboard.teams",
      url: "/dashboard/teams",
    },
    {
      code: "infractions",
      parentCode: "management",
      name: "Infractions",
      icon: "alert-circle",
      type: "page",
      sortOrder: 3,
      featureCode: "dashboard.infractions",
      url: "/dashboard/infractions",
    },
  ];

  // First pass: create all items and store mapping
  const itemIdMap = new Map<string, string>();

  // Create root items first
  for (const item of navigationItems.filter((i) => !i.parentCode)) {
    const created = await prisma.featureNavigationItem.upsert({
      where: {
        templateId_code: {
          templateId,
          code: item.code,
        },
      },
      update: {
        name: item.name,
        icon: item.icon,
        type: item.type,
        sortOrder: item.sortOrder,
        featureCode: item.featureCode,
        url: item.url,
      },
      create: {
        templateId,
        code: item.code,
        name: item.name,
        icon: item.icon,
        type: item.type,
        sortOrder: item.sortOrder,
        featureCode: item.featureCode,
        url: item.url,
      },
    });

    itemIdMap.set(item.code, created.id);
  }

  // Second pass: create child items with parent references
  for (const item of navigationItems.filter((i) => i.parentCode)) {
    const parentId = itemIdMap.get(item.parentCode!);

    if (!parentId) {
      console.warn(`   ⚠️ Parent not found for ${item.code}, skipping`);
      continue;
    }

    await prisma.featureNavigationItem.upsert({
      where: {
        templateId_code: {
          templateId,
          code: item.code,
        },
      },
      update: {
        parentId,
        name: item.name,
        icon: item.icon,
        type: item.type,
        sortOrder: item.sortOrder,
        featureCode: item.featureCode,
        url: item.url,
      },
      create: {
        templateId,
        parentId,
        code: item.code,
        name: item.name,
        icon: item.icon,
        type: item.type,
        sortOrder: item.sortOrder,
        featureCode: item.featureCode,
        url: item.url,
      },
    });
  }

  console.log(`   ✅ Created ${navigationItems.length} navigation items\n`);

  // Assign template to all roles for all companies
  console.log("📋 Assigning template to all roles...");

  const companies = await prisma.company.findMany();
  let assignmentCount = 0;

  for (const company of companies) {
    const roles = await prisma.role.findMany({
      where: { companyId: company.id },
    });

    for (const role of roles) {
      await prisma.roleNavigation.upsert({
        where: {
          companyId_roleId: {
            companyId: company.id,
            roleId: role.id,
          },
        },
        update: {
          navigationTemplateId: templateId,
          isActive: true,
        },
        create: {
          companyId: company.id,
          roleId: role.id,
          navigationTemplateId: templateId,
          isActive: true,
        },
      });
      assignmentCount++;
    }
  }

  console.log(
    `   ✅ Assigned template to ${assignmentCount} roles across ${companies.length} companies`,
  );

  console.log("\n✅ Navigation templates seeded successfully!");
  console.log("\n📊 Summary:");
  console.log(`   - Template: ${defaultTemplate.name}`);
  console.log(`   - Navigation items: ${navigationItems.length}`);
  console.log(`   - Role assignments: ${assignmentCount}`);
  console.log(`   - Companies: ${companies.length}`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding navigation templates:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
