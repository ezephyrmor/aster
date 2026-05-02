/**
 * Phase 1: Core System Seeder
 * Seeds the 12 absolute minimum required tables for system operation
 *
 * Execution Order:
 * 1. companies
 * 2. employee_statuses
 * 3. roles
 * 4. features
 * 5. feature_access_templates
 * 6. feature_access_template_items
 * 7. feature_navigation_templates
 * 8. feature_navigation_items
 * 9. role_access
 * 10. role_navigations
 * 11. users
 * 12. employee_profiles
 */

import {
  PrismaClient,
  FeatureKind,
  ScopeLevel,
  EffectType,
} from "@prisma/client";
import { hashPassword, generateSalt } from "../../src/lib/password";

const prisma = new PrismaClient();

async function seedCoreSystem() {
  try {
    console.log("🌱 Starting Phase 1: Core System Seeding");

    // ---------------------------------------------------------------------------
    // 1. Default Company
    // ---------------------------------------------------------------------------
    console.log("\n1/12 - Seeding default company");
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
    console.log("\n2/12 - Seeding employee statuses");
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
    console.log("\n3/12 - Seeding system roles");
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
    console.log("\n4/12 - Seeding core system features");
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
        id: "00000000-0000-0000-0000-000000001003",
        code: "profile.view",
        kind: FeatureKind.page,
        path: "/dashboard/profile",
        name: "View Profile",
        domain: "profile",
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
      // Legacy features integration start
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
        id: "00000000-0000-0000-0000-000000001010",
        code: "dashboard.employees",
        kind: FeatureKind.page,
        path: "/dashboard/employees",
        name: "Employees",
        description: "Employee directory",
        domain: "employees",
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
        path: "/dashboard/infractions/new",
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
      // Legacy features integration end
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
    // 5. Feature Access Templates
    // ---------------------------------------------------------------------------
    console.log("\n5/12 - Seeding feature access templates");
    const accessTemplates = [
      {
        id: "00000000-0000-0000-0000-000000002001",
        code: "full-access",
        name: "Full System Access",
        scopeLevel: ScopeLevel.company,
        isSystem: true,
      },
      {
        id: "00000000-0000-0000-0000-000000002002",
        code: "employee-basic",
        name: "Employee Basic Access",
        scopeLevel: ScopeLevel.self,
        isSystem: true,
      },
    ];

    for (const template of accessTemplates) {
      await prisma.featureAccessTemplate.upsert({
        where: { id: template.id },
        update: {},
        create: template,
      });
    }
    console.log(`✅ ${accessTemplates.length} access templates created`);

    // ---------------------------------------------------------------------------
    // 6. Access Template Items
    // ---------------------------------------------------------------------------
    console.log("\n6/12 - Seeding access template items");
    const templateItems = [
      // Full Access Template - All features
      {
        templateId: accessTemplates[0].id,
        featureId: features[0].id,
        action: "view",
        effect: EffectType.allow,
        scopeLevel: ScopeLevel.company,
      },
      {
        templateId: accessTemplates[0].id,
        featureId: features[1].id,
        action: "view",
        effect: EffectType.allow,
        scopeLevel: ScopeLevel.company,
      },
      {
        templateId: accessTemplates[0].id,
        featureId: features[2].id,
        action: "view",
        effect: EffectType.allow,
        scopeLevel: ScopeLevel.company,
      },
      {
        templateId: accessTemplates[0].id,
        featureId: features[3].id,
        action: "view",
        effect: EffectType.allow,
        scopeLevel: ScopeLevel.company,
      },
      {
        templateId: accessTemplates[0].id,
        featureId: features[4].id,
        action: "execute",
        effect: EffectType.allow,
        scopeLevel: ScopeLevel.company,
      },
      // New features added to full access
      {
        templateId: accessTemplates[0].id,
        featureId: features[5].id,
        action: "view",
        effect: EffectType.allow,
        scopeLevel: ScopeLevel.company,
      },
      {
        templateId: accessTemplates[0].id,
        featureId: features[6].id,
        action: "view",
        effect: EffectType.allow,
        scopeLevel: ScopeLevel.company,
      },
      {
        templateId: accessTemplates[0].id,
        featureId: features[7].id,
        action: "view",
        effect: EffectType.allow,
        scopeLevel: ScopeLevel.company,
      },
      {
        templateId: accessTemplates[0].id,
        featureId: features[8].id,
        action: "view",
        effect: EffectType.allow,
        scopeLevel: ScopeLevel.company,
      },
      {
        templateId: accessTemplates[0].id,
        featureId: features[9].id,
        action: "view",
        effect: EffectType.allow,
        scopeLevel: ScopeLevel.company,
      },
      {
        templateId: accessTemplates[0].id,
        featureId: features[10].id,
        action: "view",
        effect: EffectType.allow,
        scopeLevel: ScopeLevel.company,
      },
      {
        templateId: accessTemplates[0].id,
        featureId: features[11].id,
        action: "view",
        effect: EffectType.allow,
        scopeLevel: ScopeLevel.company,
      },
      {
        templateId: accessTemplates[0].id,
        featureId: features[12].id,
        action: "view",
        effect: EffectType.allow,
        scopeLevel: ScopeLevel.company,
      },
      {
        templateId: accessTemplates[0].id,
        featureId: features[13].id,
        action: "view",
        effect: EffectType.allow,
        scopeLevel: ScopeLevel.company,
      },
      {
        templateId: accessTemplates[0].id,
        featureId: features[14].id,
        action: "view",
        effect: EffectType.allow,
        scopeLevel: ScopeLevel.company,
      },
      {
        templateId: accessTemplates[0].id,
        featureId: features[15].id,
        action: "view",
        effect: EffectType.allow,
        scopeLevel: ScopeLevel.company,
      },
      {
        templateId: accessTemplates[0].id,
        featureId: features[16].id,
        action: "view",
        effect: EffectType.allow,
        scopeLevel: ScopeLevel.company,
      },

      {
        templateId: accessTemplates[1].id,
        featureId: features[0].id,
        action: "view",
        effect: EffectType.allow,
        scopeLevel: ScopeLevel.self,
      },
      {
        templateId: accessTemplates[1].id,
        featureId: features[2].id,
        action: "view",
        effect: EffectType.allow,
        scopeLevel: ScopeLevel.self,
      },
      {
        templateId: accessTemplates[1].id,
        featureId: features[4].id,
        action: "execute",
        effect: EffectType.allow,
        scopeLevel: ScopeLevel.self,
      },
    ];

    for (const item of templateItems) {
      await prisma.featureAccessTemplateItem.upsert({
        where: {
          templateId_featureId_action: {
            templateId: item.templateId,
            featureId: item.featureId,
            action: item.action,
          },
        },
        update: {},
        create: item,
      });
    }
    console.log(`✅ ${templateItems.length} template items created`);

    // ---------------------------------------------------------------------------
    // 7. Navigation Templates
    // ---------------------------------------------------------------------------
    console.log("\n7/12 - Seeding navigation templates");
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
    // 8. Navigation Items
    // ---------------------------------------------------------------------------
    console.log("\n8/12 - Seeding navigation items");
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
      },
      {
        templateId: navTemplates[0].id,
        code: "users",
        name: "Users",
        type: "link",
        sortOrder: 2,
        icon: "users",
        url: "/dashboard/users",
        featureCode: "users.view",
      },
      {
        templateId: navTemplates[0].id,
        code: "settings",
        name: "Settings",
        type: "link",
        sortOrder: 10,
        icon: "settings",
        url: "/dashboard/settings",
        featureCode: "settings.view",
      },
      {
        templateId: navTemplates[0].id,
        code: "analytics",
        name: "Analytics",
        type: "link",
        sortOrder: 3,
        icon: "bar-chart",
        url: "/dashboard/analytics",
        featureCode: "dashboard.analytics",
      },
      {
        templateId: navTemplates[0].id,
        code: "brands",
        name: "Brands",
        type: "link",
        sortOrder: 4,
        icon: "building",
        url: "/dashboard/brands",
        featureCode: "dashboard.brands",
      },
      {
        templateId: navTemplates[0].id,
        code: "calendar",
        name: "Calendar",
        type: "link",
        sortOrder: 5,
        icon: "calendar",
        url: "/dashboard/calendar",
        featureCode: "dashboard.calendar",
      },
      {
        templateId: navTemplates[0].id,
        code: "employees",
        name: "Employees",
        type: "link",
        sortOrder: 6,
        icon: "users",
        url: "/dashboard/employees",
        featureCode: "dashboard.employees",
      },
      {
        templateId: navTemplates[0].id,
        code: "infractions",
        name: "Infractions",
        type: "link",
        sortOrder: 7,
        icon: "alert-triangle",
        url: "/dashboard/infractions",
        featureCode: "dashboard.infractions",
      },
      {
        templateId: navTemplates[0].id,
        code: "leaves",
        name: "Leave Requests",
        type: "link",
        sortOrder: 8,
        icon: "file-text",
        url: "/dashboard/leaves/request",
        featureCode: "dashboard.leaves.request",
      },
      {
        templateId: navTemplates[0].id,
        code: "schedules",
        name: "Schedules",
        type: "link",
        sortOrder: 9,
        icon: "clock",
        url: "/dashboard/schedules",
        featureCode: "dashboard.schedules",
      },
      {
        templateId: navTemplates[0].id,
        code: "teams",
        name: "Teams",
        type: "link",
        sortOrder: 11,
        icon: "users-2",
        url: "/dashboard/teams",
        featureCode: "dashboard.teams",
      },
      {
        templateId: navTemplates[1].id,
        code: "dashboard",
        name: "Dashboard",
        type: "link",
        sortOrder: 1,
        icon: "home",
        url: "/dashboard",
        featureCode: "dashboard.view",
      },
      {
        templateId: navTemplates[1].id,
        code: "profile",
        name: "My Profile",
        type: "link",
        sortOrder: 2,
        icon: "user",
        url: "/dashboard/profile",
        featureCode: "profile.view",
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
    // 9. Role Access Assignments
    // ---------------------------------------------------------------------------
    console.log("\n9/12 - Seeding role access mappings");
    const roleAccess = [
      {
        companyId: defaultCompany.id,
        roleId: roles[0].id,
        templateId: accessTemplates[0].id,
        priority: 1,
      },
      {
        companyId: defaultCompany.id,
        roleId: roles[1].id,
        templateId: accessTemplates[0].id,
        priority: 1,
      },
      {
        companyId: defaultCompany.id,
        roleId: roles[2].id,
        templateId: accessTemplates[1].id,
        priority: 1,
      },
      {
        companyId: defaultCompany.id,
        roleId: roles[3].id,
        templateId: accessTemplates[1].id,
        priority: 1,
      },
    ];

    for (const access of roleAccess) {
      await prisma.roleAccess.upsert({
        where: {
          companyId_roleId_templateId: {
            companyId: access.companyId,
            roleId: access.roleId,
            templateId: access.templateId,
          },
        },
        update: {},
        create: access,
      });
    }
    console.log(`✅ ${roleAccess.length} role access assignments created`);

    // ---------------------------------------------------------------------------
    // 10. Role Navigation Assignments
    // ---------------------------------------------------------------------------
    console.log("\n10/12 - Seeding role navigation mappings");
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
    // 11. Default Admin User
    // ---------------------------------------------------------------------------
    console.log("\n11/12 - Seeding default admin user");
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
    // 12. Admin Employee Profile
    // ---------------------------------------------------------------------------
    console.log("\n12/12 - Seeding admin employee profile");
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

    console.log("\n✅ Phase 1 Core System Seeding Complete!");
    console.log("\n📋 Summary:");
    console.log("   - 12 core tables seeded");
    console.log("   - Default company created");
    console.log("   - System roles and statuses initialized");
    console.log("   - Permission and navigation system setup");
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
