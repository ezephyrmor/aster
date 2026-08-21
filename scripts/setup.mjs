#!/usr/bin/env node
/**
 * ASTER HR - One-Time Local Setup Wizard
 * ======================================
 * A friendly, step-by-step guide that takes care of everything a new
 * developer needs to get this project running on a fresh machine:
 *
 *   Step 1.  Welcome & overview
 *   Step 2.  Check your toolbox (node, npm, docker)
 *   Step 3.  Create your .env from sample.env
 *   Step 4.  Install project dependencies
 *   Step 5.  Start the local PostgreSQL database (Docker)
 *   Step 6.  Generate the Prisma client
 *   Step 7.  Run the database migrations
 *   Step 8.  Seed the database with starter data
 *   Step 9.  What to do next (and your default login)
 *
 * Run it with:  npm run setup
 *
 * It is completely safe to run more than once. If a step is already done,
 * it is skipped with a friendly note instead of failing.
 */

import { execSync } from "node:child_process";
import { existsSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------- helpers

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");

/** Run a shell command, streaming its output live to the console. */
function run(command, { cwd = REPO_ROOT, label = "" } = {}) {
  console.log(`\n   ▶ ${label || command}`);
  console.log(`   ─${"─".repeat(Math.max(20, (label || command).length))}`);
  try {
    execSync(command, { cwd, stdio: "pipe" });
    console.log("");
  } catch {
    console.log("");
    console.log(`   ❌ The step "${label || command}" failed.`);
    console.log("      Fix the problem above and re-run:  npm run setup");
    console.log("");
    process.exit(1);
  }
}

/** Run a shell command and return its trimmed output (no console echo). */
function peek(command) {
  try {
    return execSync(command, { cwd: REPO_ROOT })
      .toString()
      .trim();
  } catch {
    return "";
  }
}

function stepBadge(n, title) {
  console.log("");
  console.log("  ┌" + "─".repeat(58) + "┐");
  console.log(`  │  STEP ${n}  ${title.padEnd(49, " ")} │`);
  console.log("  └" + "─".repeat(58) + "┘");
}

function info(msg) {
  console.log(`     ${msg}`);
}

function done() {
  console.log("     ✅ done.");
}

function skip(reason) {
  console.log(`     ⏭  already set up (${reason}). Moving on!`);
}

function warn(msg) {
  console.log("");
  console.log(`   ⚠️  ${msg}`);
}

function toolMissing(names) {
  console.log("");
  console.log("   ❌ The following required tool(s) are missing from your PATH:");
  names.forEach((n) => console.log(`       - ${n}`));
  console.log("");
  console.log("   Please install it and re-run npm run setup.");
  console.log("");
  process.exit(1);
}

function fatal(msg, hint) {
  console.log("");
  console.log(`   ❌ ${msg}`);
  if (hint) console.log(`   ${hint}`);
  console.log("");
  process.exit(1);
}

/** Pause the script briefly (helper so top-level await reads cleanly). */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
// ------------------------------------------------------------------ steps

function step1_welcome() {
  stepBadge(1, "Welcome");
  console.log("");
  console.log("   👋 Hi there! This wizard will get the Aster HR system running");
  console.log("   on your machine from scratch. It's guided and step-by-step,");
  console.log("   and safe to re-run — already-finished steps are skipped.");
  console.log("   If a step needs something from you, it will pause and tell");
  console.log("   you exactly what to do.");
}

function step2_check_toolbox() {
  stepBadge(2, "Check your toolbox");
  info("Making sure node, npm and Docker are available before we begin…");

  const missing = [];
  if (!peek("node --version")) missing.push("node");
  if (!peek("npm --version")) missing.push("npm");
  if (!peek("docker --version")) missing.push("docker");

  if (missing.length > 0) {
    return toolMissing(missing);
  }

  // Docker is installed, but confirm the daemon is actually reachable.
  // This is the #1 gotcha for a developer who installed Docker but never
  // opened Docker Desktop / started the service.
  if (!peek("docker info")) {
    console.log("");
    console.log("   ❌ Docker is installed, but the Docker daemon isn't running.");
    console.log("      Please start Docker Desktop (or the Docker service), wait");
    console.log("      for it to finish starting up, then re-run:  npm run setup");
    console.log("");
    process.exit(1);
  }

  const nodeVer = peek("node --version").split("\n")[0];
  const npmVer = peek("npm --version").split("\n")[0];
  const dVer = peek("docker --version").split("\n")[0];
  info(`✓ node   → ${nodeVer}`);
  info(`✓ npm    → ${npmVer}`);
  info(`✓ docker → ${dVer}`);
  done();
}

function step3_create_env() {
  stepBadge(3, "Create your .env");
  console.log("");
  info("The project reads its database connection and secrets from a .env file.");
  info("That file is private (git-ignored), so we copy it from sample.env.");

  const envPath = join(REPO_ROOT, ".env");
  const samplePath = join(REPO_ROOT, "sample.env");
  if (!existsSync(envPath)) {
    if (existsSync(samplePath)) {
      copyFileSync(samplePath, envPath);
      info("✓ Created .env from sample.env (with safe local defaults).");
    } else {
      fatal(
        "sample.env was not found. Run npm run setup from the project root.",
        "Create a sample.env yourself or restore it from version control.",
      );
    }
    done();
  } else {
    skip(".env already exists");
  }
}

function step4_install_deps() {
  stepBadge(4, "Install dependencies");
  info("Fetching the exact packages this project needs (via package.json).");
  if (!existsSync(join(REPO_ROOT, "node_modules"))) {
    run("npm install", { label: "Installing dependencies…" });
    done();
  } else {
    skip("node_modules folder already exists");
  }
}
async function step5_start_docker() {
  stepBadge(5, "Start the database (Docker)");
  const container = "aster-postgres";
  console.log("");
  info("   We look for the local PostgreSQL container from docker-compose.yml,");
  info("   then make sure it's actually up and accepting connections.");

  const healthy = peek(
    `docker exec ${container} pg_isready -U aster -d aster 2>/dev/null`,
  );
  if (healthy.includes("accepting connections")) {
    skip(`${container} is already running & healthy`);
    return;
  }

  run("docker compose up -d", { label: "Starting the database container…" });
  console.log("     Waiting for PostgreSQL to become ready…");

  const deadline = Date.now() + 40_000;
  while (Date.now() < deadline) {
    const state = peek(
      `docker exec ${container} pg_isready -U aster -d aster 2>/dev/null`,
    );
    if (state.includes("accepting connections")) {
      info("✓ PostgreSQL is up and accepting connections.");
      done();
      return;
    }
    console.log("       …still starting, giving it a moment");
    await sleep(2000);
  }

  fatal(
    "The container was created but PostgreSQL didn't become ready in time.",
    "Check the logs with:  docker logs " + container,
  );
}

function step6_generate_prisma() {
  stepBadge(6, "Generate the Prisma client");
  console.log("");
  info("   We generate the Prisma client from schema.prisma");
  info("   so the app has correctly typed database helpers.");

  // npm install already runs `prisma generate` (postinstall hook), which
  // populates node_modules/.prisma/client. If it's there, we can skip.
  if (
    existsSync(join(REPO_ROOT, "node_modules", ".prisma", "client")) &&
    peek("ls node_modules/.prisma/client/index.js").length > 0
  ) {
    skip("Prisma client was already generated during npm install");
    return;
  }

  run("npx prisma generate", { label: "Generating Prisma client…" });
  done();
}

function step7_migrate() {
  stepBadge(7, "Run database migrations");
  console.log("");
  info("   We run migrations so the database schema matches schema.prisma,");
  info("   creating all the tables the app needs.");
  run("npx prisma migrate dev", { label: "Running migrations…" });
  done();
}

function step8_seed() {
  stepBadge(8, "Seed the database");
  console.log("");
  info("   Now we'll seed starter data:");
  info("   • a default company with system roles");
  info("   • employee statuses, leave types, leave statuses");
  info("   • core navigation templates with permissions");
  info("   • a default admin user");
  console.log("");

  // If the users table already has rows, seeding clearly ran before.
  const container = "aster-postgres";
  const count = peek(
    `docker exec ${container} psql -U aster -d aster -tAc "select count(*) from users" 2>/dev/null`,
  );
  if (count !== "" && count !== "0") {
    skip("users already exist in the database");
    return;
  }

  run("npm run db:seed:all", { label: "Seeding the database…" });
  done();
}

function step9_next_steps() {
  stepBadge(9, "You're almost there!");
  console.log("");
  console.log("   ✅ Setup complete! The database is ready to use.");
  console.log("");
  console.log("   ▶  Start the app:");
  console.log("       npm run dev");
  console.log("      (then visit http://localhost:3000)");
  console.log("");
  console.log("   ▶  Open Prisma Studio (visual database browser):");
  console.log("       npm run db:studio");
  console.log("");
  console.log("   ▶  Wipe and re-seed the database anytime:");
  console.log("       npm run db:reset");
  console.log("");
  console.log("   🔑  Default login:");
  console.log("       Username: admin");
  console.log("       Password: admin123");
  console.log("");
  console.log("   ⚠️  Security: in production, change the default password and");
  console.log("       set strong NEXTAUTH_SECRET / PASSWORD_PEPPER values.");
  console.log("");
}

// ------------------------------------------------------------------- main

async function main() {
  console.log("==============================================================");
  console.log("  ⭐ ASTER HR SYSTEM ⭐");
  console.log("  Local Setup Wizard");
  console.log("==============================================================");

  step1_welcome();
  step2_check_toolbox();
  step3_create_env();
  step4_install_deps();
  await step5_start_docker();
  step6_generate_prisma();
  step7_migrate();
  step8_seed();
  step9_next_steps();

  console.log("==============================================================");
  console.log("  Finished! Have a great day. 🚀");
  console.log("==============================================================");
  console.log("");
}

await main();