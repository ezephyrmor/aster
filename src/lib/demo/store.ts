import demoDataRaw from "@/data/demo-data.json";
import type { DemoData, DemoUser } from "./types";

// Deep clone the data to avoid modifying the original
const cloneData = <T>(data: T): T => JSON.parse(JSON.stringify(data));

class DemoStore {
  private data: DemoData;

  constructor() {
    this.data = cloneData(demoDataRaw as DemoData);
  }

  // User operations
  getUsers() {
    return this.data.users.map(({ password, ...user }) => user);
  }

  getUserById(id: number) {
    const user = this.data.users.find((u) => u.id === id);
    if (user) {
      const { password, ...safeUser } = user;
      return safeUser;
    }
    return null;
  }

  getUserByEmail(email: string) {
    return this.data.users.find((u) => u.email === email) || null;
  }

  validateCredentials(email: string, password: string) {
    const user = this.data.users.find(
      (u) => u.email === email && u.password === password,
    );
    if (user) {
      const { password: _, ...safeUser } = user;
      return safeUser;
    }
    return null;
  }

  // Team operations
  getTeams() {
    return this.data.teams;
  }

  getTeamById(id: number) {
    return this.data.teams.find((t) => t.id === id) || null;
  }

  // Brand operations
  getBrands() {
    return this.data.brands;
  }

  getBrandById(id: number) {
    return this.data.brands.find((b) => b.id === id) || null;
  }

  // Schedule operations
  getSchedules() {
    return this.data.schedules;
  }

  getScheduleById(id: number) {
    return this.data.schedules.find((s) => s.id === id) || null;
  }

  getScheduleByUserId(userId: number) {
    return this.data.schedules.find((s) => s.userId === userId) || null;
  }

  // Attendance operations
  getAttendance() {
    return this.data.attendance;
  }

  getAttendanceByUserId(userId: number) {
    return this.data.attendance.filter((a) => a.userId === userId);
  }

  getAttendanceByDate(date: string) {
    return this.data.attendance.filter((a) => a.date === date);
  }

  // Leave type operations
  getLeaveTypes() {
    return this.data.leaveTypes;
  }

  getLeaveTypeById(id: number) {
    return this.data.leaveTypes.find((lt) => lt.id === id) || null;
  }

  // Leave request operations
  getLeaveRequests() {
    return this.data.leaveRequests;
  }

  getLeaveRequestById(id: number) {
    return this.data.leaveRequests.find((lr) => lr.id === id) || null;
  }

  getLeaveRequestsByUserId(userId: number) {
    return this.data.leaveRequests.filter((lr) => lr.userId === userId);
  }

  // Infraction type operations
  getInfractionTypes() {
    return this.data.infractionTypes;
  }

  getInfractionTypeById(id: number) {
    return this.data.infractionTypes.find((it) => it.id === id) || null;
  }

  // Infraction operations
  getInfractions() {
    return this.data.infractions;
  }

  getInfractionById(id: number) {
    return this.data.infractions.find((i) => i.id === id) || null;
  }

  getInfractionsByUserId(userId: number) {
    return this.data.infractions.filter((i) => i.userId === userId);
  }

  // Calendar event operations
  getCalendarEvents() {
    // Update events to current year so they appear in the calendar widget
    const currentYear = new Date().getFullYear();
    return this.data.calendarEvents.map((event) => ({
      ...event,
      start: event.start
        ? this.updateYear(event.start, currentYear)
        : undefined,
      end: event.end ? this.updateYear(event.end, currentYear) : undefined,
    }));
  }

  // Helper to update year in ISO date string
  private updateYear(dateStr: string, newYear: number): string {
    const date = new Date(dateStr);
    date.setFullYear(newYear);
    return date.toISOString();
  }

  getCalendarEventById(id: number) {
    return this.data.calendarEvents.find((ce) => ce.id === id) || null;
  }

  // Analytics data (aggregated)
  getAnalytics() {
    return {
      totalUsers: this.data.users.length,
      activeUsers: this.data.users.filter((u) => u.status === "active").length,
      totalTeams: this.data.teams.length,
      totalBrands: this.data.brands.length,
      attendanceToday: this.data.attendance.filter(
        (a) => a.date === new Date().toISOString().split("T")[0],
      ).length,
      pendingLeaves: this.data.leaveRequests.filter(
        (lr) => lr.status === "pending",
      ).length,
      pendingInfractions: this.data.infractions.filter(
        (i) => i.status === "pending",
      ).length,
    };
  }
}

export const demoStore = new DemoStore();
