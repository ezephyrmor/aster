/**
 * Comprehensive seed script for complete database population
 * Run with: npx tsx scripts/seed-all-data.ts
 *
 * Configuration via environment variables:
 * - EMPLOYEE_COUNT: Number of employees to create (default: 150)
 * - BRAND_COUNT: Number of brands to create (default: 15)
 * - TEAM_COUNT: Number of teams to create (default: 20)
 */

import { PrismaClient } from "@prisma/client";
import { generateSalt, hashPassword } from "../src/lib/password";
import { generateUsername, generatePassword } from "../src/lib/userGenerator";
import SEED_CONFIG from "./seed.config";

const prisma = new PrismaClient();
const CONFIG = SEED_CONFIG;

// Date constants
const DECEMBER_2024 = new Date("2024-12-01");
const PRESENT_DATE = new Date();

// Name pools
const firstNames = [
  "James",
  "Mary",
  "John",
  "Patricia",
  "Robert",
  "Jennifer",
  "Michael",
  "Linda",
  "William",
  "Barbara",
  "David",
  "Elizabeth",
  "Richard",
  "Susan",
  "Joseph",
  "Jessica",
  "Thomas",
  "Sarah",
  "Charles",
  "Karen",
  "Christopher",
  "Nancy",
  "Daniel",
  "Lisa",
  "Matthew",
  "Betty",
  "Anthony",
  "Margaret",
  "Mark",
  "Sandra",
  "Donald",
  "Ashley",
  "Steven",
  "Kimberly",
  "Paul",
  "Emily",
  "Andrew",
  "Donna",
  "Joshua",
  "Michelle",
  "Kenneth",
  "Dorothy",
  "Kevin",
  "Carol",
  "Brian",
  "Amanda",
  "George",
  "Melissa",
  "Edward",
  "Deborah",
  "Ronald",
  "Stephanie",
  "Timothy",
  "Rebecca",
  "Jason",
  "Sharon",
  "Jeffrey",
  "Laura",
  "Ryan",
  "Cynthia",
  "Jacob",
  "Kathleen",
  "Gary",
  "Amy",
  "Nicholas",
  "Angela",
  "Eric",
  "Shirley",
  "Jonathan",
  "Anna",
  "Stephen",
  "Brenda",
  "Larry",
  "Pamela",
  "Justin",
  "Emma",
  "Scott",
  "Nicole",
  "Brandon",
  "Helen",
  "Benjamin",
  "Samantha",
  "Samuel",
  "Katherine",
  "Raymond",
  "Christine",
  "Gregory",
  "Debra",
  "Alexander",
  "Rachel",
  "Patrick",
  "Carolyn",
  "Frank",
  "Janet",
  "Dennis",
  "Catherine",
  "Jerry",
  "Maria",
  "Tyler",
  "Heather",
  "Aaron",
  "Diane",
  "Jose",
  "Ruth",
  "Adam",
  "Julie",
  "Nathan",
  "Olivia",
  "Henry",
  "Joyce",
  "Douglas",
  "Virginia",
  "Zachary",
  "Victoria",
  "Peter",
  "Kelly",
  "Kyle",
  "Lauren",
  "Noah",
  "Christina",
  "Ethan",
  "Joan",
  "Jeremy",
  "Evelyn",
  "Walter",
  "Judith",
  "Christian",
  "Megan",
  "Keith",
  "Cheryl",
  "Roger",
  "Andrea",
  "Terry",
  "Hannah",
  "Sean",
  "Martha",
  "Austin",
  "Jacqueline",
  "Gerald",
  "Frances",
  "Carl",
  "Ann",
  "Harold",
  "Jean",
  "Dylan",
  "Alice",
  "Jordan",
  "Kathryn",
  "Jesse",
  "Julia",
  "Bryan",
  "Grace",
  "Lawrence",
  "Judy",
  "Joe",
  "Beverly",
  "Billy",
  "Denise",
  "Bruce",
  "Marilyn",
  "Willie",
  "Amber",
  "Gabriel",
  "Danielle",
  "Alan",
  "Brittany",
  "Logan",
  "Diana",
  "Albert",
  "Abigail",
  "Juan",
  "Natalie",
  "Wayne",
  "Isabella",
  "Roy",
  "Sophia",
  "Ralph",
  "Marie",
  "Randy",
  "Kayla",
  "Eugene",
  "Alexis",
  "Vincent",
  "Lori",
  "Russell",
  "Tiffany",
  "Louis",
  "Philip",
  "Melanie",
  "Bobby",
  "Vanessa",
  "Johnny",
  "Courtney",
  "Bradley",
  "Marcus",
  "Latasha",
];

