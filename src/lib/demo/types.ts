// User types
export interface DemoUser {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "admin" | "employee" | "manager";
  position?: string;
  department?: string;
  hireDate?: string;
  status: "active" | "inactive";
  teamId?: number;
}

// Team types
export interface DemoTeam {
  id: number;
  name: string;
  description?: string;
  leaderId?: number;
}

// Brand types
export interface DemoBrand {
  id: number;
  name: string;
  description?: string;
  logo?: string;
  status: "active" | "inactive";
}

// Schedule types
export interface DemoSchedule {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  days: number[];
  userId?: number;
}

// Attendance types
export interface DemoAttendance {
  id: number;
  userId: number;
  date: string;
  clockIn?: string;
  clockOut?: string;
  status: "present" | "late" | "undertime" | "absent";
  lateMinutes: number;
  undertimeMinutes: number;
}

// Leave types
export interface DemoLeaveType {
  id: number;
  name: string;
  code: string;
}

export interface DemoLeaveRequest {
  id: number;
  userId: number;
  typeId: number;
  startDate: string;
  endDate: string;
  reason?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

// Infraction types
export interface DemoInfractionType {
  id: number;
  name: string;
  severity: "minor" | "major";
}

export interface DemoInfraction {
  id: number;
  userId: number;
  typeId: number;
  date: string;
  description?: string;
  status: "pending" | "acknowledged" | "resolved";
  createdAt: string;
}

// Calendar types
export interface DemoCalendarEvent {
  id: number;
  title: string;
  description?: string;
  start: string;
  end: string;
  type: "meeting" | "holiday" | "event" | "reminder";
}

// Main demo data structure
export interface DemoData {
  users: DemoUser[];
  teams: DemoTeam[];
  brands: DemoBrand[];
  schedules: DemoSchedule[];
  attendance: DemoAttendance[];
  leaveTypes: DemoLeaveType[];
  leaveRequests: DemoLeaveRequest[];
  infractionTypes: DemoInfractionType[];
  infractions: DemoInfraction[];
  calendarEvents: DemoCalendarEvent[];
}
