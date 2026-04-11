import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding infraction types and offenses...");

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

  // Create infraction types
  for (const type of infractionTypes) {
    await prisma.infractionType.upsert({
      where: {
        companyId_name: {
          companyId: 1,
          name: type.name,
        },
      },
      update: {},
      create: {
        ...type,
        companyId: 1,
      },
    });
  }

  console.log("Infraction types created.");

  // Get created types
  const attendanceType = await prisma.infractionType.findUnique({
    where: {
      companyId_name: {
        companyId: 1,
        name: "Attendance",
      },
    },
  });
  const conductType = await prisma.infractionType.findUnique({
    where: {
      companyId_name: {
        companyId: 1,
        name: "Conduct",
      },
    },
  });
  const performanceType = await prisma.infractionType.findUnique({
    where: {
      companyId_name: {
        companyId: 1,
        name: "Performance",
      },
    },
  });
  const policyType = await prisma.infractionType.findUnique({
    where: {
      companyId_name: {
        companyId: 1,
        name: "Policy Violation",
      },
    },
  });
  const safetyType = await prisma.infractionType.findUnique({
    where: {
      companyId_name: {
        companyId: 1,
        name: "Safety",
      },
    },
  });

  // Define offenses by type
  const offenses = [
    // Attendance offenses
    {
      name: "Tardiness",
      description: "Arriving late to work or meetings",
      severityLevel: 1, // Minor
      typeId: attendanceType!.id,
    },
    {
      name: "Absent Without Leave",
      description: "Missing work without prior approval",
      severityLevel: 2, // Major
      typeId: attendanceType!.id,
    },
    {
      name: "Early Departure",
      description: "Leaving work before scheduled end time without approval",
      severityLevel: 1, // Minor
      typeId: attendanceType!.id,
    },
    {
      name: "Excessive Absenteeism",
      description: "Repeated unexcused absences",
      severityLevel: 3, // Severe
      typeId: attendanceType!.id,
    },

    // Conduct offenses
    {
      name: "Insubordination",
      description: "Refusal to follow reasonable instructions from supervisors",
      severityLevel: 2, // Major
      typeId: conductType!.id,
    },
    {
      name: "Unprofessional Behavior",
      description: "Behavior that disrupts the workplace environment",
      severityLevel: 1, // Minor
      typeId: conductType!.id,
    },
    {
      name: "Harassment",
      description: "Any form of harassment towards colleagues",
      severityLevel: 3, // Severe
      typeId: conductType!.id,
    },
    {
      name: "Misuse of Company Resources",
      description: "Using company property for unauthorized purposes",
      severityLevel: 2, // Major
      typeId: conductType!.id,
    },

    // Performance offenses
    {
      name: "Failure to Meet Deadlines",
      description: "Consistently missing project deadlines",
      severityLevel: 1, // Minor
      typeId: performanceType!.id,
    },
    {
      name: "Poor Work Quality",
      description: "Work that does not meet established standards",
      severityLevel: 1, // Minor
      typeId: performanceType!.id,
    },
    {
      name: "Negligence of Duties",
      description: "Failure to perform assigned responsibilities",
      severityLevel: 2, // Major
      typeId: performanceType!.id,
    },

    // Policy Violation offenses
    {
      name: "Dress Code Violation",
      description: "Failure to adhere to company dress code policy",
      severityLevel: 1, // Minor
      typeId: policyType!.id,
    },
    {
      name: "Unauthorized Use of Equipment",
      description: "Using equipment without proper authorization",
      severityLevel: 2, // Major
      typeId: policyType!.id,
    },
    {
      name: "Confidentiality Breach",
      description: "Disclosing confidential company information",
      severityLevel: 3, // Severe
      typeId: policyType!.id,
    },

    // Safety offenses
    {
      name: "Failure to Follow Safety Procedures",
      description: "Not following established safety protocols",
      severityLevel: 2, // Major
      typeId: safetyType!.id,
    },
    {
      name: "Unsafe Work Practices",
      description: "Engaging in practices that endanger safety",
      severityLevel: 2, // Major
      typeId: safetyType!.id,
    },
    {
      name: "Tampering with Safety Equipment",
      description: "Interfering with safety devices or equipment",
      severityLevel: 3, // Severe
      typeId: safetyType!.id,
    },
  ];

  // Create offenses
  for (const offense of offenses) {
    await prisma.infractionOffense.create({
      data: {
        ...offense,
        companyId: 1,
      },
    });
  }

  console.log("Infraction offenses created.");
  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