const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Perez",
  "Thompson",
  "White",
  "Harris",
  "Sanchez",
  "Clark",
  "Ramirez",
  "Lewis",
  "Robinson",
  "Walker",
  "Young",
  "Allen",
  "King",
  "Wright",
  "Scott",
  "Torres",
  "Nguyen",
  "Hill",
  "Flores",
  "Green",
  "Adams",
  "Nelson",
  "Baker",
  "Hall",
  "Rivera",
  "Campbell",
  "Mitchell",
  "Carter",
  "Roberts",
  "Gomez",
  "Phillips",
  "Evans",
  "Turner",
  "Diaz",
  "Parker",
  "Cruz",
  "Edwards",
  "Collins",
  "Reyes",
  "Stewart",
  "Morris",
  "Morales",
  "Murphy",
  "Cook",
  "Rogers",
  "Gutierrez",
  "Ortiz",
  "Morgan",
  "Cooper",
  "Peterson",
  "Bailey",
  "Reed",
  "Kelly",
  "Howard",
  "Ramos",
  "Kim",
  "Cox",
  "Ward",
  "Richardson",
  "Watson",
  "Brooks",
  "Chavez",
  "Wood",
  "James",
  "Bennett",
  "Gray",
  "Mendoza",
  "Ruiz",
  "Hughes",
  "Price",
  "Myers",
  "Long",
  "Foster",
  "Sanders",
  "Ross",
  "Morales",
  "Powell",
  "Sullivan",
  "Russell",
  "Ortiz",
  "Jenkins",
  "Gutierrez",
  "Perry",
  "Butler",
  "Barnes",
  "Fisher",
  "Henderson",
  "Coleman",
  "Simmons",
  "Patterson",
  "Jordan",
  "Reynolds",
  "Hamilton",
  "Graham",
  "Kim",
  "Gonzalez",
  "Wallace",
  "West",
  "Cole",
  "Hayes",
  "Bryant",
  "Herrera",
  "Gibson",
  "Ellis",
  "Tran",
  "Medina",
  "Aguilar",
  "Stevens",
  "Murray",
  "Ford",
  "Castillo",
  "Fields",
  "Watts",
  "Bates",
  "Hale",
  "Rhodes",
  "Pena",
  "Beck",
  "Newman",
  "Haynes",
  "McDaniel",
  "Mendez",
  "Bush",
  "Vaughn",
  "Parks",
  "Dawson",
  "Santiago",
  "Norris",
  "Hardy",
  "Love",
  "Steele",
  "Curry",
  "Powers",
  "Schultz",
  "Barker",
  "Guzman",
  "Page",
  "Munoz",
  "Ball",
  "Kent",
  "Waters",
  "Nunez",
  "Ballard",
  "Schwartz",
  "McBride",
  "Carlson",
  "Frost",
  "Holt",
  "Potter",
  "Delgado",
  "Zuniga",
  "Snyder",
  "Carr",
  "Chapman",
  "Oliver",
  "Montgomery",
  "Richards",
  "Williamson",
  "Johnston",
  "Banks",
  "Meyer",
];

const middleNames = [
  "Michael",
  "Elizabeth",
  "James",
  "Marie",
  "John",
  "Patricia",
  "Robert",
  "Jennifer",
  "William",
  "Linda",
  "David",
  "Barbara",
  "Richard",
  "Susan",
  "Joseph",
  "Jessica",
  "Thomas",
  "Sarah",
  "Charles",
  "Karen",
  "Daniel",
  "Nancy",
  "Matthew",
  "Lisa",
  "Anthony",
  "Betty",
  "Mark",
  "Margaret",
  "Donald",
  "Sandra",
  "Steven",
  "Ashley",
  "Paul",
  "Kimberly",
  "Andrew",
  "Emily",
  "Joshua",
  "Donna",
  "Kenneth",
  "Michelle",
  "Kevin",
  "Dorothy",
  "Brian",
  "Carol",
  "George",
  "Amanda",
  "Edward",
  "Melissa",
  "Ronald",
  "Deborah",
  "Timothy",
  "Stephanie",
  "Jason",
  "Rebecca",
  "Jeffrey",
  "Laura",
];

const cities = [
  { city: "New York", state: "NY" },
  { city: "Los Angeles", state: "CA" },
  { city: "Chicago", state: "IL" },
  { city: "Houston", state: "TX" },
  { city: "Phoenix", state: "AZ" },
  { city: "Philadelphia", state: "PA" },
  { city: "San Antonio", state: "TX" },
  { city: "San Diego", state: "CA" },
  { city: "Dallas", state: "TX" },
  { city: "San Jose", state: "CA" },
  { city: "Austin", state: "TX" },
  { city: "Jacksonville", state: "FL" },
  { city: "Columbus", state: "OH" },
  { city: "Seattle", state: "WA" },
  { city: "Denver", state: "CO" },
  { city: "Boston", state: "MA" },
  { city: "Portland", state: "OR" },
  { city: "Miami", state: "FL" },
  { city: "Atlanta", state: "GA" },
  { city: "Minneapolis", state: "MN" },
];

