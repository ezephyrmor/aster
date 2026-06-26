# Aster HR Management System

A comprehensive HR management system built with Next.js, TypeScript, and Prisma ORM with PostgreSQL. Features include user management, team management, leave tracking, attendance monitoring, infraction tracking, calendar events, role-based access control, and multi-tenant company support.

## 🚀 Features

### 🔐 **Secure Authentication**

- **Session management** with HTTP-only cookies (NextAuth v5)
- **Password security** with salt + pepper + bcrypt (12 rounds)
- **Protected routes** with automatic redirect to login
- **Session validation** and secure logout functionality
- **Captcha verification** for login attempts

### 👥 **User Management**

- Full CRUD operations for users
- Employee profiles with department and position
- Role-based access control (Admin, HR, Manager, Employee)
- Multi-company (tenant) isolation

### 👨‍👩‍👧‍👦 **Team Management**

- Create and manage teams under brands
- Assign team members with team leaders
- Brand-based team organization
- Team member history tracking

### 🏢 **Brand Management**

- Manage multiple brands with industry classification
- Assign brand managers with full audit history
- Track manager assignment changes
- Brand-specific team organization

### 📅 **Leave Management**

- Leave request submission and approval workflow
- Multiple leave types (Vacation, Sick, Personal, etc.)
- Leave credits tracking
- Leave status management (Pending, Approved, Rejected)
- Manager approval dashboard

### ⏰ **Attendance & Schedules**

- Clock in/out functionality
- Schedule management with configurable shifts
- Attendance tracking with late/undertime detection
- Early clock-out with reason tracking
- Real-time attendance status

### ⚠️ **Infraction System**

- Track employee infractions with severity levels
- Infraction types and offense level tracking
- Employee acknowledgment workflow
- Infraction history tracking

### 📆 **Calendar Events**

- Create and manage calendar events
- Event color coding
- Integration with leave requests
- Calendar widget on dashboard

### 📊 **Analytics Dashboard**

- Real-time metrics and statistics
- User, brand, and team analytics
- Pending items tracking (leaves, infractions)
- Activity history

### 🎨 **Modern UI/UX**

- **Dark/light mode support** with smooth transitions
- **Responsive design** for all devices
- **Professional dashboard** with navigation sidebar
- **Toast notifications** for user feedback
- **Shadcn UI** components

### 🧪 **Demo Mode**

- Full demo data mode for testing without a database
- Pre-populated users, teams, brands, and events
- Toggle via `DEMO_MODE=true` environment variable

### 🏢 **Multi-Tenancy**

- Company-scoped data isolation
- Automatic company ID injection on all queries
- Proxy-based tenant Prisma client

### 🧭 **Navigation & Permissions**

- Feature-based navigation templates
- Role-specific navigation assignment
- Granular permissions (view, create, edit, delete, approve) per navigation item
- Page-level access control guard

## 🏗️ Architecture

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes (Prisma-based)
│   │   │   ├── auth/           # Authentication (NextAuth v5)
│   │   │   ├── users/          # User management
│   │   │   ├── teams/          # Team management
│   │   │   ├── brands/         # Brand management
│   │   │   ├── leaves/         # Leave management
│   │   │   ├── attendance/     # Attendance tracking
│   │   │   ├── schedules/      # Schedule management
│   │   │   ├── infractions/    # Infraction tracking
│   │   │   ├── calendar/       # Calendar events
│   │   │   ├── analytics/      # Analytics data
│   │   │   ├── features/       # Feature management
│   │   │   ├── navigation/     # Navigation management
│   │   │   └── demo/           # Demo mode API
│   │   ├── dashboard/          # Protected dashboard pages
│   │   └── login/              # Login page
│   ├── components/             # Reusable UI components
│   │   ├── forms/              # Form components (LoginForm, UserForm, etc.)
│   │   ├── layout/             # DashboardLayout, Sidebar, PageAccessGuard
│   │   ├── tables/             # Server-side data tables
│   │   ├── ui/                 # Shadcn UI primitives
│   │   ├── form/               # Form field components
│   │   └── widgets/            # CalendarWidget, ClockInButton, etc.
│   ├── lib/                    # Core utilities
│   │   ├── db.ts               # Prisma client singleton
│   │   ├── tenant-prisma.ts    # Multi-tenant Prisma proxy
│   │   ├── next-auth.ts        # NextAuth v5 configuration
│   │   ├── auth.tsx            # Auth context & hooks
│   │   ├── password.ts         # Password hashing utilities
│   │   ├── role-access-check.ts # Page-level access control
│   │   └── demo/               # Demo mode data store
│   ├── config/                 # App configuration
│   ├── types/                  # TypeScript type definitions
│   └── hooks/                  # Custom React hooks
├── prisma/                     # Database schema & migrations
├── scripts/                    # Seeding scripts
│   └── seed/                   # Modular seed phases
└── public/                     # Static assets
```

## 🛠️ Tech Stack

### Frontend

- **Next.js 16** - React framework with App Router and Turbopack
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling
- **React Hook Form** - Form management
- **Zod** - Runtime validation
- **TanStack Table** - Data tables
- **Lucide React** - Icons
- **Shadcn UI** - Component primitives

### Backend

- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Database modeling and queries
- **PostgreSQL** - Production database (via Docker or Vercel Marketplace)
- **NextAuth v5** - Authentication with Credentials provider
- **bcrypt** - Password hashing

### Development

- **TypeScript** - Type safety
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Vitest** - Unit & integration testing
- **Docker** - Local PostgreSQL

## 🚀 Quick Start (Docker + PostgreSQL)

### Prerequisites

- Node.js 18+
- npm or pnpm
- Docker Desktop

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/magical-owl/aster.git
cd aster
```

