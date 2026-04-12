/**
 * Seed script to create fully isolated multiple companies
 * Run with: npx tsx scripts/seed-multi-company.ts
 *
 * Creates:
 * - 5 separate companies
 * - 1 Admin + 2 HR + 5 Managers + 50 Employees per company
 * - Own positions, departments, roles, leave types for each company
 * - Own brands, teams, calendar events
 */

import { PrismaClient } from "@prisma/client";
import { generateSalt, hashPassword } from "../src/lib/password";
import { generateUsername, generatePassword } from "../src/lib/userGenerator";

const prisma = new PrismaClient();

const companies = [
  {
    id: 1,
    name: "Aster HR System",
    timezone: "Asia/Manila",
    adminEmail: "admin@aster.local",
  },
  {
    id: 2,
    name: "Acme Corporation",
    timezone: "America/New_York",
    adminEmail: "admin@acme-corp.com",
  },
  {
    id: 3,
    name: "Global Tech Solutions",
    timezone: "Europe/London",
    adminEmail: "admin@globaltechsolutions.co.uk",
  },
  {
    id: 4,
    name: "Pacific Retail Group",
    timezone: "Australia/Sydney",
    adminEmail: "admin@pacificretail.com.au",
  },
  {
    id: 5,
    name: "Metro Healthcare Services",
    timezone: "Asia/Tokyo",
    adminEmail: "admin@metrohealthcare.jp",
  },
];

const basePositions = [
  "Software Engineer",
  "Senior Software Engineer",
  "Product Manager",
  "Project Manager",
  "HR Officer",
  "HR Manager",
  "Accountant",
  "Finance Manager",
  "Marketing Specialist",
  "Sales Representative",
  "Customer Support",
  "Office Administrator",
];

const companyDepartments: Record<number, string[]> = {
  1: [
    // Aster HR System (SaaS)
    "Engineering",
    "Product",
    "Human Resources",
    "Finance",
    "Marketing",
    "Sales",
    "Customer Support",
    "Operations",
  ],
  2: [
    // Acme Corporation (Manufacturing)
    "Production",
    "Quality Control",
    "Logistics",
    "Maintenance",
    "Procurement",
    "Human Resources",
    "Finance",
    "Safety",
  ],
  3: [
    // Global Tech Solutions (Software)
    "Engineering",
    "DevOps",
    "Product",
    "Design",
    "Customer Success",
    "Human Resources",
    "Finance",
    "Sales",
  ],
  4: [
    // Pacific Retail Group (Retail)
    "Store Operations",
    "Merchandising",
    "Loss Prevention",
    "Supply Chain",
    "E-Commerce",
    "Human Resources",
    "Finance",
    "Marketing",
  ],
  5: [
    // Metro Healthcare Services (Healthcare)
    "Clinical Services",
    "Nursing",
    "Pharmacy",
    "Laboratory",
    "Patient Administration",
    "Human Resources",
    "Finance",
    "Facilities",
  ],
};

const baseRoles = [
  { name: "admin", description: "System Administrator" },
  { name: "hr", description: "Human Resources Officer" },
  { name: "manager", description: "Department Manager" },
  { name: "employee", description: "Regular Employee" },
];

const baseLeaveTypes = [
  { name: "Vacation Leave", defaultDaysLimit: 15, color: "blue" },
  { name: "Sick Leave", defaultDaysLimit: 10, color: "green" },
  { name: "Emergency Leave", defaultDaysLimit: 5, color: "orange" },
  { name: "Bereavement Leave", defaultDaysLimit: 3, color: "gray" },
  { name: "Maternity Leave", defaultDaysLimit: 60, color: "purple" },
];

const companyBrands: Record<
  number,
  Array<{ name: string; description: string }>
> = {
  1: [
    { name: "Aster HR Cloud", description: "Core HR management platform" },
    {
      name: "Aster Payroll",
      description: "Automated payroll processing system",
    },
    {
      name: "Aster TimeTrack",
      description: "Attendance and time tracking solution",
    },
    {
      name: "Aster Talent",
      description: "Recruitment and talent management module",
    },
  ],
  2: [
    {
      name: "Acme Industrial Parts",
      description: "Heavy machinery components division",
    },
    {
      name: "Acme Assembly Systems",
      description: "Production line integration solutions",
    },
    { name: "Acme Logistics", description: "Global supply chain management" },
    {
      name: "Acme Maintenance Services",
      description: "On-site equipment maintenance",
    },
  ],
  3: [
    {
      name: "GlobalTech Enterprise",
      description: "Enterprise software development",
    },
    {
      name: "CloudFusion Platform",
      description: "Cloud infrastructure solutions",
    },
    { name: "DevOps Labs", description: "CI/CD and automation tools" },
    {
      name: "DataInsights Analytics",
      description: "Business intelligence and analytics",
    },
  ],
  4: [
    {
      name: "Pacific Retail Stores",
      description: "Physical retail store operations",
    },
    {
      name: "Pacific Online Market",
      description: "E-commerce digital platform",
    },
    {
      name: "Pacific Supply Chain",
      description: "Warehouse and distribution network",
    },
    {
      name: "Pacific Customer Care",
      description: "Customer support and services",
    },
  ],
  5: [
    {
      name: "Metro General Hospital",
      description: "Primary healthcare facility",
    },
    {
      name: "Metro Specialty Clinics",
      description: "Specialized medical services",
    },
    {
      name: "Metro Laboratory Services",
      description: "Diagnostic testing facilities",
    },
    {
      name: "Metro Pharmacy Network",
      description: "Pharmaceutical distribution",
    },
  ],
};

