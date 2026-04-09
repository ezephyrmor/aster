# Aster HR Management System

A comprehensive HR management system built with Next.js, TypeScript, and Prisma ORM. Features include user management, team management, leave tracking, attendance monitoring, infraction tracking, and calendar events.

## 🚀 Features

### 🔐 **Secure Authentication**

- **Session management** with HTTP-only cookies
- **Password security** with salt + pepper + bcrypt (12 rounds)
- **Protected routes** with automatic redirect to login
- **Session validation** and secure logout functionality

### 👥 **User Management**

- Full CRUD operations for users
- Employee profiles with department and position
- Role-based access control (Admin, HR, Employee)
- User search functionality

### 👨‍👩‍👧‍👦 **Team Management**

- Create and manage teams
- Assign team members with team leaders
- Brand-based team organization
- Team member tracking

### 🏢 **Brand Management**

- Manage multiple brands
- Assign brand managers
- Track manager assignment history
- Brand-specific team organization

### 📅 **Leave Management**

- Leave request submission and approval workflow
- Multiple leave types (Vacation, Sick, Personal, etc.)
- Leave credits tracking
- Leave status management (Pending, Approved, Rejected)
- Manager approval dashboard

### ⏰ **Attendance & Schedules**

- Clock in/out functionality
- Schedule management
- Attendance tracking with late/undertime detection
- Early clock-out with reason tracking
- Real-time attendance status

### ⚠️ **Infraction System**

- Track employee infractions
- Infraction types with severity levels
- Offense level tracking (1st, 2nd, 3rd, 4th offense)
- Employee acknowledgment workflow
- Infraction history tracking

### 📆 **Calendar Events**

- Create and manage calendar events
- Event color coding
- Integration with leave requests
- Calendar widget on dashboard

### 📊 **Analytics Dashboard**

- Real-time metrics and statistics
- User analytics
- Attendance overview
- Pending items tracking (leaves, infractions)

### 🎨 **Modern UI/UX**

- **Dark/light mode support** with smooth transitions
- **Responsive design** for all devices
- **Professional dashboard** with user information and stats
- **Toast notifications** for user feedback
- **Loading states** and error handling throughout

### 🧪 **Demo Mode**

- Full demo data mode for testing without database
- Pre-populated users, teams, brands, and events
- Easy switching between demo and production mode

## 🏗️ Architecture

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── users/         # User management
│   │   │   ├── teams/         # Team management
│   │   │   ├── brands/        # Brand management
│   │   │   ├── leaves/        # Leave management
│   │   │   ├── attendance/    # Attendance tracking
│   │   │   ├── schedules/     # Schedule management
│   │   │   ├── infractions/   # Infraction tracking
│   │   │   ├── calendar/      # Calendar events
│   │   │   └── analytics/     # Analytics data
│   │   ├── dashboard/         # Protected admin pages
│   │   │   ├── users/         # User management pages
│   │   │   ├── teams/         # Team management pages
│   │   │   ├── brands/        # Brand management pages
│   │   │   ├── leaves/        # Leave management pages
│   │   │   ├── schedules/     # Schedule pages
│   │   │   ├── infractions/   # Infraction pages
│   │   │   ├── calendar/      # Calendar page
│   │   │   └── analytics/     # Analytics page
│   │   └── login/             # Authentication pages
│   ├── components/            # Reusable UI components
│   │   ├── LoginForm.tsx      # Secure login form
│   │   ├── Sidebar.tsx        # Navigation sidebar
│   │   ├── ClockInButton.tsx  # Attendance clock button
│   │   ├── CalendarWidget.tsx # Calendar widget
│   │   └── ...                # More components
│   ├── lib/                   # Core utilities
│   │   ├── auth.tsx           # Authentication context
│   │   ├── db.ts              # Database connection
│   │   ├── password.ts        # Password utilities
│   │   ├── toast.tsx          # Toast notifications
│   │   └── demo/              # Demo mode store
│   └── app/                   # Root application
├── prisma/                    # Database schema
├── scripts/                   # Development utilities
└── public/                    # Static assets
```

## 🛠️ Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Hook Form** - Form management
- **Zod** - Runtime validation

### Backend

- **Prisma ORM** - Database modeling and queries
- **SQLite** - Default database (easily switchable to MySQL/PostgreSQL)
- **bcrypt** - Password hashing
- **Next.js API Routes** - Serverless functions

### Development

- **TypeScript** - Type safety
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Git** - Version control

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/ezephyrmor/aster.git
cd aster
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment**

```bash
cp .env.example .env.local
```

4. **Run database migrations**

```bash
npx prisma migrate dev
```

5. **Generate Prisma client**

```bash
npx prisma generate
```

6. **Seed the database**

```bash
# Seed lookup tables first
npx tsx scripts/seed-lookup-tables.ts

# Seed admin users
npx tsx scripts/seed-admin.ts

