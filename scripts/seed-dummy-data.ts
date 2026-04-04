/**
 * Seed script to create 10 dummy users and 10 dummy brands
 * Run with: npx tsx scripts/seed-dummy-data.ts
 */

import mysql from "mysql2/promise";
import { generateSalt, hashPassword } from "../src/lib/password";
import { generateUsername, generatePassword } from "../src/lib/userGenerator";

const DB_CONFIG = {
  host: "localhost",
  user: "root",
  password: "aster_root_password",
  database: "aster_db",
};

// Dummy data for users
const dummyUsers = [
  {
    firstName: "John",
    lastName: "Doe",
    middleName: "Michael",
    position: "Senior Software Engineer",
    department: "Engineering",
    role: "employee",
    dateOfBirth: "1990-05-15",
    hireDate: "2022-03-01",
    contactNumber: "+1-555-0101",
    personalEmail: "john.doe@email.com",
    address: "123 Main St, New York, NY 10001",
    emergencyContactName: "Jane Doe",
    emergencyContactNumber: "+1-555-0102",
    emergencyContactRelation: "Spouse",
    status: "active",
  },
  {
    firstName: "Sarah",
    lastName: "Johnson",
    middleName: "Elizabeth",
    position: "HR Manager",
    department: "Human Resources",
    role: "hr",
    dateOfBirth: "1988-08-22",
    hireDate: "2021-06-15",
    contactNumber: "+1-555-0201",
    personalEmail: "sarah.johnson@email.com",
    address: "456 Oak Ave, Los Angeles, CA 90001",
    emergencyContactName: "Mike Johnson",
    emergencyContactNumber: "+1-555-0202",
    emergencyContactRelation: "Brother",
    status: "active",
  },
  {
    firstName: "Michael",
    lastName: "Chen",
    middleName: "Wei",
    position: "Product Manager",
    department: "Product",
    role: "employee",
    dateOfBirth: "1992-11-03",
    hireDate: "2023-01-10",
    contactNumber: "+1-555-0301",
    personalEmail: "michael.chen@email.com",
    address: "789 Pine St, San Francisco, CA 94102",
    emergencyContactName: "Lisa Chen",
    emergencyContactNumber: "+1-555-0302",
    emergencyContactRelation: "Sister",
    status: "active",
  },
  {
    firstName: "Emily",
    lastName: "Williams",
    middleName: "Rose",
    position: "UX Designer",
    department: "Design",
    role: "employee",
    dateOfBirth: "1994-02-14",
    hireDate: "2022-09-20",
    contactNumber: "+1-555-0401",
    personalEmail: "emily.williams@email.com",
    address: "321 Elm St, Seattle, WA 98101",
    emergencyContactName: "David Williams",
    emergencyContactNumber: "+1-555-0402",
    emergencyContactRelation: "Father",
    status: "on_leave",
  },
  {
    firstName: "David",
    lastName: "Brown",
    middleName: "James",
    position: "DevOps Engineer",
    department: "Engineering",
    role: "employee",
    dateOfBirth: "1991-07-30",
    hireDate: "2021-11-05",
    contactNumber: "+1-555-0501",
    personalEmail: "david.brown@email.com",
    address: "654 Cedar Ln, Austin, TX 78701",
    emergencyContactName: "Mary Brown",
    emergencyContactNumber: "+1-555-0502",
    emergencyContactRelation: "Mother",
    status: "active",
  },
  {
    firstName: "Jessica",
    lastName: "Taylor",
    middleName: "Marie",
    position: "Marketing Director",
    department: "Marketing",
    role: "employee",
    dateOfBirth: "1989-04-18",
    hireDate: "2020-07-22",
    contactNumber: "+1-555-0601",
    personalEmail: "jessica.taylor@email.com",
    address: "987 Birch Rd, Chicago, IL 60601",
    emergencyContactName: "Chris Taylor",
    emergencyContactNumber: "+1-555-0602",
    emergencyContactRelation: "Spouse",
    status: "active",
  },
  {
    firstName: "Alex",
    lastName: "Martinez",
    middleName: "Jose",
    position: "Data Scientist",
    department: "Data Science",
    role: "employee",
    dateOfBirth: "1993-09-25",
    hireDate: "2023-04-01",
    contactNumber: "+1-555-0701",
    personalEmail: "alex.martinez@email.com",
    address: "147 Maple Dr, Boston, MA 02101",
    emergencyContactName: "Maria Martinez",
    emergencyContactNumber: "+1-555-0702",
    emergencyContactRelation: "Mother",
    status: "active",
  },
  {
    firstName: "Rachel",
    lastName: "Lee",
    middleName: "Anne",
    position: "Finance Analyst",
    department: "Finance",
    role: "employee",
    dateOfBirth: "1995-01-08",
    hireDate: "2022-02-14",
    contactNumber: "+1-555-0801",
    personalEmail: "rachel.lee@email.com",
    address: "258 Walnut St, Denver, CO 80201",
    emergencyContactName: "Kevin Lee",
    emergencyContactNumber: "+1-555-0802",
    emergencyContactRelation: "Brother",
    status: "terminated",
  },
  {
    firstName: "Thomas",
    lastName: "Anderson",
    middleName: "Edward",
    position: "QA Engineer",
    department: "Quality Assurance",
    role: "employee",
    dateOfBirth: "1990-12-12",
    hireDate: "2021-08-30",
    contactNumber: "+1-555-0901",
    personalEmail: "thomas.anderson@email.com",
    address: "369 Spruce Ave, Portland, OR 97201",
    emergencyContactName: "Nancy Anderson",
    emergencyContactNumber: "+1-555-0902",
    emergencyContactRelation: "Wife",
    status: "inactive",
  },
  {
    firstName: "Amanda",
    lastName: "White",
    middleName: "Grace",
    position: "Sales Manager",
    department: "Sales",
    role: "employee",
    dateOfBirth: "1987-06-20",
    hireDate: "2020-03-15",
    contactNumber: "+1-555-1001",
    personalEmail: "amanda.white@email.com",
    address: "741 Ash St, Miami, FL 33101",
    emergencyContactName: "Robert White",
    emergencyContactNumber: "+1-555-1002",
    emergencyContactRelation: "Father",
    status: "active",
  },
];