const companyTeams: Record<
  number,
  Array<{ name: string; description: string }>
> = {
  1: [
    {
      name: "Backend Engineering",
      description: "Server-side development team",
    },
    {
      name: "Frontend Engineering",
      description: "User interface development team",
    },
    {
      name: "Product Management",
      description: "Product roadmap and strategy team",
    },
    {
      name: "Customer Success",
      description: "Client onboarding and support team",
    },
    {
      name: "DevOps & Infrastructure",
      description: "Cloud and deployment team",
    },
    {
      name: "Quality Assurance",
      description: "Testing and quality control team",
    },
  ],
  2: [
    { name: "Production Line", description: "Manufacturing operations team" },
    { name: "Quality Control", description: "Product inspection team" },
    { name: "Maintenance Crew", description: "Equipment maintenance team" },
    { name: "Logistics Team", description: "Shipping and receiving team" },
    { name: "Procurement Team", description: "Raw material purchasing team" },
    {
      name: "Safety Officers",
      description: "Workplace safety compliance team",
    },
  ],
  3: [
    {
      name: "Software Development",
      description: "Application development team",
    },
    {
      name: "Cloud Operations",
      description: "Cloud infrastructure management",
    },
    { name: "UX Design Team", description: "User experience design team" },
    { name: "Security Team", description: "Cybersecurity and compliance team" },
    {
      name: "Data Engineering",
      description: "Data pipeline and analytics team",
    },
    {
      name: "Support Engineering",
      description: "Technical customer support team",
    },
  ],
  4: [
    { name: "Store Operations", description: "Retail store management team" },
    {
      name: "Merchandising Team",
      description: "Product placement and display team",
    },
    { name: "E-commerce Team", description: "Online platform management team" },
    {
      name: "Loss Prevention",
      description: "Security and inventory control team",
    },
    { name: "Supply Chain Team", description: "Inventory and logistics team" },
    { name: "Marketing Team", description: "Promotions and advertising team" },
  ],
  5: [
    { name: "Clinical Staff", description: "Medical practitioners team" },
    { name: "Nursing Staff", description: "Patient care nursing team" },
    { name: "Laboratory Team", description: "Diagnostic testing team" },
    { name: "Pharmacy Staff", description: "Medication management team" },
    { name: "Admin & Billing", description: "Administration and billing team" },
    { name: "Facilities Management", description: "Hospital maintenance team" },
  ],
};

