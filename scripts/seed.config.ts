/**
 * Seed Configuration
 * Central configuration for all database seeding scripts
 *
 * This file contains all seeding defaults and validation.
 * You can override any value by creating a `seed.config.json` file in this directory.
 * Environment variables will take precedence over values from json file.
 * Environment variables have highest priority, then json file, then defaults.
 */

import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Load environment variables
dotenv.config();

// Helper to safely parse boolean from env
function parseEnvBool(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === "true" || value === "1";
}

// Helper to safely parse number from env
function parseEnvNumber(
  key: string,
  defaultValue: number,
  min?: number,
  max?: number,
): number {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) return defaultValue;
  if (min !== undefined && parsed < min) return min;
  if (max !== undefined && parsed > max) return max;
  return parsed;
}

// Helper to safely parse float from env
function parseEnvFloat(
  key: string,
  defaultValue: number,
  min?: number,
  max?: number,
): number {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseFloat(value);
  if (isNaN(parsed)) return defaultValue;
  if (min !== undefined && parsed < min) return min;
  if (max !== undefined && parsed > max) return max;
  return parsed;
}

// Load optional json config file
const jsonConfigPath = path.join(__dirname, "seed.config.json");
let jsonConfig: Record<string, any> = {};
if (fs.existsSync(jsonConfigPath)) {
  try {
    const fileContent = fs.readFileSync(jsonConfigPath, "utf-8");
    jsonConfig = JSON.parse(fileContent);
    console.log(`✅ Loaded seed configuration from seed.config.json`);
  } catch (error) {
    console.warn(`⚠️  Failed to load seed.config.json, using defaults`);
  }
}

// Helper to get value with priority: env > json config > default
function getValue(
  key: string,
  defaultValue: any,
  parser: (key: string, defaultValue: any) => any,
) {
  if (process.env[key] !== undefined) {
    return parser(key, defaultValue);
  }
  if (jsonConfig[key] !== undefined) {
    return jsonConfig[key];
  }
  return defaultValue;
}

export const SEED_CONFIG = {
  // Counts
  employeeCount: getValue("SEED_EMPLOYEE_COUNT", 20, parseEnvNumber),
  brandCount: getValue("SEED_BRAND_COUNT", 5, parseEnvNumber),
  teamCount: getValue("SEED_TEAM_COUNT", 5, parseEnvNumber),

  // Employee distribution
  employeeStatusActive: getValue(
    "SEED_EMPLOYEE_STATUS_ACTIVE",
    0.75,
    parseEnvFloat,
  ),
  employeeStatusOnLeave: getValue(
    "SEED_EMPLOYEE_STATUS_ON_LEAVE",
    0.1,
    parseEnvFloat,
  ),
  employeeStatusInactive: getValue(
    "SEED_EMPLOYEE_STATUS_INACTIVE",
    0.1,
    parseEnvFloat,
  ),
  employeeStatusTerminated: getValue(
    "SEED_EMPLOYEE_STATUS_TERMINATED",
    0.05,
    parseEnvFloat,
  ),

  // Schedules
  scheduleCoveragePercent: getValue(
    "SEED_SCHEDULE_COVERAGE",
    0.8,
    parseEnvFloat,
  ),

  // Attendance
  attendanceDaysBack: getValue("SEED_ATTENDANCE_DAYS_BACK", 30, parseEnvNumber),
  attendancePresentPercent: getValue(
    "SEED_ATTENDANCE_PRESENT",
    0.5,
    parseEnvFloat,
  ),
  attendanceLatePercent: getValue("SEED_ATTENDANCE_LATE", 0.2, parseEnvFloat),
  attendanceAbsentPercent: getValue(
    "SEED_ATTENDANCE_ABSENT",
    0.1,
    parseEnvFloat,
  ),
  attendanceUndertimePercent: getValue(
    "SEED_ATTENDANCE_UNDERTIME",
    0.1,
    parseEnvFloat,
  ),
  attendanceOnLeavePercent: getValue(
    "SEED_ATTENDANCE_ON_LEAVE",
    0.1,
    parseEnvFloat,
  ),

  // Teams
  teamMinMembers: getValue("SEED_TEAM_MIN_MEMBERS", 1, parseEnvNumber),
  teamMaxMembers: getValue("SEED_TEAM_MAX_MEMBERS", 4, parseEnvNumber),
  teamWithLeaderPercent: getValue("SEED_TEAM_WITH_LEADER", 0.7, parseEnvFloat),

  // Leaves
  leaveRequestsPerEmployeeMin: getValue(
    "SEED_LEAVE_REQUESTS_MIN",
    2,
    parseEnvNumber,
  ),
  leaveRequestsPerEmployeeMax: getValue(
    "SEED_LEAVE_REQUESTS_MAX",
    3,
    parseEnvNumber,
  ),

  // Infractions
  infractionCoveragePercent: getValue(
    "SEED_INFRACTION_COVERAGE",
    0.6,
    parseEnvFloat,
  ),
  infractionPerEmployeeMin: getValue(
    "SEED_INFRACTION_PER_EMPLOYEE_MIN",
    1,
    parseEnvNumber,
  ),
  infractionPerEmployeeMax: getValue(
    "SEED_INFRACTION_PER_EMPLOYEE_MAX",
    3,
    parseEnvNumber,
  ),
  infractionAcknowledgedPercent: getValue(
    "SEED_INFRACTION_ACKNOWLEDGED",
    0.6,
    parseEnvFloat,
  ),

  // Multi company
  companyCount: getValue("SEED_COMPANY_COUNT", 2, parseEnvNumber),
  employeeCountPerCompany: getValue(
    "SEED_EMPLOYEE_COUNT_PER_COMPANY",
    15,
    parseEnvNumber,
  ),

  // Leave Credits
  leaveCreditDaysDefault: getValue(
    "SEED_LEAVE_CREDIT_DAYS_DEFAULT",
    2,
    parseEnvNumber,
  ),
  leaveCreditMultiplier: getValue(
    "SEED_LEAVE_CREDIT_MULTIPLIER",
    1.0,
    parseEnvFloat,
  ),

  // Calendar Events
  calendarEventsPerCompany: getValue(
    "SEED_CALENDAR_EVENTS_PER_COMPANY",
    30,
    parseEnvNumber,
  ),
  calendarEventsDaysForward: getValue(
    "SEED_CALENDAR_EVENTS_DAYS_FORWARD",
    90,
    parseEnvNumber,
  ),
  calendarEventsDaysBack: getValue(
    "SEED_CALENDAR_EVENTS_DAYS_BACK",
    30,
    parseEnvNumber,
  ),

  // Module flags
  createAttendance: getValue("SEED_CREATE_ATTENDANCE", true, parseEnvBool),
  createSchedules: getValue("SEED_CREATE_SCHEDULES", true, parseEnvBool),
  createTeams: getValue("SEED_CREATE_TEAMS", true, parseEnvBool),
  createLeaves: getValue("SEED_CREATE_LEAVES", true, parseEnvBool),
  createInfractions: getValue("SEED_CREATE_INFRACTIONS", true, parseEnvBool),
  createBrands: getValue("SEED_CREATE_BRANDS", true, parseEnvBool),
  createCalendarEvents: getValue(
    "SEED_CREATE_CALENDAR_EVENTS",
    true,
    parseEnvBool,
  ),
} as const;

// Type definition for config
export type SeedConfig = typeof SEED_CONFIG;

export default SEED_CONFIG;