# Seed dummy data (optional)
npx tsx scripts/seed-dummy-data.ts

# Or seed everything at once
npx tsx scripts/seed-all-data.ts
```

7. **Start development server**

```bash
npm run dev
```

8. **Open your browser**

Navigate to `http://localhost:3000`

### Environment Variables

Create a `.env.local` file with the following:

```env
# Database (SQLite default)
DATABASE_URL="file:./dev.db"

# For MySQL/PostgreSQL:
# DATABASE_URL="mysql://root:password@localhost:3306/aster_db"
# DATABASE_URL="postgresql://user:password@localhost:5432/aster_db"

# Application
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Password pepper (for additional security)
PASSWORD_PEPPER="your-pepper-secret"

# Demo mode (set to "true" to enable demo mode)
DEMO_MODE="false"
```

## 📖 Usage

### Default Credentials

**Database Mode:**

- **Username**: `admin`
- **Password**: `password123`

**Demo Mode:**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | demo123 |
| Employee | juan@demo.com | demo123 |
| Manager | maria@demo.com | demo123 |

### Available Routes

| Route                       | Description                       |
| --------------------------- | --------------------------------- |
| `/login`                    | Authentication page               |
| `/dashboard`                | Main dashboard                    |
| `/dashboard/users`          | User management                   |
| `/dashboard/teams`          | Team management                   |
| `/dashboard/brands`         | Brand management                  |
| `/dashboard/leaves/request` | Submit leave requests             |
| `/dashboard/leaves/approve` | Approve leave requests (managers) |
| `/dashboard/schedules`      | Schedule management               |
| `/dashboard/infractions`    | Infraction tracking               |
| `/dashboard/my-infractions` | View own infractions              |
| `/dashboard/calendar`       | Calendar events                   |
| `/dashboard/analytics`      | Analytics dashboard               |
| `/dashboard/settings`       | User settings                     |

### Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### Database Seeding Scripts

The project includes comprehensive seeding scripts:

```bash
# Individual scripts
npx tsx scripts/seed-lookup-tables.ts   # Roles, positions, departments, statuses
npx tsx scripts/seed-admin.ts           # Admin and HR users
npx tsx scripts/seed-dummy-data.ts      # Sample users, brands, teams
npx tsx scripts/seed-team-members.ts    # Assign members to teams
npx tsx scripts/seed-leave-lookups.ts   # Leave types and statuses
npx tsx scripts/seed-infraction-lookups.ts # Infraction types and offenses
npx tsx scripts/seed-calendar-events.ts # Calendar events
npx tsx scripts/seed-schedules.ts       # Work schedules
npx tsx scripts/seed-attendance.ts      # Attendance records
npx tsx scripts/seed-leaves.ts          # Leave requests
npx tsx scripts/seed-infractions.ts     # Infraction records

# All-in-one script
npx tsx scripts/seed-all-data.ts        # Run all seeds in order
```

## 🎛️ Demo Mode

Enable demo mode to test the application without a database:

1. Set `DEMO_MODE=true` in `.env.local`
2. Restart the development server
3. Use demo credentials to login

Demo mode provides:

- Pre-populated users, teams, brands
- Sample leave requests and infractions
- Calendar events
- Analytics data

## 📊 Project Status

### Completed Features

- ✅ Authentication System
- ✅ User Management
- ✅ Team Management
- ✅ Brand Management
- ✅ Leave Management
- ✅ Attendance & Schedules
- ✅ Infraction System
- ✅ Calendar Events
- ✅ Analytics Dashboard
- ✅ Demo Mode
- ✅ Dark/Light Theme

### In Progress

- 🔄 Advanced reporting
- 🔄 Email notifications
- 🔄 Export functionality

## 🔒 Security

### Password Security

- **Salt**: Unique cryptographic salt generated per user
- **Pepper**: Secret value stored in environment variable
- **Bcrypt**: Industry-standard hashing with 12 rounds

### Additional Security Features

- **HTTPS enforcement** in production
- **CSRF protection** with secure cookies
- **Session management** with HTTP-only cookies
- **Input validation** with type safety
- **SQL injection protection** with Prisma ORM

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## 📞 Support

For support, create an issue on GitHub or contact the development team.

## 📄 License

This project is licensed under the MIT License.

## 🏆 Highlights

### Technical Skills Demonstrated

- **Full-stack development** with modern JavaScript/TypeScript
- **Authentication & Authorization** implementation
- **Database design** and ORM usage
- **Responsive UI/UX** design principles
- **Security best practices** implementation
- **Git workflow** and version control

### Modern Development Practices

- **Type safety** with TypeScript throughout
- **Component-based architecture** with React
- **API design** with RESTful principles
- **Database migrations** and schema management
- **Code quality** with ESLint and Prettier

---

**Built with ❤️ using modern web technologies**

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
