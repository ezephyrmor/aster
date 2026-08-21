/**
 * Phase 1: Core System Seeder
 * Seeds the absolute minimum required tables for system operation
 *
 * Execution Order:
 * 1. companies
 * 2. employee_statuses
 * 3. roles
 * 4. features
 * 5. feature_navigation_templates
 * 6. feature_navigation_items
 * 7. role_navigations
 * 8. users
 * 9. employee_profiles
 * 10. leave_types
 * 11. leave_statuses
 */

import { PrismaClient, FeatureKind } from "@prisma/client";
import { hashPassword, generateSalt } from "../../src/lib/password";

const prisma = new PrismaClient();

const defaultPermissions = {
  view: true,
  create: false,
  edit: false,
  delete: false,
  approve: false,
};

async function seedCoreSystem() {
  try {
    console.log("🌱 Starting Phase 1: Core System Seeding");

    // ---------------------------------------------------------------------------
    // 1. Default Company
    // ---------------------------------------------------------------------------
    console.log("\n1/11 - Seeding default company");
    const defaultCompany = await prisma.company.upsert({
      where: { id: "00000000-0000-0000-0000-000000000001" },
      update: {},
      create: {
        id: "00000000-0000-0000-0000-000000000001",
        name: "Default Company",
        status: "active",
        timezone: "Asia/Manila",
      },
    });
    console.log(`✅ Company created: ${defaultCompany.id}`);

    // ---------------------------------------------------------------------------
    // 2. Employee Statuses
    // ---------------------------------------------------------------------------
    console.log("\n2/11 - Seeding employee statuses");
    const employeeStatuses = [
      {
        id: "00000000-0000-0000-0000-000000000101",
        name: "Active",
        color: "green",
        sortOrder: 1,
      },
      {
        id: "00000000-0000-0000-0000-000000000102",
        name: "On Leave",
        color: "yellow",
        sortOrder: 2,
      },
      {
        id: "00000000-0000-0000-0000-000000000103",
        name: "Inactive",
        color: "orange",
        sortOrder: 3,
      },
      {
        id: "00000000-0000-0000-0000-000000000104",
        name: "Terminated",
        color: "red",
        sortOrder: 4,
      },
    ];

    for (const status of employeeStatuses) {
      await prisma.employeeStatusModel.upsert({
        where: { id: status.id },
        update: {},
        create: status,
      });
    }
    console.log(`✅ ${employeeStatuses.length} employee statuses created`);

    // ---------------------------------------------------------------------------
    // 3. System Roles
    // ---------------------------------------------------------------------------
    console.log("\n3/11 - Seeding system roles");
    const roles = [
      {
        id: "00000000-0000-0000-0000-000000000201",
        companyId: defaultCompany.id,
        name: "Super Admin",
        description: "Full system access",
      },
      {
        id: "00000000-0000-0000-0000-000000000202",
        companyId: defaultCompany.id,
        name: "Administrator",
        description: "Company administrator",
      },
      {
        id: "00000000-0000-0000-0000-000000000203",
        companyId: defaultCompany.id,
        name: "Manager",
        description: "Department/Team manager",
      },
      {
        id: "00000000-0000-0000-0000-000000000204",
        companyId: defaultCompany.id,
        name: "Employee",
        description: "Regular employee",
      },
    ];

    for (const role of roles) {
      await prisma.role.upsert({
        where: { id: role.id },
        update: {},
        create: role,
      });
    }
    console.log(`✅ ${roles.length} system roles created`);

    // ---------------------------------------------------------------------------
    // 4. Core Features
    // ---------------------------------------------------------------------------
    console.log("\n4/11 - Seeding core system features");
    const features = [
      {
        id: "00000000-0000-0000-0000-000000001001",
        code: "dashboard.view",
        kind: FeatureKind.page,
        path: "/dashboard",
        name: "View Dashboard",
        domain: "dashboard",
      },
      {
        id: "00000000-0000-0000-0000-000000001002",
        code: "users.view",
        kind: FeatureKind.page,
        path: "/dashboard/users",
        name: "View Users",
        domain: "users",
      },
      {
        id: "00000000-0000-0000-0000-000000001004",
        code: "settings.view",
        kind: FeatureKind.page,
        path: "/dashboard/settings",
        name: "View Settings",
        domain: "settings",
      },
      {
        id: "00000000-0000-0000-0000-000000001005",
        code: "auth.me",
        kind: FeatureKind.api,
        httpMethod: "GET",
        path: "/api/auth/me",
        name: "Get current user",
        domain: "auth",
      },
      {
        id: "00000000-0000-0000-0000-000000001006",
        code: "dashboard.admin.settings",
        kind: FeatureKind.page,
        path: "/dashboard/admin/settings",
        name: "Admin Settings",
        description: "System administration settings",
        domain: "admin",
      },
      {
        id: "00000000-0000-0000-0000-000000001007",
        code: "dashboard.analytics",
        kind: FeatureKind.page,
        path: "/dashboard/analytics",
        name: "Analytics Dashboard",
        description: "Reports and analytics",
        domain: "analytics",
      },
      {
        id: "00000000-0000-0000-0000-000000001008",
        code: "dashboard.brands",
        kind: FeatureKind.page,
        path: "/dashboard/brands",
        name: "Brands Management",
        description: "Manage company brands",
        domain: "brands",
      },
      {
        id: "00000000-0000-0000-0000-000000001009",
        code: "dashboard.calendar",
        kind: FeatureKind.page,
        path: "/dashboard/calendar",
        name: "Calendar",
        description: "Company events and calendar",
        domain: "calendar",
      },
      {
        id: "00000000-0000-0000-0000-000000001011",
        code: "dashboard.infractions",
        kind: FeatureKind.page,
        path: "/dashboard/infractions",
        name: "Infractions Management",
        description: "View and manage all infractions",
        domain: "infractions",
      },
      {
        id: "00000000-0000-0000-0000-000000001012",
        code: "dashboard.infractions.create",
        kind: FeatureKind.page,
        path: "/dashboard/infractions/create",
        name: "Create Infraction",
        description: "Create new infraction record",
        domain: "infractions",
      },
      {
        id: "00000000-0000-0000-0000-000000001013",
        code: "dashboard.leaves.request",
        kind: FeatureKind.page,
        path: "/dashboard/leaves/request",
        name: "Leave Requests",
        description: "Submit and view leave requests",
        domain: "leaves",
      },
      {
        id: "00000000-0000-0000-0000-000000001014",
        code: "dashboard.leaves.approve",
        kind: FeatureKind.page,
        path: "/dashboard/leaves/approve",
        name: "Approve Leaves",
        description: "Approve or reject leave requests",
        domain: "leaves",
      },
      {
        id: "00000000-0000-0000-0000-000000001015",
        code: "dashboard.my-infractions",
        kind: FeatureKind.page,
        path: "/dashboard/my-infractions",
        name: "My Infractions",
        description: "View your own infractions",
        domain: "infractions",
      },
      {
        id: "00000000-0000-0000-0000-000000001016",
        code: "dashboard.schedules",
        kind: FeatureKind.page,
        path: "/dashboard/schedules",
        name: "Work Schedules",
        description: "Employee work schedules",
        domain: "schedules",
      },
      {
        id: "00000000-0000-0000-0000-000000001017",
        code: "dashboard.teams",
        kind: FeatureKind.page,
        path: "/dashboard/teams",
        name: "Teams Management",
        description: "Manage teams and team members",
        domain: "teams",
      },
      {
        id: "00000000-0000-0000-0000-000000001018",
        code: "feature-manager",
        kind: FeatureKind.page,
        path: "/dashboard/feature-manager",
        name: "Feature Manager",
        description: "Feature manager landing page",
        domain: "feature-manager",
      },
      {
        id: "00000000-0000-0000-0000-000000001019",
        code: "feature-manager.navigation-builder",
        kind: FeatureKind.page,
        path: "/dashboard/feature-manager/navigation-builder",
        name: "Navigation Builder",
        description: "Build and manage navigation menus",
        domain: "feature-manager",
      },
      {
        id: "00000000-0000-0000-0000-000000001020",
        code: "feature-manager.templates",
        kind: FeatureKind.page,
        path: "/dashboard/feature-manager/templates",
        name: "Navigation Templates",
        description: "Manage navigation templates",
        domain: "feature-manager",
      },
      {
        id: "00000000-0000-0000-0000-000000001021",
        code: "feature-manager.role-mapping",
        kind: FeatureKind.page,
        path: "/dashboard/feature-manager/role-mapping",
        name: "Role Mapping",
        description: "Map roles to navigation templates",
        domain: "feature-manager",
      },
      {
        id: "00000000-0000-0000-0000-000000001022",
        code: "sticker-generator.view",
        kind: FeatureKind.page,
        path: "/dashboard/sticker-generator",
        name: "Sticker Generator",
        description: "Generate production-ready transparent sticker assets",
        domain: "sticker-generator",
      },
    ];

    for (const feature of features) {
      await prisma.feature.upsert({
        where: { code: feature.code },
        update: {},
        create: feature,
      });
    }
    console.log(`✅ ${features.length} core features created`);

    // ---------------------------------------------------------------------------
    // 5. Navigation Templates
    // ---------------------------------------------------------------------------
    console.log("\n5/11 - Seeding navigation templates");
    const navTemplates = [
      {
        id: "00000000-0000-0000-0000-000000003001",
        code: "admin-sidebar",
        name: "Admin Sidebar Navigation",
        isSystem: true,
      },
      {
        id: "00000000-0000-0000-0000-000000003002",
        code: "employee-sidebar",
        name: "Employee Sidebar Navigation",
        isSystem: true,
      },
    ];

    for (const template of navTemplates) {
      await prisma.featureNavigationTemplate.upsert({
        where: { id: template.id },
        update: {},
        create: { ...template, companyId: defaultCompany.id },
      });
    }
    console.log(`✅ ${navTemplates.length} navigation templates created`);

    // ---------------------------------------------------------------------------
    // 6. Navigation Items
    // ---------------------------------------------------------------------------
    console.log("\n6/11 - Seeding navigation items");
    const navItems = [
      {
        templateId: navTemplates[0].id,
        code: "dashboard",
        name: "Dashboard",
        type: "link",
        sortOrder: 1,
        icon: "home",
        url: "/dashboard",
        featureCode: "dashboard.view",
        permissions: defaultPermissions,
      },
      {
        templateId: navTemplates[0].id,
        code: "analytics",
        name: "Analytics",
        type: "link",
        sortOrder: 2,
        icon: "bar-chart",
        url: "/dashboard/analytics",
        featureCode: "dashboard.analytics",
        permissions: defaultPermissions,
      },
      {
        templateId: navTemplates[0].id,
        code: "calendar",
        name: "Calendar",
        type: "link",
        sortOrder: 3,
        icon: "calendar",
        url: "/dashboard/calendar",
        featureCode: "dashboard.calendar",
        permissions: defaultPermissions,
      },
      // Management Container
      {
        templateId: navTemplates[0].id,
        code: "management",
        name: "Management",
        type: "container",
        sortOrder: 4,
        icon: "folder",
        permissions: defaultPermissions,
      },
      {
        templateId: navTemplates[0].id,
        code: "users",
        name: "Users",
        type: "link",
        parentId: "00000000-0000-0000-0000-000000003104",
        sortOrder: 1,
        icon: "users",
        url: "/dashboard/users",
        featureCode: "users.view",
        permissions: defaultPermissions,
      },
      {
        templateId: navTemplates[0].id,
        code: "brands",
        name: "Brands",
        type: "link",
        parentId: "00000000-0000-0000-0000-000000003104",
        sortOrder: 2,
        icon: "building",
        url: "/dashboard/brands",
        featureCode: "dashboard.brands",
        permissions: defaultPermissions,
      },
      {
        templateId: navTemplates[0].id,
        code: "teams",
        name: "Teams",
        type: "link",
        parentId: "00000000-0000-0000-0000-000000003104",
        sortOrder: 3,
        icon: "users-2",
        url: "/dashboard/teams",
        featureCode: "dashboard.teams",
        permissions: defaultPermissions,
      },
      {
        templateId: navTemplates[0].id,
        code: "infractions",
        name: "Infractions",
        type: "link",
        parentId: "00000000-0000-0000-0000-000000003104",
        sortOrder: 4,
        icon: "alert-triangle",
        url: "/dashboard/infractions",
        featureCode: "dashboard.infractions",
        permissions: defaultPermissions,
      },
      {
        templateId: navTemplates[0].id,
        code: "schedules",
        name: "Schedules",
        type: "link",
        parentId: "00000000-0000-0000-0000-000000003104",
        sortOrder: 5,
        icon: "clock",
        url: "/dashboard/schedules",
        featureCode: "dashboard.schedules",
        permissions: defaultPermissions,
      },
      // Personal Container
      {
        templateId: navTemplates[0].id,
        code: "personal",
        name: "Personal",
        type: "container",
        sortOrder: 5,
        icon: "user",
        permissions: defaultPermissions,
      },
      {
        templateId: navTemplates[0].id,
        code: "leave-requests",
        name: "Leave Requests",
        type: "link",
        parentId: "00000000-0000-0000-0000-000000003110",
        sortOrder: 1,
        icon: "file-text",
        url: "/dashboard/leaves/request",
        featureCode: "dashboard.leaves.request",
        permissions: defaultPermissions,
      },
      {
        templateId: navTemplates[0].id,
        code: "my-infractions",
        name: "My Infractions",
        type: "link",
        parentId: "00000000-0000-0000-0000-000000003110",
        sortOrder: 2,
        icon: "alert-circle",
        url: "/dashboard/my-infractions",
        featureCode: "dashboard.my-infractions",
        permissions: defaultPermissions,
      },
      {
        templateId: navTemplates[0].id,
        code: "settings",
        name: "Settings",
        type: "link",
        sortOrder: 6,
        icon: "settings",
        url: "/dashboard/settings",
        featureCode: "settings.view",
        permissions: defaultPermissions,
      },
      // Employee template
      {
        templateId: navTemplates[1].id,
        code: "dashboard",
        name: "Dashboard",
        type: "link",
        sortOrder: 1,
        icon: "home",
        url: "/dashboard",
        featureCode: "dashboard.view",
        permissions: defaultPermissions,
      },
      // Sticker Generator (admin template) — appended last so prior index-derived
      // IDs (and their already-seeded rows) are NOT shifted.
      {
        templateId: navTemplates[0].id,
        code: "sticker-generator",
        name: "Sticker Generator",
        type: "link",
        parentId: "00000000-0000-0000-0000-000000003104",
        sortOrder: 6,
        icon: "sticker",
        url: "/dashboard/sticker-generator",
        featureCode: "sticker-generator.view",
        permissions: defaultPermissions,
      },
    ];

    let navItemIndex = 1;
    for (const item of navItems) {
      const itemId = `00000000-0000-0000-0000-0000000031${navItemIndex.toString().padStart(2, "0")}`;
      await prisma.featureNavigationItem.upsert({
        where: { id: itemId },
        update: {},
        create: {
          id: itemId,
          ...item,
        },
      });
      navItemIndex++;
    }
    console.log(`✅ ${navItems.length} navigation items created`);

    // ---------------------------------------------------------------------------
    // 7. Role Navigation Assignments
    // ---------------------------------------------------------------------------
    console.log("\n7/11 - Seeding role navigation mappings");
    const roleNavigations = [
      {
        companyId: defaultCompany.id,
        roleId: roles[0].id,
        navigationTemplateId: navTemplates[0].id,
      },
      {
        companyId: defaultCompany.id,
        roleId: roles[1].id,
        navigationTemplateId: navTemplates[0].id,
      },
      {
        companyId: defaultCompany.id,
        roleId: roles[2].id,
        navigationTemplateId: navTemplates[1].id,
      },
      {
        companyId: defaultCompany.id,
        roleId: roles[3].id,
        navigationTemplateId: navTemplates[1].id,
      },
    ];

    for (const nav of roleNavigations) {
      await prisma.roleNavigation.upsert({
        where: {
          companyId_roleId: {
            companyId: nav.companyId,
            roleId: nav.roleId,
          },
        },
        update: {},
        create: nav,
      });
    }
    console.log(
      `✅ ${roleNavigations.length} role navigation assignments created`,
    );

    // ---------------------------------------------------------------------------
    // 8. Default Admin User
    // ---------------------------------------------------------------------------
    console.log("\n8/11 - Seeding default admin user");
    const adminSalt = await generateSalt();
    const adminPasswordHash = await hashPassword("admin123", adminSalt);

    const adminUser = await prisma.user.upsert({
      where: { username: "admin" },
      update: {},
      create: {
        id: "00000000-0000-0000-0000-000000000002",
        companyId: defaultCompany.id,
        username: "admin",
        passwordHash: adminPasswordHash,
        salt: adminSalt,
      },
    });
    console.log(`✅ Admin user created: ${adminUser.username}`);

    // ---------------------------------------------------------------------------
    // 9. Admin Employee Profile
    // ---------------------------------------------------------------------------
    console.log("\n9/11 - Seeding admin employee profile");
    await prisma.employeeProfile.upsert({
      where: { userId: adminUser.id },
      update: {},
      create: {
        userId: adminUser.id,
        firstName: "System",
        lastName: "Administrator",
        statusId: employeeStatuses[0].id,
        roleId: roles[0].id,
      },
    });
    console.log(`✅ Admin profile created`);

    // ---------------------------------------------------------------------------
    // 10. Leave Types
    // ---------------------------------------------------------------------------
    console.log("\n10/11 - Seeding leave types");
    const leaveTypes = [
      {
        name: "Vacation Leave",
        description: "Paid time off for rest, recreation, or travel",
        defaultDaysLimit: 15,
        color: "purple",
      },
      {
        name: "Sick Leave",
        description: "Time off for illness or medical appointments",
        defaultDaysLimit: 15,
        color: "red",
      },
      {
        name: "Personal Leave",
        description: "Time off for personal matters or emergencies",
        defaultDaysLimit: 5,
        color: "orange",
      },
      {
        name: "Emergency Leave",
        description: "Unplanned time off for urgent situations",
        defaultDaysLimit: 5,
        color: "red",
      },
      {
        name: "Bereavement Leave",
        description: "Time off following the death of a family member",
        defaultDaysLimit: 5,
        color: "gray",
      },
      {
        name: "Maternity Leave",
        description: "Leave for childbirth and newborn care",
        defaultDaysLimit: 90,
        color: "pink",
      },
      {
        name: "Paternity Leave",
        description: "Leave for new fathers",
        defaultDaysLimit: 15,
        color: "blue",
      },
    ];

    for (const leaveType of leaveTypes) {
      await prisma.leaveType.upsert({
        where: {
          companyId_name: {
            companyId: defaultCompany.id,
            name: leaveType.name,
          },
        },
        update: leaveType,
        create: {
          ...leaveType,
          companyId: defaultCompany.id,
        },
      });
    }
    console.log(`✅ ${leaveTypes.length} leave types created`);

    // ---------------------------------------------------------------------------
    // 11. Leave Statuses
    // ---------------------------------------------------------------------------
    console.log("\n11/11 - Seeding leave statuses");
    const leaveStatuses = [
      {
        name: "Pending",
        description: "Leave request is awaiting approval",
        color: "yellow",
        isFinal: false,
      },
      {
        name: "Approved",
        description: "Leave request has been approved",
        color: "green",
        isFinal: true,
      },
      {
        name: "Denied",
        description: "Leave request has been rejected",
        color: "red",
        isFinal: true,
      },
      {
        name: "Cancelled",
        description: "Leave request was cancelled by the employee",
        color: "gray",
        isFinal: true,
      },
    ];

    for (const status of leaveStatuses) {
      await prisma.leaveStatus.upsert({
        where: {
          companyId_name: {
            companyId: defaultCompany.id,
            name: status.name,
          },
        },
        update: status,
        create: {
          ...status,
          companyId: defaultCompany.id,
        },
      });
    }
    console.log(`✅ ${leaveStatuses.length} leave statuses created`);

    console.log("\n✅ Phase 1 Core System Seeding Complete!");
    console.log("\n📋 Summary:");
    console.log("   - 11 core tables seeded");
    console.log("   - Default company created");
    console.log("   - System roles and statuses initialized");
    console.log("   - Navigation system with embedded permissions");
    console.log("   - Leave types and statuses configured");
    console.log(
      "   - Default admin user created (username: admin, password: admin123)",
    );
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedCoreSystem();
}

export default seedCoreSystem;
