import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding infraction types and offenses...");

  // Get all existing companies
  const companies = await prisma.company.findMany();
  console.log(`   Found ${companies.length} companies`);

  // Define infraction types
  const infractionTypes = [
    {
      name: "Attendance",
      description: "Related to time and presence issues",
      color: "orange",
    },
    {
      name: "Conduct",
      description: "Related to behavior and workplace conduct",
      color: "red",
    },
    {
      name: "Performance",
      description: "Related to work quality and productivity",
      color: "yellow",
    },
    {
      name: "Policy Violation",
      description: "Related to company policy breaches",
      color: "purple",
    },
    {
      name: "Safety",
      description: "Related to safety protocol violations",
      color: "red",
    },
  ];

  // Seed for each company
  for (const company of companies) {
    console.log(`\n🌱 Seeding infractions for ${company.name}...`);

    // Create infraction types for this company
    const createdTypes: Record<string, string> = {};
    for (const type of infractionTypes) {
      const result = await prisma.infractionType.upsert({
        where: {
          companyId_name: {
            companyId: company.id,
            name: type.name,
          },
        },
        update: {},
        create: {
          ...type,
          companyId: company.id,
        },
      });
      createdTypes[type.name] = result.id;
    }
    console.log(`   ✅ Created ${infractionTypes.length} infraction types`);

    // Define offenses by type
    const offenses = [
      // Attendance offenses
      {
        name: "Tardiness",
        description: "Arriving late to work or meetings",
        severityLevel: 1, // Minor
        typeId: createdTypes["Attendance"],
      },
      {
        name: "Absent Without Leave",
        description: "Missing work without prior approval",
        severityLevel: 2, // Major
        typeId: createdTypes["Attendance"],
      },
      {
        name: "Early Departure",
        description: "Leaving work before scheduled end time without approval",
        severityLevel: 1, // Minor
        typeId: createdTypes["Attendance"],
      },
      {
        name: "Excessive Absenteeism",
        description: "Repeated unexcused absences",
        severityLevel: 3, // Severe
        typeId: createdTypes["Attendance"],
      },

      // Conduct offenses
      {
        name: "Insubordination",
        description:
          "Refusal to follow reasonable instructions from supervisors",
        severityLevel: 2, // Major
        typeId: createdTypes["Conduct"],
      },
      {
        name: "Unprofessional Behavior",
        description: "Behavior that disrupts the workplace environment",
        severityLevel: 1, // Minor
        typeId: createdTypes["Conduct"],
      },
      {
        name: "Harassment",
        description: "Any form of harassment towards colleagues",
        severityLevel: 3, // Severe
        typeId: createdTypes["Conduct"],
      },
      {
        name: "Misuse of Company Resources",
        description: "Using company property for unauthorized purposes",
        severityLevel: 2, // Major
        typeId: createdTypes["Conduct"],
      },

      // Performance offenses
      {
        name: "Failure to Meet Deadlines",
        description: "Consistently missing project deadlines",
        severityLevel: 1, // Minor
        typeId: createdTypes["Performance"],
      },
      {
        name: "Poor Work Quality",
        description: "Work that does not meet established standards",
        severityLevel: 1, // Minor
        typeId: createdTypes["Performance"],
      },
      {
        name: "Negligence of Duties",
        description: "Failure to perform assigned responsibilities",
        severityLevel: 2, // Major
        typeId: createdTypes["Performance"],
      },

      // Policy Violation offenses
      {
        name: "Dress Code Violation",
        description: "Failure to adhere to company dress code policy",
        severityLevel: 1, // Minor
        typeId: createdTypes["Policy Violation"],
      },
      {
        name: "Unauthorized Use of Equipment",
        description: "Using equipment without proper authorization",
        severityLevel: 2, // Major
        typeId: createdTypes["Policy Violation"],
      },
      {
        name: "Confidentiality Breach",
        description: "Disclosing confidential company information",
        severityLevel: 3, // Severe
        typeId: createdTypes["Policy Violation"],
      },

      // Safety offenses
      {
        name: "Failure to Follow Safety Procedures",
        description: "Not following established safety protocols",
        severityLevel: 2, // Major
        typeId: createdTypes["Safety"],
      },
      {
        name: "Unsafe Work Practices",
        description: "Engaging in practices that endanger safety",
        severityLevel: 2, // Major
        typeId: createdTypes["Safety"],
      },
      {
        name: "Tampering with Safety Equipment",
        description: "Interfering with safety devices or equipment",
        severityLevel: 3, // Severe
        typeId: createdTypes["Safety"],
      },
    ];

    // Create offenses for this company
    for (const offense of offenses) {
      await prisma.infractionOffense.upsert({
        where: {
          companyId_name: {
            companyId: company.id,
            name: offense.name,
          },
        },
        update: {},
        create: {
          ...offense,
          companyId: company.id,
        },
      });
    }
    console.log(`   ✅ Created ${offenses.length} infraction offenses`);
  }

  console.log("\n✅ Infraction seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