async function seedCompany(companyId: number, companyData: any) {
  console.log(`\n🌱 Seeding company: ${companyData.name} (ID: ${companyId})`);

  // Create positions for this company
  const positions = [];
  for (const name of basePositions) {
    const position = await prisma.position.create({
      data: {
        name,
        companyId,
        description: `${name} position for ${companyData.name}`,
      },
    });
    positions.push(position);
  }
  console.log(`   ✅ Created ${positions.length} positions`);

  // Create departments for this company
  const departments = [];
  const departmentList = companyDepartments[companyId] || companyDepartments[1];

  for (const name of departmentList) {
    const department = await prisma.department.create({
      data: {
        name,
        companyId,
        description: `${name} department for ${companyData.name}`,
      },
    });
    departments.push(department);
  }
  console.log(`   ✅ Created ${departments.length} departments`);

  // Create roles for this company
  const roles = [];
  for (const role of baseRoles) {
    const createdRole = await prisma.role.create({
      data: {
        name: role.name,
        companyId,
        description: role.description,
      },
    });
    roles.push(createdRole);
  }
  console.log(`   ✅ Created ${roles.length} roles`);

  // Create leave types for this company
  for (const leaveType of baseLeaveTypes) {
    await prisma.leaveType.create({
      data: {
        ...leaveType,
        companyId,
      },
    });
  }
  console.log(`   ✅ Created ${baseLeaveTypes.length} leave types`);

  // Get role ids
  const adminRole = roles.find((r) => r.name === "admin");
  const hrRole = roles.find((r) => r.name === "hr");
  const managerRole = roles.find((r) => r.name === "manager");
  const employeeRole = roles.find((r) => r.name === "employee");

  // Create admin user for all companies
  // For company 1, this will be overwritten by seed-admin.ts later with the correct known password
  const adminUser = await createUser(
    companyId,
    "System",
    "Administrator",
    adminRole!.id,
    positions[0].id,
    departments[0].id,
  );
  console.log(`   ✅ Created admin user: ${adminUser.username}`);

  // Create brands for this company
  const brands = [];
  const brandList = companyBrands[companyId] || companyBrands[1];

  for (const brandData of brandList) {
    const brand = await prisma.brand.create({
      data: {
        name: brandData.name,
        description: brandData.description,
        companyId,
        createdBy: adminUser.id,
        status: "active",
      },
    });
    brands.push(brand);
  }
  console.log(`   ✅ Created ${brands.length} brands`);

  // Create teams for this company (assigned to first brand)
  const teams = [];
  const teamList = companyTeams[companyId] || companyTeams[1];
  const primaryBrand = brands[0];

  for (const teamData of teamList) {
    const team = await prisma.team.create({
      data: {
        name: teamData.name,
        description: teamData.description,
        brandId: primaryBrand.id,
        companyId,
      },
    });
    teams.push(team);
  }
  console.log(`   ✅ Created ${teams.length} teams`);

  // Create 2 HR Officers
  for (let i = 0; i < 2; i++) {
    const hrUser = await createUser(
      companyId,
      "HR",
      `Officer ${i + 1}`,
      hrRole!.id,
      positions[4].id,
      departments[2].id,
    );
    console.log(`   ✅ Created HR user: ${hrUser.username}`);
  }

  // Create 5 Managers
  for (let i = 0; i < 5; i++) {
    const managerUser = await createUser(
      companyId,
      "Manager",
      `${i + 1}`,
      managerRole!.id,
      positions[3].id,
      departments[i % departments.length].id,
    );
    console.log(`   ✅ Created manager user: ${managerUser.username}`);
  }

  // Create 50 Employees
  for (let i = 0; i < 50; i++) {
    const empUser = await createUser(
      companyId,
      "Employee",
      `${i + 1}`,
      employeeRole!.id,
      positions[i % positions.length].id,
      departments[i % departments.length].id,
    );
    if (i % 10 === 0) {
      console.log(`   ✅ Created ${i + 1}/50 employees`);
    }
  }
  console.log(`   ✅ Created 50 employees`);

  console.log(`✅ Company ${companyData.name} seeding complete!`);
}

async function createUser(
  companyId: number,
  firstName: string,
  lastName: string,
  roleId: number,
  positionId: number,
  departmentId: number,
) {
  const username = generateUsername(firstName, lastName);
  const password = generatePassword();
  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);

  return prisma.user.create({
    data: {
      username,
      passwordHash,
      salt,
      roleId,
      companyId,
      employeeProfile: {
        create: {
          firstName,
          lastName,
          dateOfBirth: new Date(
            1980 + Math.floor(Math.random() * 30),
            Math.floor(Math.random() * 12),
            Math.floor(Math.random() * 28),
          ),
          hireDate: new Date(
            2020 + Math.floor(Math.random() * 5),
            Math.floor(Math.random() * 12),
            Math.floor(Math.random() * 28),
          ),
          positionId,
          departmentId,
          statusId: 1,
        },
      },
    },
  });
}

async function main() {
  console.log("🌱 Starting multi-company seed process...\n");

  try {
    // Clear existing tenant scoped data
    console.log("🧹 Clearing existing tenant data...");
    await prisma.teamMember.deleteMany({});
    await prisma.teamHistory.deleteMany({});
    await prisma.team.deleteMany({});
    await prisma.brand.deleteMany({});
    await prisma.employeeProfile.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.position.deleteMany({});
    await prisma.department.deleteMany({});
    await prisma.role.deleteMany({});
    await prisma.leaveType.deleteMany({});
    await prisma.infractionOffense.deleteMany({});
    await prisma.infractionType.deleteMany({});
    await prisma.calendarEvent.deleteMany({});

    // Seed each company
    for (const companyData of companies) {
      await seedCompany(companyData.id, companyData);
    }

    console.log("\n🎉 Multi-company seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Companies: ${companies.length}`);
    console.log(`   - Total users: ${companies.length * 58}`);
    console.log(`   - Positions: ${companies.length * basePositions.length}`);
    console.log(`   - Departments: ${companies.length * 8}`);
    console.log(`   - Roles: ${companies.length * baseRoles.length}`);
    console.log(
      `   - Leave Types: ${companies.length * baseLeaveTypes.length}`,
    );
    console.log(`   - Brands: ${companies.length * 4}`);
    console.log(`   - Teams: ${companies.length * 6}`);

    console.log(
      "\n✅ System is now fully populated with multiple isolated companies!",
    );
  } catch (err) {
    console.error("❌ Error during seed process:", err);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error("❌ Error during seed process:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
