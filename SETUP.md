# Aster Login System - Setup Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL server running (local, Docker, or cloud)
- npm or pnpm package manager

## 1. Local Development Database Setup (Docker)

Run PostgreSQL in a Docker container:

```bash
docker run --name aster-postgres \
  -e POSTGRES_USER=aster \
  -e POSTGRES_PASSWORD=aster \
  -e POSTGRES_DB=aster \
  -p 5432:5432 \
  -d postgres:16
```

### Configure Database Connection

Update the `.env` file with your PostgreSQL credentials and security settings:

```env
DATABASE_URL="postgresql://aster:aster@localhost:5432/aster"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
PASSWORD_PEPPER="your-secret-pepper-here-change-in-production"
```

Replace:

- `DATABASE_URL` with your PostgreSQL connection string
- `your-secret-key-here-change-in-production` with a secure random string
- `your-secret-pepper-here-change-in-production` with a different secure random string

## 2. Install Dependencies

```bash
npm install
```

## 3. Run Database Migrations

```bash
npx prisma migrate dev
```

## 4. Seed the Database

```bash
npm run db:seed:all
```

This seeds:

- Default company with system roles
- Employee statuses, leave types, leave statuses
- Core navigation templates with embedded permissions
- Default admin user

**Default Credentials:**
- **Username:** `admin`
- **Password:** `admin123`

⚠️ **Important:** Change the password after first login in production!

## 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 6. Test the Login System

1. You'll be redirected to the login page
2. Enter credentials: `admin` / `admin123`
3. You'll be redirected to the dashboard

## Vercel Deployment (PostgreSQL)

### 1. Provision a Database

Choose one of the following from the Vercel Marketplace:

- **Neon** (recommended — free tier available)
- **Supabase**
- **Xata**

### 2. Connect to Vercel

1. Go to your Vercel project dashboard → **Storage** tab
2. Click **Connect Database** → Choose your provider
3. Follow the provisioning flow — Vercel auto-sets `DATABASE_URL` as an environment variable
4. If using Neon, also set `DIRECT_URL` (used for running migrations):

```env
DATABASE_URL="postgresql://user:password@ep-xxxx-pooler.us-east-1.aws.neon.tech/db?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-xxxx.us-east-1.aws.neon.tech/db?sslmode=require"
```

### 3. Set Required Environment Variables in Vercel

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (auto-set by marketplace) |
| `DIRECT_URL` | Direct connection for migrations (Neon only) |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your Vercel deployment URL (auto-set by Vercel) |
| `PASSWORD_PEPPER` | Generate with `openssl rand -base64 32` |

### 4. Configure Build & Migration Command

In your Vercel project settings, set the **Build Command**:

```bash
npx prisma migrate deploy && next build
```

This runs migrations before building the app.

### 5. Deploy

Push your code to the connected Git repository — Vercel will automatically build and deploy.

## Project Structure

```
src/
├── app/
│   ├── api/                    # API routes (Prisma-based)
│   ├── dashboard/              # Protected dashboard pages
│   ├── login/page.tsx          # Login page
│   ├── page.tsx                # Home (redirects based on auth)
│   └── layout.tsx              # Root layout with AuthProvider
├── components/                 # UI components
├── lib/
│   ├── db.ts                   # Prisma client singleton
│   ├── tenant-prisma.ts        # Multi-tenant Prisma proxy
│   ├── next-auth.ts            # NextAuth v5 configuration
│   └── role-access-check.ts    # Page-level access control
└── config/                     # App configuration
```

## Security Features

### Password Security (Salt + Pepper + Bcrypt)

This project demonstrates enterprise-level password security:

- **Salt**: A unique cryptographic salt is generated for each user and explicitly stored in the database. This prevents rainbow table attacks.
- **Pepper**: A secret value stored in the `PASSWORD_PEPPER` environment variable (never in the database). This adds an extra layer of security even if the database is compromised.
- **Bcrypt**: Industry-standard hashing algorithm with 12 salt rounds.

**Formula**: `bcrypt.hash(password + pepper, salt)`

### Additional Security

- ✅ SQL injection protection via Prisma ORM
- ✅ HTTP-only cookies for session management
- ✅ Protected routes (dashboard requires authentication)
- ✅ Page-level role-based access control
- ✅ Multi-tenant data isolation

### Production Checklist

1. Set a strong `NEXTAUTH_SECRET` in production
2. Set a strong `PASSWORD_PEPPER` (generate with: `openssl rand -base64 32`)
3. Use a strong database password
4. Change the default admin password
5. Enable HTTPS (auto with Vercel)
6. Set `NODE_ENV=production` (auto with Vercel)

## Troubleshooting

### Can't connect to database

- **Local Docker**: Run `docker ps` to verify the container is running
- **Docker logs**: `docker logs aster-postgres` to check PostgreSQL errors
- **Vercel**: Check the Storage tab to verify the database link is active
- Verify your `.env` or Vercel env vars have the correct connection string

### Prisma errors

- Run `npx prisma generate` to regenerate the client
- Run `npx prisma migrate deploy` to apply pending migrations locally
- For local dev: `npx prisma migrate dev` creates and applies new migrations

### Module errors

- Delete `node_modules` and `package-lock.json`
