# Database Seeding Guide

This guide explains how to seed the database with comprehensive test data.

## Overview

The seeding process creates a complete dataset including:

- **100 employees** with random personal data (hire dates from Dec 2024 - present)
- **Work schedules** for ~80% of employees
- **Attendance records** based on schedules (last 30 days)
- **15 brands** with assigned managers
- **20 teams** with 3-6 members each
- **Team history** (removals, promotions)
- **Brand manager history** (assignments, removals with comments)
- **Leave requests** (2-3 per employee)
- **Infractions** (~60% of employees have 1-3 infractions)

## Quick Start

### Full Reset and Seed (Recommended for Fresh Start)

```bash
# This will reset the database and seed all data
npm run db:reset
```

### Step-by-Step Seeding

```bash
# 1. Seed lookup tables (roles, positions, departments, statuses, industries)
npm run db:seed:lookup

# 2. Create admin and HR users
npm run db:seed:admin

# 3. Seed infraction lookup data (types and offenses)
npm run db:seed:infractions

# 4. Seed leave lookup data (types and statuses)
npm run db:seed:leaves

# 5. Seed all comprehensive data (employees, schedules, attendance, brands, teams, leaves, infractions)
npm run db:seed:all-data
```

## Configuration

You can customize the seeding via environment variables:

```bash
# Custom counts (defaults: 100 employees, 15 brands, 20 teams)
EMPLOYEE_COUNT=200 BRAND_COUNT=20 TEAM_COUNT=30 npm run db:seed:all-data

# Or create a .env file with:
# EMPLOYEE_COUNT=200
# BRAND_COUNT=20
# TEAM_COUNT=30
```

## Data Distribution

### Employees

- **Status Distribution**: 75% active, 10% on leave, 10% inactive, 5% terminated
- **Hire Dates**: Random between December 2024 and present
- **End Dates**: 15% of employees have end dates (terminated)

### Schedules

- **Coverage**: ~80% of employees have schedules
- **Work Days**: Monday to Friday
- **Templates**: 5 different shift patterns (8-5, 9-6, 10-7, 7-4, 8:30-5:30)

### Attendance

- **Time Range**: Last 30 days or since hire date
- **Status Distribution**: 50% present, 20% late, 10% absent, 10% undertime, 10% on leave
- **Late Minutes**: 10% of present employees are late (5-30 minutes)
- **Undertime**: 5% of present employees leave early (15-60 minutes)

### Teams

- **Size**: 3-6 members per team
- **Leaders**: 70% of teams have a designated leader
- **History**: 10% of members get removed, 5% get promoted to leader

### Infractions

- **Coverage**: 60% of employees have infractions
- **Count**: 1-3 infractions per affected employee
- **Acknowledgment**: 60% of infractions are acknowledged

## Sample Credentials

After seeding, the script will display sample user credentials:

```
🔐 Sample User Credentials (first 5):
   - john.smith: abc123xyz
   - mary.johnson: def456uvw
   ...
```

**Admin Credentials** (from seed-admin.ts):

- Username: `admin`
- Password: `password123`

## Troubleshooting

### Unique Constraint Errors

If you see errors like `Unique constraint failed on the constraint: brands_name_key`, it means the database already has data. Run a reset first:

```bash
npm run db:reset
```

### Missing Lookup Data

If you see errors about missing roles or positions, run the lookup seed first:

```bash
npm run db:seed:lookup
npm run db:seed:admin
npm run db:seed:all-data
```

### Database Connection Issues

Make sure your `.env` file has the correct `DATABASE_URL`:

```env
DATABASE_URL="mysql://user:password@localhost:3306/database_name"
```

## Legacy Scripts

The following scripts are kept for backward compatibility but are replaced by `seed-all-data.ts`:

- `seed-dummy-data.ts` - Old employee/brand/team seeder (1000 users)
- `seed-team-members.ts` - Standalone team member seeder

## Best Practices

1. **Always reset before seeding** for a clean database state
2. **Run lookup seeds first** if doing step-by-step seeding
3. **Check the summary** at the end of seeding to verify data was created
4. **Save sample credentials** displayed at the end for testing

## Data Integrity

The seeding script uses:

- **Batch processing** with Prisma transactions for data integrity
- **Error recovery** - continues on non-critical errors
- **Progress logging** - shows real-time progress with progress bars
- **Type safety** - full TypeScript support with proper types
