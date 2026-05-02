/**
 * Main Seeding Runner
 * Runs all seed phases in correct dependency order
 */

import seedCoreSystem from "./01-core-system";
import seedOrganization from "./02-organization";

async function runAllSeeds() {
  console.log("🌱 Starting Full System Seeding\n");
  console.log("====================================\n");

  try {
    // Run phases in dependency order
    await seedCoreSystem();
    console.log("\n------------------------------------\n");
    await seedOrganization();

    console.log("\n====================================");
    console.log("✅ ALL SEED PHASES COMPLETED SUCCESSFULLY!");
    console.log("\nSystem is now fully initialized.");
    console.log("\nDefault login:");
    console.log("  Username: admin");
    console.log("  Password: admin123");
  } catch (error) {
    console.error("\n❌ Seeding failed during execution:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  runAllSeeds();
}

export default runAllSeeds;