const streetNames = [
  "Main St",
  "Oak Ave",
  "Pine St",
  "Elm St",
  "Cedar Ln",
  "Birch Rd",
  "Maple Dr",
  "Walnut St",
  "Spruce Ave",
  "Ash St",
  "Washington Blvd",
  "Park Ave",
  "Lake Dr",
  "Hill Rd",
  "River Rd",
];

const brandNames = [
  "TechCorp Solutions",
  "InnovateLab",
  "GreenLeaf Organics",
  "FinanceFirst",
  "HealthPlus Medical",
  "EduWorld Academy",
  "RetailMax",
  "BuildRight Construction",
  "MediaVision Studios",
  "LogiTrack Systems",
  "CloudNine Technologies",
  "DataFlow Analytics",
  "SecureNet Solutions",
  "EcoGreen Energy",
  "SmartHome Innovations",
  "GlobalTrade Partners",
  "NextGen Robotics",
  "BioHealth Sciences",
  "UrbanMobility",
  "FoodTech Labs",
];

const teamConfigs = [
  { name: "Engineering", description: "Software development team" },
  { name: "Product", description: "Product management team" },
  { name: "Operations", description: "Operations and support team" },
  { name: "Design", description: "Design and UX team" },
  { name: "Marketing", description: "Marketing and communications team" },
  { name: "Sales", description: "Sales and business development team" },
  { name: "Data Analytics", description: "Data analysis and insights team" },
  { name: "Quality Assurance", description: "QA and testing team" },
  {
    name: "Customer Success",
    description: "Customer support and success team",
  },
  { name: "Research", description: "Research and development team" },
];

const infractionReasons = [
  "Repeated tardiness despite verbal warnings.",
  "Failed to follow established safety protocols.",
  "Unauthorized absence from work station.",
  "Inappropriate language used in the workplace.",
  "Failure to meet project deadlines.",
  "Misuse of company equipment.",
  "Violation of dress code policy.",
  "Disregard for supervisor instructions.",
  "Poor work quality requiring rework.",
  "Sharing confidential information.",
];

// Utility functions
function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function generateDateOfBirth(): Date {
  const year = 1980 + Math.floor(Math.random() * 25);
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  return new Date(
    `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`,
  );
}

function generateHireDate(): Date {
  return getRandomDate(DECEMBER_2024, PRESENT_DATE);
}

