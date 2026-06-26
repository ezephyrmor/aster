-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('active', 'inactive', 'suspended', 'trial');

-- CreateEnum
CREATE TYPE "BrandManagerAction" AS ENUM ('ASSIGNED', 'REMOVED');

-- CreateEnum
CREATE TYPE "BrandStatus" AS ENUM ('active', 'inactive', 'archived');

-- CreateEnum
CREATE TYPE "TeamMemberStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "TeamHistoryAction" AS ENUM ('joined', 'left', 'promoted', 'demoted', 'removed', 'created', 'updated');

-- CreateEnum
CREATE TYPE "FeatureKind" AS ENUM ('page', 'api', 'action');

-- CreateEnum
CREATE TYPE "ScopeLevel" AS ENUM ('self', 'team', 'department', 'brand', 'company');

-- CreateEnum
CREATE TYPE "EffectType" AS ENUM ('allow', 'deny');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('present', 'absent', 'late', 'undertime', 'on_leave', 'holiday');

-- CreateTable
CREATE TABLE "positions" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL DEFAULT '1',
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL DEFAULT '1',
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL DEFAULT '1',
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_statuses" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "color" VARCHAR(20) NOT NULL DEFAULT 'gray',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archived_at" TIMESTAMP(3),
    "archived_by" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "employee_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "industries" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "industries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "status" "CompanyStatus" NOT NULL DEFAULT 'active',
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'Asia/Manila',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_profiles" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "legal_name" VARCHAR(200),
    "tax_id" VARCHAR(50),
    "email" VARCHAR(200),
    "phone" VARCHAR(50),
    "address" TEXT,
    "city" VARCHAR(100),
    "country" VARCHAR(100),
    "settings" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL DEFAULT '1',
    "username" VARCHAR(50) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "salt" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "middle_name" VARCHAR(100),
    "date_of_birth" TIMESTAMP(3),
    "contact_number" VARCHAR(20),
    "personal_email" VARCHAR(255),
    "address" TEXT,
    "hire_date" TIMESTAMP(3),
    "emergency_contact_name" VARCHAR(200),
    "emergency_contact_number" VARCHAR(50),
    "emergency_contact_relation" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "department_id" TEXT,
    "position_id" TEXT,
    "status_id" TEXT NOT NULL DEFAULT '1',
    "role_id" TEXT NOT NULL DEFAULT '3',

    CONSTRAINT "employee_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_status_history" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status_id" TEXT NOT NULL,
    "effective_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,
    "notes" TEXT,
    "performed_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,

    CONSTRAINT "employee_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brands" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL DEFAULT '1',
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "logo" VARCHAR(500),
    "website" VARCHAR(255),
    "status" "BrandStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "manager_id" TEXT,
    "industry_id" TEXT,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brand_manager_history" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "user_id" TEXT,
    "action" "BrandManagerAction" NOT NULL,
    "performed_by" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "previous_manager_id" TEXT,
    "reason" TEXT,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,

    CONSTRAINT "brand_manager_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL DEFAULT '1',
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "brand_id" TEXT NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "is_leader" BOOLEAN NOT NULL DEFAULT false,
    "status" "TeamMemberStatus" NOT NULL DEFAULT 'active',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_history" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "team_member_id" TEXT,
    "action" "TeamHistoryAction" NOT NULL,
    "performed_by" TEXT NOT NULL,
    "reason" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_events" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL DEFAULT '1',
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "color" VARCHAR(20) NOT NULL DEFAULT 'blue',
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_types" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL DEFAULT '1',
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "default_days_limit" INTEGER,
    "color" VARCHAR(20) NOT NULL DEFAULT 'purple',
    "archived_at" TIMESTAMP(3),
    "archived_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leave_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_statuses" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL DEFAULT '1',
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "color" VARCHAR(20) NOT NULL DEFAULT 'gray',
    "is_final" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leave_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_credits" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "earned_date" TIMESTAMP(3) NOT NULL,
    "used_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leave_credits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_requests" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL DEFAULT '1',
    "user_id" TEXT NOT NULL,
    "leave_type_id" TEXT NOT NULL,
    "status_id" TEXT NOT NULL DEFAULT '1',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "is_paid" BOOLEAN NOT NULL DEFAULT true,
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "review_comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_usage" (
    "id" TEXT NOT NULL,
    "leave_request_id" TEXT NOT NULL,
    "leave_credit_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leave_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_schedules" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL DEFAULT '1',
    "day_of_week" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "break_minutes" INTEGER NOT NULL DEFAULT 60,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "schedule_id" TEXT,
    "date" DATE NOT NULL,
    "clock_in" TIMESTAMP(3),
    "clock_out" TIMESTAMP(3),
    "status" "AttendanceStatus" NOT NULL DEFAULT 'present',
    "late_minutes" INTEGER NOT NULL DEFAULT 0,
    "undertime_minutes" INTEGER NOT NULL DEFAULT 0,
    "early_clock_out_reason" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "infraction_types" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL DEFAULT '1',
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "color" VARCHAR(20) NOT NULL DEFAULT 'red',
    "archived_at" TIMESTAMP(3),
    "archived_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "infraction_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "infraction_offenses" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL DEFAULT '1',
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "severity_level" INTEGER NOT NULL,
    "type_id" TEXT NOT NULL,
    "archived_at" TIMESTAMP(3),
    "archived_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "infraction_offenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "infractions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL DEFAULT '1',
    "offense_id" TEXT NOT NULL,
    "type_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "details" TEXT,
    "comment" TEXT,
    "acknowledged_by" TEXT,
    "acknowledged_at" TIMESTAMP(3),
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "infractions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(150) NOT NULL,
    "kind" "FeatureKind" NOT NULL,
    "http_method" VARCHAR(10),
    "path" VARCHAR(255) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "domain" VARCHAR(50) NOT NULL,
    "archived_at" TIMESTAMP(3),
    "archived_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_navigation_templates" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "company_id" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "archived_at" TIMESTAMP(3),
    "archived_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_navigation_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_navigation_items" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "code" VARCHAR(100) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "alias" VARCHAR(120),
    "icon" VARCHAR(50),
    "type" VARCHAR(20) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "feature_code" VARCHAR(150),
    "url" VARCHAR(255),
    "permissions" JSONB DEFAULT '{"view": true, "create": false, "edit": false, "delete": false, "approve": false}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feature_navigation_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_navigations" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "navigation_template_id" TEXT NOT NULL,
    "archived_at" TIMESTAMP(3),
    "archived_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_navigations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "positions_company_id_idx" ON "positions"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "positions_company_id_name_key" ON "positions"("company_id", "name");

-- CreateIndex
CREATE INDEX "departments_company_id_idx" ON "departments"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "departments_company_id_name_key" ON "departments"("company_id", "name");

-- CreateIndex
CREATE INDEX "roles_company_id_idx" ON "roles"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_company_id_name_key" ON "roles"("company_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "employee_statuses_name_key" ON "employee_statuses"("name");

-- CreateIndex
CREATE UNIQUE INDEX "industries_name_key" ON "industries"("name");

-- CreateIndex
CREATE UNIQUE INDEX "companies_name_key" ON "companies"("name");

-- CreateIndex
CREATE UNIQUE INDEX "company_profiles_company_id_key" ON "company_profiles"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_company_id_idx" ON "users"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "employee_profiles_user_id_key" ON "employee_profiles"("user_id");

-- CreateIndex
CREATE INDEX "employee_profiles_department_id_idx" ON "employee_profiles"("department_id");

-- CreateIndex
CREATE INDEX "employee_profiles_position_id_idx" ON "employee_profiles"("position_id");

-- CreateIndex
CREATE INDEX "employee_profiles_status_id_idx" ON "employee_profiles"("status_id");

-- CreateIndex
CREATE INDEX "employee_profiles_role_id_idx" ON "employee_profiles"("role_id");

-- CreateIndex
CREATE INDEX "employee_status_history_user_id_idx" ON "employee_status_history"("user_id");

-- CreateIndex
CREATE INDEX "employee_status_history_status_id_idx" ON "employee_status_history"("status_id");

-- CreateIndex
CREATE INDEX "employee_status_history_performed_by_idx" ON "employee_status_history"("performed_by");

-- CreateIndex
CREATE INDEX "employee_status_history_effective_date_idx" ON "employee_status_history"("effective_date");

-- CreateIndex
CREATE UNIQUE INDEX "brands_name_key" ON "brands"("name");

-- CreateIndex
CREATE INDEX "brands_industry_id_idx" ON "brands"("industry_id");

-- CreateIndex
CREATE INDEX "brands_manager_id_idx" ON "brands"("manager_id");

-- CreateIndex
CREATE INDEX "brands_company_id_idx" ON "brands"("company_id");

-- CreateIndex
CREATE INDEX "brand_manager_history_brand_id_fkey" ON "brand_manager_history"("brandId");

-- CreateIndex
CREATE INDEX "brand_manager_history_user_id_idx" ON "brand_manager_history"("user_id");

-- CreateIndex
CREATE INDEX "brand_manager_history_performed_by_idx" ON "brand_manager_history"("performed_by");

-- CreateIndex
CREATE INDEX "brand_manager_history_timestamp_fkey" ON "brand_manager_history"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "teams_name_key" ON "teams"("name");

-- CreateIndex
CREATE INDEX "teams_brand_id_idx" ON "teams"("brand_id");

-- CreateIndex
CREATE INDEX "teams_company_id_idx" ON "teams"("company_id");

-- CreateIndex
CREATE INDEX "team_members_team_id_idx" ON "team_members"("team_id");

-- CreateIndex
CREATE INDEX "team_members_user_id_idx" ON "team_members"("user_id");

-- CreateIndex
CREATE INDEX "team_history_team_id_idx" ON "team_history"("team_id");

-- CreateIndex
CREATE INDEX "team_history_team_member_id_idx" ON "team_history"("team_member_id");

-- CreateIndex
CREATE INDEX "calendar_events_company_id_idx" ON "calendar_events"("company_id");

-- CreateIndex
CREATE INDEX "calendar_events_start_date_idx" ON "calendar_events"("start_date");

-- CreateIndex
CREATE INDEX "calendar_events_created_by_idx" ON "calendar_events"("created_by");

-- CreateIndex
CREATE INDEX "leave_types_company_id_idx" ON "leave_types"("company_id");

-- CreateIndex
CREATE INDEX "leave_types_archived_by_idx" ON "leave_types"("archived_by");

-- CreateIndex
CREATE UNIQUE INDEX "leave_types_company_id_name_key" ON "leave_types"("company_id", "name");

-- CreateIndex
CREATE INDEX "leave_statuses_company_id_idx" ON "leave_statuses"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "leave_statuses_company_id_name_key" ON "leave_statuses"("company_id", "name");

-- CreateIndex
CREATE INDEX "leave_credits_user_id_idx" ON "leave_credits"("user_id");

-- CreateIndex
CREATE INDEX "leave_credits_earned_date_idx" ON "leave_credits"("earned_date");

-- CreateIndex
CREATE INDEX "leave_requests_company_id_idx" ON "leave_requests"("company_id");

-- CreateIndex
CREATE INDEX "leave_requests_user_id_idx" ON "leave_requests"("user_id");

-- CreateIndex
CREATE INDEX "leave_requests_status_id_idx" ON "leave_requests"("status_id");

-- CreateIndex
CREATE INDEX "leave_requests_leave_type_id_idx" ON "leave_requests"("leave_type_id");

-- CreateIndex
CREATE INDEX "leave_requests_start_date_idx" ON "leave_requests"("start_date");

-- CreateIndex
CREATE INDEX "leave_usage_leave_request_id_idx" ON "leave_usage"("leave_request_id");

-- CreateIndex
CREATE INDEX "leave_usage_leave_credit_id_idx" ON "leave_usage"("leave_credit_id");

-- CreateIndex
CREATE UNIQUE INDEX "leave_usage_leave_request_id_leave_credit_id_key" ON "leave_usage"("leave_request_id", "leave_credit_id");

-- CreateIndex
CREATE INDEX "work_schedules_company_id_idx" ON "work_schedules"("company_id");

-- CreateIndex
CREATE INDEX "work_schedules_user_id_idx" ON "work_schedules"("user_id");

-- CreateIndex
CREATE INDEX "work_schedules_day_of_week_idx" ON "work_schedules"("day_of_week");

-- CreateIndex
CREATE INDEX "attendance_user_id_idx" ON "attendance"("user_id");

-- CreateIndex
CREATE INDEX "attendance_date_idx" ON "attendance"("date");

-- CreateIndex
CREATE INDEX "attendance_status_idx" ON "attendance"("status");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_user_id_date_key" ON "attendance"("user_id", "date");

-- CreateIndex
CREATE INDEX "infraction_types_company_id_idx" ON "infraction_types"("company_id");

-- CreateIndex
CREATE INDEX "infraction_types_archived_by_idx" ON "infraction_types"("archived_by");

-- CreateIndex
CREATE UNIQUE INDEX "infraction_types_company_id_name_key" ON "infraction_types"("company_id", "name");

-- CreateIndex
CREATE INDEX "infraction_offenses_company_id_idx" ON "infraction_offenses"("company_id");

-- CreateIndex
CREATE INDEX "infraction_offenses_type_id_idx" ON "infraction_offenses"("type_id");

-- CreateIndex
CREATE INDEX "infraction_offenses_archived_by_idx" ON "infraction_offenses"("archived_by");

-- CreateIndex
CREATE UNIQUE INDEX "infraction_offenses_company_id_name_key" ON "infraction_offenses"("company_id", "name");

-- CreateIndex
CREATE INDEX "infractions_company_id_idx" ON "infractions"("company_id");

-- CreateIndex
CREATE INDEX "infractions_user_id_idx" ON "infractions"("user_id");

-- CreateIndex
CREATE INDEX "infractions_type_id_idx" ON "infractions"("type_id");

-- CreateIndex
CREATE INDEX "infractions_offense_id_idx" ON "infractions"("offense_id");

-- CreateIndex
CREATE INDEX "infractions_date_idx" ON "infractions"("date");

-- CreateIndex
CREATE INDEX "features_archived_by_idx" ON "features"("archived_by");

-- CreateIndex
CREATE UNIQUE INDEX "uq_feature_code" ON "features"("code");

-- CreateIndex
CREATE UNIQUE INDEX "uq_feature_path_method" ON "features"("path", "http_method");

-- CreateIndex
CREATE INDEX "feature_navigation_templates_company_id_idx" ON "feature_navigation_templates"("company_id");

-- CreateIndex
CREATE INDEX "feature_navigation_templates_archived_by_idx" ON "feature_navigation_templates"("archived_by");

-- CreateIndex
CREATE UNIQUE INDEX "uq_nav_template_code" ON "feature_navigation_templates"("code");

-- CreateIndex
CREATE INDEX "feature_navigation_items_template_id_idx" ON "feature_navigation_items"("template_id");

-- CreateIndex
CREATE INDEX "feature_navigation_items_parent_id_idx" ON "feature_navigation_items"("parent_id");

-- CreateIndex
CREATE INDEX "feature_navigation_items_feature_code_idx" ON "feature_navigation_items"("feature_code");

-- CreateIndex
CREATE UNIQUE INDEX "uq_nav_item_template_code" ON "feature_navigation_items"("template_id", "code");

-- CreateIndex
CREATE INDEX "role_navigations_company_id_idx" ON "role_navigations"("company_id");

-- CreateIndex
CREATE INDEX "role_navigations_role_id_idx" ON "role_navigations"("role_id");

-- CreateIndex
CREATE INDEX "role_navigations_navigation_template_id_idx" ON "role_navigations"("navigation_template_id");

-- CreateIndex
CREATE INDEX "role_navigations_archived_by_idx" ON "role_navigations"("archived_by");

-- CreateIndex
CREATE UNIQUE INDEX "uq_role_navigation" ON "role_navigations"("company_id", "role_id");

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_profiles" ADD CONSTRAINT "company_profiles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_profiles" ADD CONSTRAINT "employee_profiles_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_profiles" ADD CONSTRAINT "employee_profiles_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_profiles" ADD CONSTRAINT "employee_profiles_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "employee_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_profiles" ADD CONSTRAINT "employee_profiles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_profiles" ADD CONSTRAINT "employee_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_status_history" ADD CONSTRAINT "employee_status_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "employee_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_status_history" ADD CONSTRAINT "employee_status_history_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "employee_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_status_history" ADD CONSTRAINT "employee_status_history_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brands" ADD CONSTRAINT "brands_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brands" ADD CONSTRAINT "brands_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brands" ADD CONSTRAINT "brands_industry_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "industries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_manager_history" ADD CONSTRAINT "brand_manager_history_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_manager_history" ADD CONSTRAINT "brand_manager_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_manager_history" ADD CONSTRAINT "brand_manager_history_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_history" ADD CONSTRAINT "team_history_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_history" ADD CONSTRAINT "team_history_team_member_id_fkey" FOREIGN KEY ("team_member_id") REFERENCES "team_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_types" ADD CONSTRAINT "leave_types_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_types" ADD CONSTRAINT "leave_types_archived_by_fkey" FOREIGN KEY ("archived_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_statuses" ADD CONSTRAINT "leave_statuses_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_credits" ADD CONSTRAINT "leave_credits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_leave_type_id_fkey" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "leave_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_usage" ADD CONSTRAINT "leave_usage_leave_request_id_fkey" FOREIGN KEY ("leave_request_id") REFERENCES "leave_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_usage" ADD CONSTRAINT "leave_usage_leave_credit_id_fkey" FOREIGN KEY ("leave_credit_id") REFERENCES "leave_credits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_schedules" ADD CONSTRAINT "work_schedules_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_schedules" ADD CONSTRAINT "work_schedules_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "work_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "infraction_types" ADD CONSTRAINT "infraction_types_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "infraction_types" ADD CONSTRAINT "infraction_types_archived_by_fkey" FOREIGN KEY ("archived_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "infraction_offenses" ADD CONSTRAINT "infraction_offenses_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "infraction_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "infraction_offenses" ADD CONSTRAINT "infraction_offenses_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "infraction_offenses" ADD CONSTRAINT "infraction_offenses_archived_by_fkey" FOREIGN KEY ("archived_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "infractions" ADD CONSTRAINT "infractions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "infractions" ADD CONSTRAINT "infractions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "infractions" ADD CONSTRAINT "infractions_offense_id_fkey" FOREIGN KEY ("offense_id") REFERENCES "infraction_offenses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "infractions" ADD CONSTRAINT "infractions_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "infraction_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "infractions" ADD CONSTRAINT "infractions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "infractions" ADD CONSTRAINT "infractions_acknowledged_by_fkey" FOREIGN KEY ("acknowledged_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "features" ADD CONSTRAINT "features_archived_by_fkey" FOREIGN KEY ("archived_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_navigation_templates" ADD CONSTRAINT "feature_navigation_templates_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_navigation_templates" ADD CONSTRAINT "feature_navigation_templates_archived_by_fkey" FOREIGN KEY ("archived_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_navigation_items" ADD CONSTRAINT "feature_navigation_items_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "feature_navigation_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_navigation_items" ADD CONSTRAINT "feature_navigation_items_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "feature_navigation_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_navigation_items" ADD CONSTRAINT "feature_navigation_items_feature_code_fkey" FOREIGN KEY ("feature_code") REFERENCES "features"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_navigations" ADD CONSTRAINT "role_navigations_navigation_template_id_fkey" FOREIGN KEY ("navigation_template_id") REFERENCES "feature_navigation_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_navigations" ADD CONSTRAINT "role_navigations_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_navigations" ADD CONSTRAINT "role_navigations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_navigations" ADD CONSTRAINT "role_navigations_archived_by_fkey" FOREIGN KEY ("archived_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
