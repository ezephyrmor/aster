/**
 * Seed script to populate Feature table with all application pages
 * Run with: npx tsx scripts/seed-features.ts
 */

import { PrismaClient, FeatureKind } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding application features...\n");

  const features = [
    {
      code: "dashboard.view",
      name: "Dashboard Overview",
      description: "Main dashboard landing page",
      path: "/dashboard",
      domain: "dashboard",
      kind: FeatureKind.page,
      isActive: true,
    },
    {
      code: "dashboard.admin.settings",
      name: "Admin Settings",
      description: "System administration settings",
      path: "/dashboard/admin/settings",
      domain: "admin",
      kind: "page",
      isActive: true,
    },
    {
      code: "dashboard.analytics",
      name: "Analytics Dashboard",
      description: "Reports and analytics",
      path: "/dashboard/analytics",
      domain: "analytics",
      kind: "page",
      isActive: true,
    },
    {
      code: "dashboard.brands",
      name: "Brands Management",
      description: "Manage company brands",
      path: "/dashboard/brands",
      domain: "brands",
      kind: "page",
      isActive: true,
    },
    {
      code: "dashboard.calendar",
      name: "Calendar",
      description: "Company events and calendar",
      path: "/dashboard/calendar",
      domain: "calendar",
      kind: "page",
      isActive: true,
    },
    {
      code: "dashboard.employees",
      name: "Employees",
      description: "Employee directory",
      path: "/dashboard/employees",
      domain: "employees",
      kind: "page",
      isActive: true,
    },
    {
      code: "dashboard.infractions",
      name: "Infractions Management",
      description: "View and manage all infractions",
      path: "/dashboard/infractions",
      domain: "infractions",
      kind: "page",
      isActive: true,
    },
    {
      code: "dashboard.infractions.create",
      name: "Create Infraction",
      description: "Create new infraction record",
      path: "/dashboard/infractions/new",
      domain: "infractions",
      kind: "page",
      isActive: true,
    },
    {
      code: "dashboard.leaves.request",
      name: "Leave Requests",
      description: "Submit and view leave requests",
      path: "/dashboard/leaves/request",
      domain: "leaves",
      kind: "page",
      isActive: true,
    },
    {
      code: "dashboard.leaves.approve",
      name: "Approve Leaves",
      description: "Approve or reject leave requests",
      path: "/dashboard/leaves/approve",
      domain: "leaves",
      kind: "page",
      isActive: true,
    },
    {
      code: "dashboard.my-infractions",
      name: "My Infractions",
      description: "View your own infractions",
      path: "/dashboard/my-infractions",
      domain: "infractions",
      kind: "page",
      isActive: true,
    },
    {
      code: "dashboard.schedules",
      name: "Work Schedules",
      description: "Employee work schedules",
      path: "/dashboard/schedules",
      domain: "schedules",
      kind: "page",
      isActive: true,
    },
    {
      code: "dashboard.settings",
      name: "User Settings",
      description: "Personal account settings",
      path: "/dashboard/settings",
      domain: "settings",
      kind: "page",
      isActive: true,
    },
    {
      code: "dashboard.teams",
      name: "Teams Management",
      description: "Manage teams and team members",
      path: "/dashboard/teams",
      domain: "teams",
      kind: "page",
      isActive: true,
    },
    {
      code: "dashboard.users",
      name: "User Management",
      description: "Manage system users",
      path: "/dashboard/users",
      domain: "users",
      kind: "page",
      isActive: true,
    },
  ];

  console.log("📋 Seeding features...");

  let count = 0;
  for (const feature of features) {
    await prisma.feature.upsert({
      where: { code: feature.code },
      update: {
        name: feature.name,
        description: feature.description,
        path: feature.path,
        domain: feature.domain,
        kind: feature.kind,
        isActive: feature.isActive,
      },
      create: feature,
    });
    count++;
  }

  console.log(`   ✅ Created/Updated ${count} features`);

  console.log("\n✅ Feature table seeded successfully!");
  console.log("\n📊 Summary:");
  console.log(`   - Total features: ${features.length}`);
  console.log(
    `   - Domains covered: dashboard, admin, analytics, brands, calendar, employees, infractions, leaves, schedules, settings, teams, users`,
  );
}

main()
  .catch((e) => {
    console.error("❌ Error seeding features:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