function generateEndDate(hireDate: Date): Date | null {
  if (Math.random() > 0.15) return null;
  const minDate = new Date(hireDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  if (minDate >= PRESENT_DATE) return null;
  return getRandomDate(minDate, PRESENT_DATE);
}

function generatePhoneNumber(): string {
  const areaCode = 200 + Math.floor(Math.random() * 800);
  const exchange = 200 + Math.floor(Math.random() * 800);
  const subscriber = 1000 + Math.floor(Math.random() * 9000);
  return `+1-${areaCode}-${exchange}-${subscriber}`;
}

function generateAddress(): string {
  const number = 100 + Math.floor(Math.random() * 9900);
  const street = getRandomItem(streetNames);
  const location = getRandomItem(cities);
  const zip = 10000 + Math.floor(Math.random() * 89999);
  return `${number} ${street}, ${location.city}, ${location.state} ${zip}`;
}

function getRandomStatus(statuses: { id: string; name: string }[]): {
  id: string;
  name: string;
} {
  const weights = [
    { status: "active", weight: CONFIG.employeeStatusActive },
    { status: "on_leave", weight: CONFIG.employeeStatusOnLeave },
    { status: "inactive", weight: CONFIG.employeeStatusInactive },
    { status: "terminated", weight: CONFIG.employeeStatusTerminated },
  ];
  const rand = Math.random();
  let cumulative = 0;
  for (const { status, weight } of weights) {
    cumulative += weight;
    if (rand < cumulative) {
      return statuses.find((s) => s.name === status) || statuses[0];
    }
  }
  return statuses[0];
}

// Logging utilities
function logStep(message: string) {
  console.log(`\n📍 ${message}`);
}

function logSuccess(message: string) {
  console.log(`   ✅ ${message}`);
}

function logError(message: string, error?: unknown) {
  console.log(`   ❌ ${message}`);
  if (error instanceof Error) console.error(`      ${error.message}`);
}

function logProgress(current: number, total: number, prefix: string = "") {
  const percent = Math.max(
    0,
    Math.min(100, Math.round((current / total) * 100)),
  );
  const bar =
    "█".repeat(Math.floor(percent / 5)) +
    "░".repeat(20 - Math.floor(percent / 5));
  process.stdout.write(
    `\r   ${prefix}[${bar}] ${percent}% (${current}/${total})`,
  );
}

// Types
interface CreatedUser {
  id: string;
  companyId: string;
  username: string;
  password: string;
  hireDate: Date;
  endDate: Date | null;
}

interface CreatedBrand {
  id: string;
  name: string;
}

interface CreatedTeam {
  id: string;
  name: string;
}

// Main seeding function
async function main() {
  console.log("🌱 Starting comprehensive database seeding...\n");
  console.log("📊 Configuration:");
  console.log(`   - Employees: ${CONFIG.employeeCount}`);
  console.log(`   - Brands: ${CONFIG.brandCount}`);
  console.log(`   - Teams: ${CONFIG.teamCount}`);

  try {
    // Phase 1: Get lookup data
    logStep("Loading lookup tables...");
    const roles = await prisma.role.findMany();
    const positions = await prisma.position.findMany();
    const departments = await prisma.department.findMany();
    const statuses = await prisma.employeeStatusModel.findMany();
    const industries = await prisma.industry.findMany();
    const leaveTypes = await prisma.leaveType.findMany({
      where: { isActive: true },
    });
    const leaveStatuses = await prisma.leaveStatus.findMany();
    const infractionOffenses = await prisma.infractionOffense.findMany({
      where: { isActive: true },
    });

    const employeeRole = roles.find((r) => r.name === "employee");
    const adminRole = roles.find((r) => r.name === "admin");

    if (!employeeRole || !adminRole) {
      throw new Error(
        "Required roles not found. Please run seed-lookup-tables.ts and seed-admin.ts first.",
      );
    }

    logSuccess(
      `Loaded ${positions.length} positions, ${departments.length} departments, ${industries.length} industries`,
    );

    // Get or create admin user
    let adminUser = await prisma.user.findFirst({
      where: {
        employeeProfile: {
          role: { name: "admin" },
        },
      },
    });
    if (!adminUser) {
      const salt = generateSalt();
      const passwordHash = await hashPassword("password123", salt);
      adminUser = await prisma.user.create({
        data: {
          username: "admin",
          passwordHash,
          salt,
          employeeProfile: {
            create: {
              firstName: "System",
              lastName: "Administrator",
              roleId: adminRole.id,
              positionId: positions[0]?.id,
              departmentId: departments[0]?.id,
              statusId: statuses.find((s) => s.name === "active")?.id as string,
            },
          },
        },
      });
      logSuccess("Admin user created");
    }

    // Phase 2: Create employees
    logStep(`Creating ${CONFIG.employeeCount} employees...`);
    const createdUsers: CreatedUser[] = [];
    const usedUsernames = new Set<string>();

    // Get default company
    const defaultCompany = await prisma.company.findFirstOrThrow();

    for (let i = 0; i < CONFIG.employeeCount; i++) {
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[i % lastNames.length];
      const middleName = middleNames[i % middleNames.length];

      let username = generateUsername(firstName, lastName);
      let counter = 1;
      while (usedUsernames.has(username)) {
        username = generateUsername(firstName, lastName) + counter;
        counter++;
      }
      usedUsernames.add(username);

      const password = generatePassword();
      const salt = generateSalt();
      const passwordHash = await hashPassword(password, salt);

      const hireDate = generateHireDate();
      const endDate = generateEndDate(hireDate);
      const status = endDate
        ? statuses.find((s) => s.name === "terminated") || statuses[0]
        : getRandomStatus(statuses);
      const position = getRandomItem(positions);
      const department = getRandomItem(departments);

      try {
        const user = await prisma.user.create({
          data: {
            username,
            passwordHash,
            salt,
            companyId: defaultCompany.id,
            employeeProfile: {
              create: {
                firstName,
                lastName,
                roleId: employeeRole.id,
                middleName,
                dateOfBirth: generateDateOfBirth(),
                contactNumber: generatePhoneNumber(),
                personalEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
                address: generateAddress(),
                hireDate,
                positionId: position.id,
                departmentId: department.id,
                statusId: status.id,
              },
            },
          },
        });

        createdUsers.push({
          id: user.id,
          companyId: user.companyId,
          username,
          password,
          hireDate,
          endDate,
        });

        // ALWAYS create initial ACTIVE status record first (100% of employees)
        const activeStatus =
          statuses.find((s) => s.name === "active") || statuses[0];
        await prisma.employeeStatusHistory.create({
          data: {
            userId: user.id,
            statusId: activeStatus.id,
            effectiveDate: hireDate,
            reason: "Initial hire date",
            notes: "System generated record from seeding",
            performedBy: adminUser.id,
            ipAddress: "127.0.0.1",
            userAgent: "Seed script",
          },
        });

        // Add additional status changes if user is not currently active
        if (status.name !== "active") {
          const statusChangeDate = new Date(hireDate);
          // Random date between 30-365 days after hire
          statusChangeDate.setDate(
            statusChangeDate.getDate() + Math.floor(Math.random() * 335) + 30,
          );

          await prisma.employeeStatusHistory.create({
            data: {
              userId: user.id,
              statusId: status.id,
              effectiveDate: statusChangeDate,
              reason:
                status.name === "terminated"
                  ? "Employment terminated"
                  : status.name === "on_leave"
                    ? "Approved leave request"
                    : "Account deactivated",
              notes: "System generated record from seeding",
              performedBy: adminUser.id,
              ipAddress: "127.0.0.1",
              userAgent: "Seed script",
            },
          });
        }

        // Add random past termination history for 10% of currently active users
        if (status.name === "active" && Math.random() < 0.1) {
          const terminatedStatus =
            statuses.find((s) => s.name === "terminated") || statuses[0];
          const terminationDate = new Date(hireDate);
          terminationDate.setDate(
            terminationDate.getDate() + Math.floor(Math.random() * 200) + 60,
          );

          const rehireDate = new Date(terminationDate);
          rehireDate.setDate(
            rehireDate.getDate() + Math.floor(Math.random() * 150) + 30,
          );

          // Termination record
          await prisma.employeeStatusHistory.create({
            data: {
              userId: user.id,
              statusId: terminatedStatus.id,
              effectiveDate: terminationDate,
              reason: "Employment terminated",
              notes: "Random generated past employment history",
              performedBy: adminUser.id,
              ipAddress: "127.0.0.1",
              userAgent: "Seed script",
            },
          });

          // Rehire record
          await prisma.employeeStatusHistory.create({
            data: {
              userId: user.id,
              statusId: activeStatus.id,
              effectiveDate: rehireDate,
              reason: "Employee rehired",
              notes: "Random generated past employment history",
              performedBy: adminUser.id,
              ipAddress: "127.0.0.1",
              userAgent: "Seed script",
            },
          });
        }

        if (i % 10 === 0 || i === CONFIG.employeeCount - 1) {
          logProgress(i + 1, CONFIG.employeeCount, "Employees");
        }
      } catch (error: unknown) {
        const err = error as { code?: string };
        if (err.code !== "P2002") {
          logError(`Failed to create employee ${username}`, error);
        }
      }
    }
    console.log();
    logSuccess(`Created ${createdUsers.length} employees`);

    // Phase 3: Create schedules (~80% of employees)
    logStep("Creating work schedules...");
    const employeesWithSchedules: CreatedUser[] = [];
    const workDays = [1, 2, 3, 4, 5];
    const scheduleTemplates = [
      { start: "09:00", end: "18:00", break: 60 },
      { start: "08:00", end: "17:00", break: 60 },
      { start: "10:00", end: "19:00", break: 60 },
      { start: "07:00", end: "16:00", break: 30 },
      { start: "08:30", end: "17:30", break: 60 },
    ];

    let schedulesCreated = 0;
    for (const employee of createdUsers) {
      if (Math.random() < 0.2) continue;

      const template = getRandomItem(scheduleTemplates);
      const effectiveFrom = getRandomDate(employee.hireDate, PRESENT_DATE);

      for (const dayOfWeek of workDays) {
        await prisma.workSchedule.create({
          data: {
            userId: employee.id,
            companyId: employee.companyId,
            dayOfWeek,
            startTime: template.start,
            endTime: template.end,
            breakMinutes: template.break,
            effectiveFrom,
          },
        });
      }
      employeesWithSchedules.push(employee);
      schedulesCreated++;

      if (schedulesCreated % 10 === 0) {
        logProgress(
          schedulesCreated,
          Math.floor(CONFIG.employeeCount * CONFIG.scheduleCoveragePercent),
          "Schedules",
        );
      }
    }
    console.log();
    logSuccess(
      `Created schedules for ${employeesWithSchedules.length} employees (${Math.round((employeesWithSchedules.length / createdUsers.length) * 100)}%)`,
    );

    // Phase 4: Create attendance entries based on schedules
    logStep("Creating attendance records...");
    let attendanceCreated = 0;
    const attendanceStatusWeights = [
      "present",
      "present",
      "present",
      "present",
      "present",
      "late",
      "late",
      "absent",
      "undertime",
      "on_leave",
    ];

    for (const employee of employeesWithSchedules) {
      const startDate = new Date(
        Math.max(
          employee.hireDate.getTime(),
          PRESENT_DATE.getTime() - 30 * 24 * 60 * 60 * 1000,
        ),
      );

      for (
        let d = new Date(startDate);
        d < PRESENT_DATE;
        d.setDate(d.getDate() + 1)
      ) {
        const dayOfWeek = d.getDay();
        if (!workDays.includes(dayOfWeek)) continue;

        const status = getRandomItem(attendanceStatusWeights) as
          | "present"
          | "late"
          | "absent"
          | "undertime"
          | "on_leave";
        const schedule = await prisma.workSchedule.findFirst({
          where: {
            userId: employee.id,
            dayOfWeek,
            effectiveFrom: { lte: d },
            OR: [{ effectiveTo: null }, { effectiveTo: { gte: d } }],
          },
        });

        if (!schedule) continue;

        try {
          const attendanceData: any = {
            user: { connect: { id: employee.id } },
            schedule: { connect: { id: schedule.id } },
            date: new Date(d),
            status,
          };

          if (status === "present") {
            const scheduledStart = new Date(
              `${formatDate(d)}T${schedule.startTime}`,
            );
            const lateMinutes = Math.random() < 0.1 ? getRandomInt(5, 30) : 0;
            attendanceData.clockIn = new Date(
              scheduledStart.getTime() + lateMinutes * 60000,
            );
            const scheduledEnd = new Date(
              `${formatDate(d)}T${schedule.endTime}`,
            );
            const undertimeMinutes =
              Math.random() < 0.05 ? getRandomInt(15, 60) : 0;
            attendanceData.clockOut = new Date(
              scheduledEnd.getTime() - undertimeMinutes * 60000,
            );
            attendanceData.lateMinutes = lateMinutes;
            attendanceData.undertimeMinutes = undertimeMinutes;
          } else if (status === "late") {
            const scheduledStart = new Date(
              `${formatDate(d)}T${schedule.startTime}`,
            );
            const lateMinutes = getRandomInt(15, 60);
            attendanceData.clockIn = new Date(
              scheduledStart.getTime() + lateMinutes * 60000,
            );
            const scheduledEnd = new Date(
              `${formatDate(d)}T${schedule.endTime}`,
            );
            attendanceData.clockOut = new Date(
              scheduledEnd.getTime() - getRandomInt(0, 30) * 60000,
            );
            attendanceData.lateMinutes = lateMinutes;
          } else if (status === "undertime") {
            const scheduledStart = new Date(
              `${formatDate(d)}T${schedule.startTime}`,
            );
            attendanceData.clockIn = new Date(scheduledStart.getTime());
            const scheduledEnd = new Date(
              `${formatDate(d)}T${schedule.endTime}`,
            );
            const undertimeMinutes = getRandomInt(60, 180);
            attendanceData.clockOut = new Date(
              scheduledEnd.getTime() - undertimeMinutes * 60000,
            );
            attendanceData.undertimeMinutes = undertimeMinutes;
          }

          await prisma.attendance.create({ data: attendanceData });
          attendanceCreated++;
        } catch (error: unknown) {
          const err = error as { code?: string };
          if (err.code !== "P2002") {
            logError(
              `Failed to create attendance for ${employee.username} on ${formatDate(d)}`,
              error,
            );
          }
        }
      }

      if (attendanceCreated % 50 === 0) {
        logProgress(
          attendanceCreated,
          employeesWithSchedules.length * 20,
          "Attendance",
        );
      }
    }
    console.log();
    logSuccess(`Created ${attendanceCreated} attendance records`);

    // Phase 5: Create brands with managers
    logStep(`Creating ${CONFIG.brandCount} brands...`);
    const createdBrands: CreatedBrand[] = [];
    const usedBrandNames = new Set<string>();

    for (let i = 0; i < CONFIG.brandCount; i++) {
      let brandName = brandNames[i % brandNames.length];
      if (usedBrandNames.has(brandName)) {
        brandName = `${brandName} ${i + 1}`;
      }
      usedBrandNames.add(brandName);

      const industry = getRandomItem(industries);

      try {
        const brand = await prisma.brand.create({
          data: {
            name: brandName,
            companyId: defaultCompany.id,
            description: `${brandName} - A leading company in the ${industry.name} industry.`,
            logo: `https://via.placeholder.com/150/${getRandomInt(0, 0xffffff).toString(16).padStart(6, "0")}/FFFFFF?text=${brandName.substring(0, 3).toUpperCase()}`,
            website: `https://${brandName.toLowerCase().replace(/\s+/g, "")}.com`,
            industryId: industry.id,
            status: getRandomItem([
              "active",
              "active",
              "active",
              "inactive",
              "archived",
            ] as const),
            createdBy: adminUser.id,
          },
        });

        if (Math.random() < 0.7 && createdUsers.length > 0) {
          const manager = getRandomItem(createdUsers);
          await prisma.brand.update({
            where: { id: brand.id },
            data: { managerId: manager.id },
          });

          await prisma.brandManagerHistory.create({
            data: {
              brandId: brand.id,
              userId: manager.id,
              action: "ASSIGNED",
              performedBy: adminUser.id,
              reason: `Assigned as brand manager for ${brandName}`,
            },
          });
        }

        createdBrands.push({ id: brand.id, name: brandName });

        if (i % 5 === 0) {
          logProgress(i + 1, CONFIG.brandCount, "Brands");
        }
      } catch (error: unknown) {
        logError(`Failed to create brand ${brandName}`, error);
      }
    }
    console.log();
    logSuccess(`Created ${createdBrands.length} brands`);

    // Phase 6: Create teams
    logStep(`Creating ${CONFIG.teamCount} teams...`);
    const createdTeams: CreatedTeam[] = [];
    const usedTeamNames = new Set<string>();

    for (let i = 0; i < CONFIG.teamCount; i++) {
      const config = teamConfigs[i % teamConfigs.length];
      const brand = getRandomItem(createdBrands);
      let teamName = `${config.name} - ${brand.name}`;

      if (usedTeamNames.has(teamName)) {
        teamName = `${config.name} - ${brand.name} ${i + 1}`;
      }
      usedTeamNames.add(teamName);

      try {
        const team = await prisma.team.create({
          data: {
            name: teamName,
            description: config.description,
            brandId: brand.id,
          },
        });

        createdTeams.push({ id: team.id, name: teamName });

        const teamSize = getRandomInt(3, 6);
        const availableUsers = createdUsers.filter(
          (u) => !usedTeamNames.has(`${teamName}-${u.id}`),
        );
        const shuffled = [...availableUsers].sort(() => Math.random() - 0.5);
        const selectedUsers = shuffled.slice(
          0,
          Math.min(teamSize, shuffled.length),
        );

        const hasLeader = Math.random() < 0.7;

        for (let j = 0; j < selectedUsers.length; j++) {
          const user = selectedUsers[j];
          const isLeader = hasLeader && j === 0;

          await prisma.teamMember.create({
            data: {
              teamId: team.id,
              userId: user.id,
              isLeader,
            },
          });

          await prisma.teamHistory.create({
            data: {
              teamId: team.id,
              action: "joined",
              performedBy: adminUser.id,
              metadata: { userId: user.id, isLeader },
            },
          });
        }

        if (i % 5 === 0) {
          logProgress(i + 1, CONFIG.teamCount, "Teams");
        }
      } catch (error: unknown) {
        logError(`Failed to create team ${teamName}`, error);
      }
    }
    console.log();
    logSuccess(`Created ${createdTeams.length} teams`);

    // Phase 7: Create team history (removals and leader assignments)
    logStep("Creating team history records...");
    let historyCreated = 0;

    const teamMembers = await prisma.teamMember.findMany({
      include: { team: true, user: true },
    });

    for (const member of teamMembers) {
      if (Math.random() < 0.1) {
        const removalDate = getRandomDate(member.joinedAt, PRESENT_DATE);
        await prisma.teamHistory.create({
          data: {
            teamId: member.teamId,
            teamMemberId: member.id,
            action: "removed",
            performedBy: adminUser.id,
            reason: getRandomItem([
              "Transferred to another team",
              "Left the company",
              "Project completed",
            ]),
            createdAt: removalDate,
          },
        });

        await prisma.teamMember.update({
          where: { id: member.id },
          data: { status: "inactive", leftAt: removalDate },
        });

        historyCreated++;
      }

      if (!member.isLeader && Math.random() < 0.05) {
        const promotionDate = getRandomDate(member.joinedAt, PRESENT_DATE);
        await prisma.teamHistory.create({
          data: {
            teamId: member.teamId,
            teamMemberId: member.id,
            action: "promoted",
            performedBy: adminUser.id,
            reason: "Promoted to team leader",
            createdAt: promotionDate,
          },
        });

        await prisma.teamMember.update({
          where: { id: member.id },
          data: { isLeader: true },
        });
        historyCreated++;
      }
    }
    logSuccess(`Created ${historyCreated} team history records`);

    // Phase 8: Create brand manager history
    logStep("Creating brand manager history...");
    let brandHistoryCreated = 0;

    for (const brand of createdBrands) {
      const historyCount = getRandomInt(1, 3);

      for (let h = 0; h < historyCount; h++) {
        const action = getRandomItem(["ASSIGNED", "REMOVED"] as const);
        const user = getRandomItem(createdUsers);
        const historyDate = getRandomDate(DECEMBER_2024, PRESENT_DATE);

        try {
          await prisma.brandManagerHistory.create({
            data: {
              brandId: brand.id,
              userId: action === "ASSIGNED" ? user.id : null,
              action,
              performedBy: adminUser.id,
              reason: getRandomItem(infractionReasons),
              timestamp: historyDate,
            },
          });
          brandHistoryCreated++;
        } catch (error: unknown) {
          // Continue on error
        }
      }
    }
    logSuccess(`Created ${brandHistoryCreated} brand manager history records`);

    // Phase 9: Create leave entries (2-3 per employee)
    logStep("Creating leave requests...");
    let leavesCreated = 0;

    for (const employee of createdUsers) {
      const leaveCount = getRandomInt(2, 3);

      for (let l = 0; l < leaveCount; l++) {
        const leaveType = getRandomItem(leaveTypes);
        const leaveStatus = getRandomItem(leaveStatuses);

        const empEndDate = employee.endDate || PRESENT_DATE;
        const maxLeaveStart = new Date(
          empEndDate.getTime() - 7 * 24 * 60 * 60 * 1000,
        );

        if (employee.hireDate > maxLeaveStart) continue;

        const leaveStart = getRandomDate(employee.hireDate, maxLeaveStart);
        const leaveDuration = getRandomInt(1, 5);
        const leaveEnd = new Date(
          leaveStart.getTime() + leaveDuration * 24 * 60 * 60 * 1000,
        );

        if (leaveEnd > empEndDate) continue;

        try {
          const leaveRequest = await prisma.leaveRequest.create({
            data: {
              userId: employee.id,
              leaveTypeId: leaveType.id,
              statusId: leaveStatus.id,
              startDate: leaveStart,
              endDate: leaveEnd,
              reason: `Requesting ${leaveType.name.toLowerCase()} for personal reasons.`,
              isPaid:
                leaveType.name.includes("Vacation") ||
                leaveType.name.includes("Sick"),
              reviewedBy: leaveStatus.name !== "Pending" ? adminUser.id : null,
              reviewedAt:
                leaveStatus.name !== "Pending"
                  ? getRandomDate(leaveStart, PRESENT_DATE)
                  : null,
              reviewComment:
                leaveStatus.name === "Approved"
                  ? "Approved - have a great time!"
                  : leaveStatus.name === "Denied"
                    ? "Denied - insufficient leave credits."
                    : leaveStatus.name === "Cancelled"
                      ? "Cancelled by employee."
                      : null,
            },
          });

          const leaveCredits = await prisma.leaveCredit.findMany({
            where: { userId: employee.id },
            take: leaveDuration,
          });

          for (const credit of leaveCredits) {
            await prisma.leaveUsage.create({
              data: {
                leaveRequestId: leaveRequest.id,
                leaveCreditId: credit.id,
              },
            });
          }

          leavesCreated++;
        } catch (error: unknown) {
          logError(`Failed to create leave for ${employee.username}`, error);
        }
      }

      if (leavesCreated % 50 === 0) {
        logProgress(leavesCreated, createdUsers.length * 2, "Leaves");
      }
    }
    console.log();
    logSuccess(`Created ${leavesCreated} leave requests`);

    // Phase 10: Create infractions (~60% of employees)
    logStep("Creating infractions...");
    let infractionsCreated = 0;

    for (const employee of createdUsers) {
      if (Math.random() < 0.4) continue;

      const infractionCount = getRandomInt(1, 3);

      for (let i = 0; i < infractionCount; i++) {
        const offense = getRandomItem(infractionOffenses);

        const empEndDate = employee.endDate || PRESENT_DATE;
        const infractionDate = getRandomDate(employee.hireDate, empEndDate);
        const isAcknowledged = Math.random() < 0.6;

        await prisma.infraction.create({
          data: {
            userId: employee.id,
            companyId: employee.companyId,
            offenseId: offense.id,
            typeId: offense.typeId,
            date: infractionDate,
            details: getRandomItem(infractionReasons),
            comment: isAcknowledged
              ? "Employee acknowledged the infraction."
              : null,
            createdBy: adminUser.id,
            acknowledgedBy: isAcknowledged ? employee.id : null,
            acknowledgedAt: isAcknowledged
              ? getRandomDate(infractionDate, PRESENT_DATE)
              : null,
          },
        });
        infractionsCreated++;
      }

      if (infractionsCreated % 20 === 0) {
        logProgress(
          infractionsCreated,
          Math.floor(createdUsers.length * 0.6 * 2),
          "Infractions",
        );
      }
    }
    console.log();
    logSuccess(`Created ${infractionsCreated} infractions`);

    // Final summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 SEEDING SUMMARY");
    console.log("=".repeat(60));
    console.log(`   Employees created: ${createdUsers.length}`);
    console.log(
      `   Employees with schedules: ${employeesWithSchedules.length} (${Math.round((employeesWithSchedules.length / createdUsers.length) * 100)}%)`,
    );
    console.log(`   Attendance records: ${attendanceCreated}`);
    console.log(`   Brands created: ${createdBrands.length}`);
    console.log(`   Teams created: ${createdTeams.length}`);
    console.log(`   Team history records: ${historyCreated}`);
    console.log(`   Brand manager history: ${brandHistoryCreated}`);
    console.log(`   Leave requests: ${leavesCreated}`);
    console.log(`   Infractions: ${infractionsCreated}`);
    console.log("=".repeat(60));
    console.log("\n✅ Database seeding completed successfully!");

    if (createdUsers.length > 0) {
      console.log("\n🔐 Sample User Credentials (first 5):");
      createdUsers.slice(0, 5).forEach((user) => {
        console.log(`   - ${user.username}: ${user.password}`);
      });
      console.log(`   ... and ${createdUsers.length - 5} more users`);
    }
  } catch (error: unknown) {
    logError("Critical error during seeding", error);
    if (error instanceof Error) console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error("❌ Unhandled error:", e);
  process.exit(1);
});