2. **Start PostgreSQL in Docker**

```bash
docker run --name aster-postgres \
  -e POSTGRES_USER=aster \
  -e POSTGRES_PASSWORD=aster \
  -e POSTGRES_DB=aster \
  -p 5432:5432 \
  -d postgres:16
```

3. **Install dependencies**

```bash
npm install
```

4. **Set up environment**

Copy `.env.example` to `.env` and update the database URL:

```env
DATABASE_URL="postgresql://aster:aster@localhost:5432/aster"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
PASSWORD_PEPPER="your-pepper-secret"
```

5. **Run database migrations**

```bash
npx prisma migrate dev
```

6. **Seed the database**

```bash
npm run db:seed:all
```

7. **Start development server**

```bash
npm run dev
```

8. **Open your browser**

Navigate to `http://localhost:3000`

### Default Credentials

| Role   | Username | Password |
|--------|----------|----------|
| Admin  | `admin`  | `admin123` |

⚠️ **Important:** Change the password after first login in production!

## 🚀 Vercel Deployment

### 1. Provision a PostgreSQL Database

From the Vercel Marketplace:

- **Neon** (recommended — free tier available)
- **Supabase**
- **Xata**

### 2. Connect to Vercel

1. Vercel project dashboard → **Storage** tab
2. Click **Connect Database** → Choose your provider
3. Vercel auto-sets `DATABASE_URL` as an environment variable
4. If using Neon, also add `DIRECT_URL` for migrations

### 3. Set Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (auto-set by marketplace) |
| `DIRECT_URL` | Direct connection for migrations (Neon only) |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your Vercel deployment URL (auto-set by Vercel) |
| `PASSWORD_PEPPER` | Generate with `openssl rand -base64 32` |

### 4. Build Command

In Vercel project settings, set:

```bash
npx prisma migrate deploy && next build
```

### 5. Deploy

Push your code to the connected Git repository.

## 📖 Usage

### Available Routes

| Route                       | Description                       |
| --------------------------- | --------------------------------- |
| `/login`                    | Authentication page               |
| `/dashboard`                | Main dashboard                    |
| `/dashboard/users`          | User management                   |
| `/dashboard/teams`          | Team management                   |
| `/dashboard/brands`         | Brand management                  |
| `/dashboard/leaves`         | Leave request & approval          |
| `/dashboard/schedules`      | Schedule management               |
| `/dashboard/infractions`    | Infraction tracking               |
| `/dashboard/my-infractions` | View own infractions              |
| `/dashboard/calendar`       | Calendar events                   |
| `/dashboard/analytics`      | Analytics dashboard               |
| `/dashboard/settings`       | User settings                     |
| `/dashboard/feature-manager`| Navigation & feature management   |

### Development Scripts

```bash
npm run dev              # Start development server
npm run dev+             # Clean + start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run db:seed          # Run main seed
npm run db:seed:all      # Run all seeds
npm run db:reset         # Reset DB + re-seed
npm run db:reset+        # Sync schema + reset + re-seed
npm run db:studio        # Open Prisma Studio
npm run generate         # Regenerate Prisma client
```

## 🔒 Security

### Password Security

- **Salt**: Unique cryptographic salt generated per user (stored in DB)
- **Pepper**: Secret value stored in `PASSWORD_PEPPER` env var (never in DB)
- **Bcrypt**: Industry-standard hashing with 12 rounds

**Formula**: `bcrypt.hash(password + pepper, salt)`

### Additional Security Features

- **HTTPS enforcement** in production
- **CSRF protection** with NextAuth
- **Session management** with HTTP-only cookies
- **Input validation** with Zod schemas
- **SQL injection protection** with Prisma ORM
- **Page-level access control** with role-based permissions
- **Multi-tenant isolation** via automatic company ID scoping
- **Captcha verification** on login

## 📊 Project Status

### Completed Features

- ✅ Authentication System (NextAuth v5 + Captcha)
- ✅ User Management with Employee Profiles
- ✅ Team Management with History
- ✅ Brand Management with Manager Audit
- ✅ Leave Management (types, credits, requests, approval)
- ✅ Attendance & Schedules
- ✅ Infraction System (types, offenses, acknowledgment)
- ✅ Calendar Events
- ✅ Analytics Dashboard
- ✅ Multi-Tenant Company Isolation
- ✅ Feature & Navigation Management
- ✅ Role-Based Page Access Control
- ✅ Demo Mode
- ✅ Dark/Light Theme
- ✅ Server-Side Data Tables

### In Progress

- 🔄 Advanced reporting
- 🔄 Email notifications
- 🔄 Export functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using modern web technologies**

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)