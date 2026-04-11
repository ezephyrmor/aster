import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding leave types and statuses...");

  // Seed Leave Types
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
          companyId: 1,
          name: leaveType.name,
        },
      },
      update: leaveType,
      create: {
        ...leaveType,
        companyId: 1,
      },
    });
  }

  console.log(`✅ Seeded ${leaveTypes.length} leave types`);

  // Seed Leave Statuses
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
          companyId: 1,
          name: status.name,
        },
      },
      update: status,
      create: {
        ...status,
        companyId: 1,
      },
    });
  }

  console.log(`✅ Seeded ${leaveStatuses.length} leave statuses`);

  // Seed Leave Credits for existing employees
  console.log("\n📅 Generating leave credits for existing employees...");

  const users = await prisma.user.findMany({
    include: {
      employeeProfile: true,
    },
  });

  let totalCreditsGenerated = 0;
  const now = new Date();

  for (const user of users) {
    // Determine the start date for credit generation
    const hireDate = user.employeeProfile?.hireDate || user.createdAt;
    const startDate = new Date(hireDate);
    startDate.setDate(1); // Start from the first day of the hire month

    // Generate credits from hire date to current month
    let creditDate = new Date(startDate);

    while (creditDate <= now) {
      // Check if credit already exists for this month
      const existingCredit = await prisma.leaveCredit.findFirst({
        where: {
          userId: user.id,
          earnedDate: {
            gte: new Date(creditDate.getFullYear(), creditDate.getMonth(), 1),
            lt: new Date(
              creditDate.getFullYear(),
              creditDate.getMonth() + 1,
              1,
            ),
          },
        },
      });

      if (!existingCredit) {
        await prisma.leaveCredit.create({
          data: {
            userId: user.id,
            earnedDate: new Date(
              creditDate.getFullYear(),
              creditDate.getMonth(),
              1,
            ),
          },
        });
        totalCreditsGenerated++;
      }

      // Move to next month
      creditDate.setMonth(creditDate.getMonth() + 1);
    }
  }

  console.log(
    `✅ Generated ${totalCreditsGenerated} leave credits for ${users.length} employees`,
  );

  console.log("\n✅ Leave management seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding leave data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
