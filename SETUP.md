# Aster Login System - Setup Guide

## Prerequisites

- Node.js 18+ installed
- MySQL server running
- npm or pnpm package manager

## 1. Database Setup

### Create MySQL Database

```sql
CREATE DATABASE aster_db;
```

### Configure Database Connection

Update the `.env` file with your MySQL credentials:

```env
DATABASE_URL="mysql://username:password@localhost:3306/aster_db"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

Replace:

- `username` with your MySQL username
- `password` with your MySQL password
- `your-secret-key-here-change-in-production` with a secure random string (generate with: `openssl rand -base64 32`)

## 2. Install Dependencies

```bash
npm install
```

## 3. Generate Prisma Client

```bash
npx prisma generate
```

## 4. Push Database Schema

This will create the `users` table in your database:

```bash
npx prisma db push
```

## 5. Seed Admin User

Create an initial admin user:

```bash
npx tsx scripts/seed-admin.ts
```

This creates a user with:

- **Username:** `admin`
- **Password:** `password123`

⚠️ **Important:** Change the password after first login in production!

## 6. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 7. Test the Login System

1. You'll be redirected to the login page
2. Enter credentials: `admin` / `password123`
3. You'll be redirected to the dashboard
4. Test dark mode by toggling your system theme

## Project Structure

```
src/
├── app/
│   ├── api/auth/
│   │   ├── login/route.ts      # Login endpoint
│   │   ├── logout/route.ts     # Logout endpoint
│   │   └── me/route.ts         # Get current user
│   ├── login/page.tsx          # Login page
│   ├── dashboard/page.tsx      # Protected dashboard
│   ├── page.tsx                # Home (redirects based on auth)
│   └── layout.tsx              # Root layout with AuthProvider
├── components/
│   └── LoginForm.tsx           # Reusable login form
└── lib/
    ├── auth.tsx                # Auth context & hooks
    ├── db.ts                   # Prisma client
    └── password.ts             # Password hashing utilities
```

## Security Features

- ✅ Passwords hashed with bcryptjs (12 salt rounds)
- ✅ SQL injection protection via Prisma ORM
- ✅ HTTP-only cookies for session management
- ✅ Dark mode support
- ✅ Protected routes (dashboard requires authentication)

## Production Deployment

1. Set a strong `NEXTAUTH_SECRET` in production
2. Use a strong database password
3. Change the default admin password
4. Enable HTTPS
5. Set `NODE_ENV=production`

## Troubleshooting

### Can't connect to database

- Make sure MySQL is running: `mysql.server status` (macOS) or `sudo systemctl status mysql` (Linux)
- Check your `.env` file has correct credentials
- Ensure the database `aster_db` exists

### Prisma errors

- Run `npx prisma generate` again
- Run `npx prisma db push` to sync schema

### Module errors

- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
