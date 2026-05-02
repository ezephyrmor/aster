/**
 * Seed work schedules for all existing users
 * Run with: npx tsx scripts/seed-schedules.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const scheduleTemplates = [
  { start: "09:00", end: "18:00", break: 60 },
  { start: "08:00", end: "17:00", break: 60 },
  { start: "10:00", end: "19:00", break: 60 },
  { start: "07:00", end: "16:00", break: 30 },
  { start: "08:30", end: "17:30", break: 60 },
];

const workDays = [1, 2, 3, 4, 5];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

async function main() {
  console.log("🌱 Seeding work schedules...\n");

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        companyId: true,
        employeeProfile: {
          select: { hireDate: true },
        },
      },
    });

    console.log(`Found ${users.length} users`);

    let schedulesCreated = 0;

    for (const user of users) {
      if (Math.random() < 0.2) continue;

      const template = getRandomItem(scheduleTemplates);
      const effectiveFrom = getRandomDate(
        new Date(user.employeeProfile?.hireDate || new Date()),
        new Date(),
      );

      try {
        for (const dayOfWeek of workDays) {
          await prisma.workSchedule.create({
            data: {
              userId: user.id,
              companyId: user.companyId,
              dayOfWeek,
              startTime: template.start,
              endTime: template.end,
              breakMinutes: template.break,
              effectiveFrom,
            },
          });
        }
        schedulesCreated++;
      } catch (error) {
        // Skip duplicates
      }

      if (schedulesCreated % 10 === 0) {
        process.stdout.write(
          `\r   Created schedules for ${schedulesCreated} users`,
        );
      }
    }

    console.log(`\n✅ Created schedules for ${schedulesCreated} users`);
  } catch (error) {
    console.error("❌ Error seeding schedules:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
