/**
 * Seed script to create 1000 dummy users, brands, teams, and team members
 * Run with: npx tsx scripts/seed-dummy-data.ts
 */

import { PrismaClient } from "@prisma/client";
import { generateSalt, hashPassword } from "../src/lib/password";
import { generateUsername, generatePassword } from "../src/lib/userGenerator";

const prisma = new PrismaClient();

// First names for generating 1000 users
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
  "Nicholas",
  "Theresa",
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
  "Andrea",
  "Philip",
  "Melanie",
  "Bobby",
  "Vanessa",
  "Johnny",
  "Courtney",
  "Bradley",
  "Margaret",
  "Marcus",
  "Latasha",
];

// Last names for generating 1000 users
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
  "Castillo",
  " Wheeler",
  "Chapman",
  "Oliver",
  "Montgomery",
  "Richards",
  "Williamson",
  "Johnston",
  "Banks",
  "Meyer",
];

// Middle names
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
];

// Status distribution - Realistic corporate employment demographics
const statusWeights = [
  { status: "active", weight: 0.58 }, // Regular full-time employees
  { status: "probation", weight: 0.12 }, // New hires < 90 days
  { status: "contract", weight: 0.08 }, // Contractors & temps
  { status: "on_leave", weight: 0.07 }, // Approved leave (vacation, sick, parental)
  { status: "inactive", weight: 0.05 }, // LOA, furlough, temporary inactive
  { status: "suspended", weight: 0.02 }, // Disciplinary / pending investigation
  { status: "resigned", weight: 0.04 }, // Voluntary departures
  { status: "terminated", weight: 0.02 }, // Involuntary termination
  { status: "retired", weight: 0.015 }, // Retired employees
  { status: "deceased", weight: 0.005 }, // Historical records
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomStatus(): string {
  const rand = Math.random();
  let cumulative = 0;
  for (const { status, weight } of statusWeights) {
    cumulative += weight;
    if (rand < cumulative) return status;
  }
  return "active";
}

function generateDateOfBirth(): string {
  const year = 1980 + Math.floor(Math.random() * 25);
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

function generateHireDate(): string {
  const year = 2018 + Math.floor(Math.random() * 7);
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

function generatePhoneNumber(): string {
  const areaCode = 200 + Math.floor(Math.random() * 800);
  const exchange = 200 + Math.floor(Math.random() * 800);
  const subscriber = 1000 + Math.floor(Math.random() * 9000);
  return `+1-${areaCode}-${exchange}-${subscriber}`;
}

// Cities and addresses
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
  { city: "Fort Worth", state: "TX" },
  { city: "Columbus", state: "OH" },
  { city: "San Francisco", state: "CA" },
  { city: "Charlotte", state: "NC" },
  { city: "Indianapolis", state: "IN" },
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

function generateAddress(): string {
  const number = 100 + Math.floor(Math.random() * 9900);
  const street = getRandomItem(streetNames);
  const location = getRandomItem(cities);
  const zip = 10000 + Math.floor(Math.random() * 89999);
  return `${number} ${street}, ${location.city}, ${location.state} ${zip}`;
}

// Generate 1000 user profiles using database positions and departments
function generateDummyUsers(
  count: number,
  dbPositions: { id: string; name: string }[],
  dbDepartments: { id: string; name: string }[],
) {
  const users = [];
  const usedUsernames = new Set();

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const middleName = middleNames[i % middleNames.length];

    // Use actual database positions and departments
    const position = dbPositions[i % dbPositions.length];
    const department = dbDepartments[i % dbDepartments.length];

    // Generate unique username
    let username = generateUsername(firstName, lastName);
    let counter = 1;
    while (usedUsernames.has(username)) {
      username = generateUsername(firstName, lastName) + counter;
      counter++;
    }
    usedUsernames.add(username);

    users.push({
      firstName,
      lastName,
      middleName,
      positionId: position.id,
      departmentId: department.id,
      position: position.name,
      department: department.name,
      dateOfBirth: generateDateOfBirth(),
      hireDate: generateHireDate(),
      contactNumber: generatePhoneNumber(),
      personalEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
      address: generateAddress(),
      status: getRandomStatus(),
      username,
    });
  }

  return users;
}

const dummyBrands = [
  {
    name: "TechCorp Solutions",
    description:
      "Leading technology solutions provider specializing in enterprise software and cloud services.",
    logo: "https://via.placeholder.com/150/0000FF/808080?text=TechCorp",
    website: "https://techcorp.com",
    industry: "Technology",
    status: "active",
  },
  {
    name: "InnovateLab",
    description:
      "Research and development company focused on cutting-edge AI and machine learning solutions.",
    logo: "https://via.placeholder.com/150/FF0000/FFFFFF?text=InnovateLab",
    website: "https://innovatelab.io",
    industry: "Technology",
    status: "active",
  },
  {
    name: "GreenLeaf Organics",
    description:
      "Sustainable organic food production and distribution company.",
    logo: "https://via.placeholder.com/150/008000/FFFFFF?text=GreenLeaf",
    website: "https://greenleaforganics.com",
    industry: "Healthcare",
    status: "active",
  },
  {
    name: "FinanceFirst",
    description:
      "Full-service financial institution providing banking, investment, and insurance services.",
    logo: "https://via.placeholder.com/150/FFD700/000000?text=FinanceFirst",
    website: "https://financefirst.com",
    industry: "Finance",
    status: "active",
  },
  {
    name: "HealthPlus Medical",
    description:
      "Comprehensive healthcare services including hospitals, clinics, and telemedicine.",
    logo: "https://via.placeholder.com/150/FF69B4/FFFFFF?text=HealthPlus",
    website: "https://healthplusmedical.com",
    industry: "Healthcare",
    status: "active",
  },
  {
    name: "EduWorld Academy",
    description:
      "Online education platform offering courses from kindergarten to professional development.",
    logo: "https://via.placeholder.com/150/FFA500/000000?text=EduWorld",
    website: "https://eduworldacademy.com",
    industry: "Education",
    status: "inactive",
  },
  {
    name: "RetailMax",
    description:
      "Multi-channel retail company with both physical stores and e-commerce platforms.",
    logo: "https://via.placeholder.com/150/800080/FFFFFF?text=RetailMax",
    website: "https://retailmax.com",
    industry: "Retail",
    status: "active",
  },
  {
    name: "BuildRight Construction",
    description:
      "Commercial and residential construction company with focus on sustainable building practices.",
    logo: "https://via.placeholder.com/150/A52A2A/FFFFFF?text=BuildRight",
    website: "https://buildrightconstruction.com",
    industry: "Manufacturing",
    status: "archived",
  },
  {
    name: "MediaVision Studios",
    description:
      "Digital media production company specializing in video content and animation.",
    logo: "https://via.placeholder.com/150/FF1493/FFFFFF?text=MediaVision",
    website: "https://mediavisionstudios.com",
    industry: "Media",
    status: "active",
  },
  {
    name: "LogiTrack Systems",
    description:
      "Supply chain and logistics management software and consulting services.",
    logo: "https://via.placeholder.com/150/708090/FFFFFF?text=LogiTrack",
    website: "https://logitrack.com",
    industry: "Transportation",
    status: "active",
  },
];

// Team configurations per brand
const teamConfigs = [
  { name: "Engineering", description: "Software development team" },
  { name: "Product", description: "Product management team" },
  { name: "Operations", description: "Operations and support team" },
  { name: "Design", description: "Design and UX team" },
  { name: "Marketing", description: "Marketing and communications team" },
  { name: "Sales", description: "Sales and business development team" },
  { name: "Data Analytics", description: "Data analysis and insights team" },
  { name: "Quality Assurance", description: "QA and testing team" },
];

async function main() {
  console.log("🌱 Starting seed process...\n");

  try {
    // Get lookup table IDs
    const roles = await prisma.role.findMany();
    const positions = await prisma.position.findMany();
    const departments = await prisma.department.findMany();
    const statuses = await prisma.employeeStatusModel.findMany();
    const industries = await prisma.industry.findMany();

    const employeeRole = roles.find((r) => r.name === "employee");

    if (!employeeRole) {
      console.error(
        "❌ Required lookup data not found. Please run seed-lookup-tables.ts first.",
      );
      process.exit(1);
    }

    // Validate we have enough positions and departments
    if (positions.length === 0 || departments.length === 0) {
      console.error(
        "❌ No positions or departments found. Please run seed-lookup-tables.ts first.",
      );
      process.exit(1);
    }

    console.log(
      `✅ Found ${positions.length} positions and ${departments.length} departments in lookup tables`,
    );

    // Get the admin user
    const adminUser = await prisma.user.findFirst({
      where: {
        employeeProfile: {
          role: { name: "admin" },
        },
      },
    });

    if (!adminUser) {
      console.error(
        "❌ Admin user not found. Please run 'npx tsx scripts/seed-admin.ts' first.",
      );
      process.exit(1);
    }

    console.log(`✅ Admin user found: ${adminUser.username}`);

    // Generate 1000 dummy users with valid positions and departments
    const dummyUsers = generateDummyUsers(1000, positions, departments);

    console.log(`\n👥 Creating ${dummyUsers.length} dummy users...`);
    const createdUsers: {
      username: string;
      plainPassword: string;
      id: string;
    }[] = [];

    for (const userData of dummyUsers) {
      const username = userData.username;
      const password = generatePassword();
      const salt = generateSalt();
      const passwordHash = await hashPassword(password, salt);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUser) {
        console.log(`   ⏭️  User ${username} already exists, skipping...`);
        continue;
      }

      // Get status
      const status =
        statuses.find((s) => s.name === userData.status) || statuses[0];

      // Create user with valid position and department
      const user = await prisma.user.create({
        data: {
          username,
          passwordHash,
          salt,
          employeeProfile: {
            create: {
              firstName: userData.firstName,
              lastName: userData.lastName,
              roleId: employeeRole.id,
              middleName: userData.middleName,
              dateOfBirth: new Date(userData.dateOfBirth),
              contactNumber: userData.contactNumber,
              personalEmail: userData.personalEmail,
              address: userData.address,
              positionId: userData.positionId,
              departmentId: userData.departmentId,
              hireDate: new Date(userData.hireDate),
              statusId: status.id,
            },
          },
        },
      });

      createdUsers.push({ username, plainPassword: password, id: user.id });
      console.log(
        `   ✅ Created user: ${username} (${userData.position} - ${userData.department})`,
      );

      // ALWAYS create initial ACTIVE status record first (100% of employees)
      const activeStatus =
        statuses.find((s) => s.name === "active") || statuses[0];
      const terminatedStatus =
        statuses.find((s) => s.name === "terminated") || statuses[0];
      await prisma.employeeStatusHistory.create({
        data: {
          userId: user.id,
          statusId: activeStatus.id,
          effectiveDate: new Date(userData.hireDate),
          reason: "Initial hire date",
          notes: "System generated record from seeding",
          performedBy: adminUser.id,
          ipAddress: "127.0.0.1",
          userAgent: "Seed script",
        },
      });

      // Add additional status changes if user is not currently active
      if (userData.status !== "active") {
        const statusChangeDate = new Date(userData.hireDate);
        // Random date between 30-365 days after hire
        statusChangeDate.setDate(
          statusChangeDate.getDate() + Math.floor(Math.random() * 335) + 30,
        );

        await prisma.employeeStatusHistory.create({
          data: {
            userId: user.id,
            statusId: status.id,
            effectiveDate: statusChangeDate,
            reason: (() => {
              switch (userData.status) {
                case "probation":
                  return "New hire probationary period started";
                case "contract":
                  return "Contract employment initiated";
                case "on_leave":
                  return "Approved leave request";
                case "suspended":
                  return "Suspended pending disciplinary review";
                case "inactive":
                  return "Temporary leave of absence";
                case "resigned":
                  return "Voluntary resignation submitted";
                case "terminated":
                  return "Employment terminated";
                case "retired":
                  return "Official retirement from company";
                case "deceased":
                  return "Employee deceased - account maintained for records";
                default:
                  return "Account status updated";
              }
            })(),
            notes: "System generated record from seeding",
            performedBy: adminUser.id,
            ipAddress: "127.0.0.1",
            userAgent: "Seed script",
          },
        });
      }

      // Add random past termination history for 10% of currently active users
      if (userData.status === "active" && Math.random() < 0.1) {
        const terminationDate = new Date(userData.hireDate);
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
    }

    // Create 10 dummy brands
    console.log("\n🏢 Creating 10 dummy brands...");
    let brandsCreated = 0;
    const createdBrands = [];

    for (const brandData of dummyBrands) {
      // Check if brand already exists
      const existingBrand = await prisma.brand.findUnique({
        where: { name: brandData.name },
      });

      if (existingBrand) {
        console.log(
          `   ⏭️  Brand "${brandData.name}" already exists, skipping...`,
        );
        continue;
      }

      // Get industry ID
      const industry = industries.find((i) => i.name === brandData.industry);

      const brand = await prisma.brand.create({
        data: {
          name: brandData.name,
          description: brandData.description,
          logo: brandData.logo,
          website: brandData.website,
          industryId: industry?.id || null,
          status: brandData.status as "active" | "inactive" | "archived",
          createdBy: adminUser.id,
        },
      });

      createdBrands.push(brand);
      brandsCreated++;
      console.log(`   ✅ Created brand: ${brandData.name}`);
    }

    // Create teams for each brand - more teams to accommodate 1000 users
    console.log("\n👥 Creating teams and assigning members...");
    let teamsCreated = 0;
    let membersAssigned = 0;

    for (const brand of createdBrands) {
      // Create 6-8 teams per brand to accommodate 1000 users
      const numTeams = 6 + Math.floor(Math.random() * 3);
      const selectedConfigs = teamConfigs.slice(0, numTeams);

      for (const config of selectedConfigs) {
        // Check if team already exists for this brand
        const existingTeam = await prisma.team.findFirst({
          where: {
            name: `${config.name} - ${brand.name}`,
            brandId: brand.id,
          },
        });

        if (existingTeam) {
          console.log(
            `   ⏭️  Team "${config.name}" for ${brand.name} already exists, skipping...`,
          );
          continue;
        }

        // Create team
        const team = await prisma.team.create({
          data: {
            name: `${config.name} - ${brand.name}`,
            description: config.description,
            brandId: brand.id,
          },
        });

        teamsCreated++;
        console.log(`   ✅ Created team: ${team.name}`);

        // Assign 10-15 random members to the team (larger teams for 1000 users)
        const numMembers = 10 + Math.floor(Math.random() * 6);
        const shuffled = [...createdUsers].sort(() => Math.random() - 0.5);
        const selectedUsers = shuffled.slice(
          0,
          Math.min(numMembers, shuffled.length),
        );

        for (let i = 0; i < selectedUsers.length; i++) {
          const user = selectedUsers[i];
          const isLeader = i === 0; // First member is the team leader

          await prisma.teamMember.create({
            data: {
              teamId: team.id,
              userId: user.id,
              isLeader,
            },
          });

          membersAssigned++;
          console.log(
            `      ✅ Added ${user.username} as ${isLeader ? "Team Leader" : "Member"}`,
          );

          // Log team history for joining
          await prisma.teamHistory.create({
            data: {
              teamId: team.id,
              action: "joined",
              performedBy: adminUser.id,
              metadata: {
                userId: user.id,
                isLeader,
              },
            },
          });
        }
      }
    }

    console.log("\n📊 Summary:");
    console.log(`   - Users created: ${createdUsers.length}`);
    console.log(`   - Brands created: ${brandsCreated}`);
    console.log(`   - Teams created: ${teamsCreated}`);
    console.log(`   - Team members assigned: ${membersAssigned}`);

    if (createdUsers.length > 0) {
      console.log("\n🔐 User Credentials (first 10):");
      createdUsers.slice(0, 10).forEach((user) => {
        console.log(`   - ${user.username}: ${user.plainPassword}`);
      });
      console.log(`   ... and ${createdUsers.length - 10} more users`);
    }

    console.log("\n✅ Seed process completed successfully!");
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