// Dummy data for brands
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
    industry: "Artificial Intelligence",
    status: "active",
  },
  {
    name: "GreenLeaf Organics",
    description:
      "Sustainable organic food production and distribution company.",
    logo: "https://via.placeholder.com/150/008000/FFFFFF?text=GreenLeaf",
    website: "https://greenleaforganics.com",
    industry: "Agriculture",
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
    industry: "Construction",
    status: "archived",
  },
  {
    name: "MediaVision Studios",
    description:
      "Digital media production company specializing in video content and animation.",
    logo: "https://via.placeholder.com/150/FF1493/FFFFFF?text=MediaVision",
    website: "https://mediavisionstudios.com",
    industry: "Media & Entertainment",
    status: "active",
  },
  {
    name: "LogiTrack Systems",
    description:
      "Supply chain and logistics management software and consulting services.",
    logo: "https://via.placeholder.com/150/708090/FFFFFF?text=LogiTrack",
    website: "https://logitrack.com",
    industry: "Logistics",
    status: "active",
  },
];

async function main() {
  console.log("🌱 Starting seed process...\n");

  const connection = await mysql.createConnection(DB_CONFIG);

  try {
    // Get the admin user
    const [adminRows] = await connection.execute(
      "SELECT id, username FROM users WHERE role = 'admin' LIMIT 1",
    );
    const adminUser =
      Array.isArray(adminRows) && adminRows.length > 0
        ? (adminRows[0] as any)
        : null;

    if (!adminUser) {
      console.error(
        "❌ Admin user not found. Please run 'npx tsx scripts/seed-admin.ts' first.",
      );
      process.exit(1);
    }

    console.log(`✅ Admin user found: ${adminUser.username}`);

    // Create 10 dummy users
    console.log("\n👥 Creating 10 dummy users...");
    const createdUsers = [];

    for (const userData of dummyUsers) {
      const username = generateUsername(userData.firstName, userData.lastName);
      const password = generatePassword();
      const salt = generateSalt();
      const passwordHash = await hashPassword(password, salt);

      // Check if user already exists
      const [existingRows] = await connection.execute(
        "SELECT id FROM users WHERE username = ?",
        [username],
      );

      if (Array.isArray(existingRows) && existingRows.length > 0) {
        console.log(`   ⏭️  User ${username} already exists, skipping...`);
        continue;
      }

      // Create user
      const [result] = await connection.execute(
        "INSERT INTO users (username, password_hash, salt, role) VALUES (?, ?, ?, ?)",
        [username, passwordHash, salt, userData.role],
      );

      const userId = (result as mysql.ResultSetHeader).insertId;

      // Create employee profile
      await connection.execute(
        `INSERT INTO employee_profiles 
         (user_id, first_name, last_name, middle_name, date_of_birth, contact_number, 
          personal_email, address, position, department, hire_date, 
          emergency_contact_name, emergency_contact_number, emergency_contact_relation, status,
          created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          userId,
          userData.firstName,
          userData.lastName,
          userData.middleName,
          new Date(userData.dateOfBirth),
          userData.contactNumber,
          userData.personalEmail,
          userData.address,
          userData.position,
          userData.department,
          new Date(userData.hireDate),
          userData.emergencyContactName,
          userData.emergencyContactNumber,
          userData.emergencyContactRelation,
          userData.status,
        ],
      );

      createdUsers.push({ username, plainPassword: password });
      console.log(`   ✅ Created user: ${username} (Password: ${password})`);
    }

    // Create 10 dummy brands
    console.log("\n🏢 Creating 10 dummy brands...");
    let brandsCreated = 0;

    for (const brandData of dummyBrands) {
      // Check if brand already exists
      const [existingRows] = await connection.execute(
        "SELECT id FROM brands WHERE name = ?",
        [brandData.name],
      );

      if (Array.isArray(existingRows) && existingRows.length > 0) {
        console.log(
          `   ⏭️  Brand "${brandData.name}" already exists, skipping...`,
        );
        continue;
      }

      await connection.execute(
        `INSERT INTO brands 
         (name, description, logo, website, industry, status, created_by, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          brandData.name,
          brandData.description,
          brandData.logo,
          brandData.website,
          brandData.industry,
          brandData.status,
          adminUser.id,
        ],
      );

      brandsCreated++;
      console.log(`   ✅ Created brand: ${brandData.name}`);
    }

    console.log("\n📊 Summary:");
    console.log(`   - Users created: ${createdUsers.length}`);
    console.log(`   - Brands created: ${brandsCreated}`);

    if (createdUsers.length > 0) {
      console.log("\n🔐 User Credentials:");
      createdUsers.forEach((user) => {
        console.log(`   - ${user.username}: ${user.plainPassword}`);
      });
    }

    console.log("\n✅ Seed process completed successfully!");
  } finally {
    await connection.end();
  }
}

main().catch((e) => {
  console.error("❌ Error during seed process:", e);
  process.exit(1);
});
