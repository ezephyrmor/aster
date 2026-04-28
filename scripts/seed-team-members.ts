/**
 * Seed script to create teams for existing brands and assign 100 users
 * Run with: npx tsx scripts/seed-team-members.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
  console.log("🌱 Starting team seeding process...\n");

  try {
    // Get the admin user
    const adminUser = await prisma.user.findFirst({
      where: {
        employeeProfile: {
          role: { name: "admin" },
        },
      },
    });

    if (!adminUser) {
      console.error("❌ Admin user not found.");
      process.exit(1);
    }

    // Get all brands
    const brands = await prisma.brand.findMany();
    console.log(`✅ Found ${brands.length} brands`);

    // Get admin role
    const adminRole = await prisma.role.findFirst({
      where: { name: "admin" },
    });

    // Get all users (excluding admin)
    const users = await prisma.user.findMany({
      where: {
        employeeProfile: {
          roleId: { not: adminRole?.id }, // Exclude admin role
        },
      },
      include: {
        teamMembers: true,
      },
    });

    console.log(`✅ Found ${users.length} users (excluding admin)`);

    // Filter users who are not in any team
    const unassignedUsers = users.filter((u) => u.teamMembers.length === 0);
    console.log(
      `✅ Found ${unassignedUsers.length} users without team assignment`,
    );

    let teamsCreated = 0;
    let membersAssigned = 0;

    // Create teams for each brand
    for (const brand of brands) {
      // Create 5-8 teams per brand
      const numTeams = 5 + Math.floor(Math.random() * 4);
      const selectedConfigs = teamConfigs.slice(0, numTeams);

      console.log(`\n📦 Creating teams for brand: ${brand.name}`);

      for (const config of selectedConfigs) {
        const teamName = `${config.name} - ${brand.name}`;

        // Check if team already exists
        const existingTeam = await prisma.team.findFirst({
          where: {
            name: teamName,
            brandId: brand.id,
          },
        });

        if (existingTeam) {
          console.log(`   ⏭️  Team "${config.name}" already exists`);
          continue;
        }

        // Create team
        const team = await prisma.team.create({
          data: {
            name: teamName,
            description: config.description,
            brandId: brand.id,
            companyId: brand.companyId,
          },
        });

        teamsCreated++;
        console.log(`   ✅ Created team: ${team.name}`);

        // Assign 4-8 random unassigned users to the team
        const numMembers = Math.min(
          4 + Math.floor(Math.random() * 5),
          unassignedUsers.length,
        );

        if (numMembers === 0) continue;

        // Shuffle and select users
        const shuffled = [...unassignedUsers].sort(() => Math.random() - 0.5);
        const selectedUsers = shuffled.slice(0, numMembers);

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

          // Remove from unassigned list
          const index = unassignedUsers.findIndex((u) => u.id === user.id);
          if (index !== -1) {
            unassignedUsers.splice(index, 1);
          }

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
    console.log(`   - Teams created: ${teamsCreated}`);
    console.log(`   - Team members assigned: ${membersAssigned}`);
    console.log(`   - Users still unassigned: ${unassignedUsers.length}`);

    if (unassignedUsers.length > 0) {
      console.log("\n📝 Unassigned users:");
      unassignedUsers.slice(0, 10).forEach((user) => {
        console.log(`   - ${user.username}`);
      });
      if (unassignedUsers.length > 10) {
        console.log(`   ... and ${unassignedUsers.length - 10} more`);
      }
    }

    console.log("\n✅ Team seeding process completed successfully!");
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
