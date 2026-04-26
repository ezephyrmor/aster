import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/attendance/clock/route";
import prisma from "@/lib/db";

// Mock database
vi.mock("@/lib/db", () => ({
  default: {
    attendance: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    },
    workSchedule: {
      findFirst: vi.fn(),
    },
  },
}));

// Mock auth middleware
vi.mock("@/lib/api-auth", () => ({
  withAuth: vi.fn((handler) => handler),
}));

// Mock console.error to clean up test output
vi.spyOn(console, "error").mockImplementation(() => {});
vi.spyOn(console, "log").mockImplementation(() => {});

describe("GET /api/attendance/clock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 400 when userId is missing", async () => {
    const request = new Request("http://localhost:3000/api/attendance/clock");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("userId is required");
  });

  it("returns attendance status and schedule for user", async () => {
    // Mock date: April 25, 2026 10:00 AM Manila time (UTC+8) → 02:00 UTC
    const mockDate = new Date("2026-04-25T02:00:00.000Z");
    vi.setSystemTime(mockDate);

    const mockAttendance = {
      id: "00000000-0000-0000-0000-000000000001",
      userId: "1",
      date: new Date("2026-04-25T00:00:00.000Z"),
      clockIn: new Date("2026-04-25T01:00:00.000Z"),
      clockOut: null,
    };

    const mockSchedule = {
      id: 1,
      userId: "1",
      dayOfWeek: 5,
      startTime: "09:00",
      endTime: "18:00",
    };

    (prisma.attendance.findUnique as vi.Mock).mockResolvedValue(mockAttendance);
    (prisma.workSchedule.findFirst as vi.Mock).mockResolvedValue(mockSchedule);

    const request = new Request(
      "http://localhost:3000/api/attendance/clock?userId=1",
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.attendance.id).toEqual(mockAttendance.id);
    expect(data.attendance.userId).toEqual(mockAttendance.userId);
    expect(data.attendance.clockIn).toEqual(
      mockAttendance.clockIn.toISOString(),
    );
    expect(data.attendance.date).toEqual(mockAttendance.date.toISOString());
    expect(data.schedule).toEqual(mockSchedule);
    expect(data.canClockIn).toBe(false);
    expect(data.canClockOut).toBe(true);
  });

  it("indicates canClockIn when no attendance exists", async () => {
    const mockDate = new Date("2026-04-25T02:00:00.000Z");
    vi.setSystemTime(mockDate);

    (prisma.attendance.findUnique as vi.Mock).mockResolvedValue(null);
    (prisma.workSchedule.findFirst as vi.Mock).mockResolvedValue({ id: 1 });

    const request = new Request(
      "http://localhost:3000/api/attendance/clock?userId=1",
    );
    const response = await GET(request);
    const data = await response.json();

    expect(data.canClockIn).toBe(true);
    expect(data.canClockOut).toBe(false);
  });
});

describe("POST /api/attendance/clock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Validation", () => {
    it("returns 400 when required fields are missing", async () => {
      const request = new Request(
        "http://localhost:3000/api/attendance/clock",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it("returns 400 when type is invalid", async () => {
      const request = new Request(
        "http://localhost:3000/api/attendance/clock",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: "1", type: "invalid" }),
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });

  describe("Clock In", () => {
    it("returns 400 when user has no schedule for today", async () => {
      const mockDate = new Date("2026-04-25T02:00:00.000Z");
      vi.setSystemTime(mockDate);

      (prisma.workSchedule.findFirst as vi.Mock).mockResolvedValue(null);

      const request = new Request(
        "http://localhost:3000/api/attendance/clock",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: "1", type: "in" }),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("No work schedule found");
    });

    it("prevents clock-in more than 2 hours before scheduled start", async () => {
      // 07:00 AM Manila time (UTC 23:00 previous day)
      // Schedule starts at 09:00 AM → earliest clock-in is 07:00 AM
      // Testing at 06:59 AM which is 1 minute too early
      const mockDate = new Date("2026-04-24T22:59:00.000Z");
      vi.setSystemTime(mockDate);

      (prisma.workSchedule.findFirst as vi.Mock).mockResolvedValue({
        id: 1,
        userId: "1",
        dayOfWeek: 5,
        startTime: "09:00",
        endTime: "18:00",
      });

      const request = new Request(
        "http://localhost:3000/api/attendance/clock",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: "1", type: "in" }),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Cannot clock in yet");
    });

    it("allows clock-in exactly 2 hours before schedule", async () => {
      // 07:00 AM Manila time exactly
      const mockDate = new Date("2026-04-24T23:00:00.000Z");
      vi.setSystemTime(mockDate);

      (prisma.workSchedule.findFirst as vi.Mock).mockResolvedValue({
        id: 1,
        userId: "1",
        dayOfWeek: 5,
        startTime: "09:00",
        endTime: "18:00",
      });

      (prisma.attendance.upsert as vi.Mock).mockResolvedValue({
        id: 1,
        clockIn: mockDate,
        clockOut: null,
      });

      const request = new Request(
        "http://localhost:3000/api/attendance/clock",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: "1", type: "in" }),
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it("calculates late minutes correctly when clocking in after start time", async () => {
      // 09:15 AM Manila time → 15 minutes late
      const mockDate = new Date("2026-04-25T01:15:00.000Z");
      vi.setSystemTime(mockDate);

      (prisma.workSchedule.findFirst as vi.Mock).mockResolvedValue({
        id: 1,
        userId: "1",
        dayOfWeek: 5,
        startTime: "09:00",
        endTime: "18:00",
      });

      (prisma.attendance.upsert as vi.Mock).mockResolvedValue({
        id: 1,
        clockIn: mockDate,
        clockOut: null,
        lateMinutes: 15,
      });

      const request = new Request(
        "http://localhost:3000/api/attendance/clock",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: "1", type: "in" }),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.lateMinutes).toBe(15);
    });

    it("prevents duplicate clock-in", async () => {
      const mockDate = new Date("2026-04-25T01:00:00.000Z");
      vi.setSystemTime(mockDate);

      (prisma.workSchedule.findFirst as vi.Mock).mockResolvedValue({
        id: 1,
        startTime: "09:00",
      });

      // Existing clock-in is different from current time
      (prisma.attendance.upsert as vi.Mock).mockResolvedValue({
        id: 1,
        clockIn: new Date("2026-04-25T00:30:00.000Z"),
        clockOut: null,
      });

      const request = new Request(
        "http://localhost:3000/api/attendance/clock",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: "1", type: "in" }),
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });

  describe("Clock Out", () => {
    it("returns 400 when no clock-in record exists", async () => {
      const mockDate = new Date("2026-04-25T10:00:00.000Z");
      vi.setSystemTime(mockDate);

      (prisma.attendance.findUnique as vi.Mock).mockResolvedValue(null);

      const request = new Request(
        "http://localhost:3000/api/attendance/clock",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: "1", type: "out" }),
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it("prevents duplicate clock-out", async () => {
      const mockDate = new Date("2026-04-25T10:00:00.000Z");
      vi.setSystemTime(mockDate);

      (prisma.attendance.findUnique as vi.Mock).mockResolvedValue({
        id: 1,
        userId: "1",
        date: new Date(),
        clockIn: new Date("2026-04-25T01:00:00.000Z"),
        clockOut: new Date("2026-04-25T09:00:00.000Z"),
      });

      const request = new Request(
        "http://localhost:3000/api/attendance/clock",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: "1", type: "out" }),
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it("requires reason for early clock-out", async () => {
      // 17:00 Manila time, schedule ends at 18:00 → 60 minutes early
      const mockDate = new Date("2026-04-25T09:00:00.000Z");
      vi.setSystemTime(mockDate);

      (prisma.attendance.findUnique as vi.Mock).mockResolvedValue({
        id: 1,
        clockIn: new Date("2026-04-25T01:00:00.000Z"),
        clockOut: null,
      });

      (prisma.workSchedule.findFirst as vi.Mock).mockResolvedValue({
        id: 1,
        endTime: "18:00",
      });

      const request = new Request(
        "http://localhost:3000/api/attendance/clock",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: "1", type: "out" }),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Early clock-out requires a reason");
      expect(data.earlyMinutes).toBe(60);
    });

    it("allows early clock-out when reason is provided", async () => {
      // 17:00 Manila time, schedule ends at 18:00
      const mockDate = new Date("2026-04-25T09:00:00.000Z");
      vi.setSystemTime(mockDate);

      (prisma.attendance.findUnique as vi.Mock).mockResolvedValue({
        id: 1,
        clockIn: new Date("2026-04-25T01:00:00.000Z"),
        clockOut: null,
      });

      (prisma.workSchedule.findFirst as vi.Mock).mockResolvedValue({
        id: 1,
        endTime: "18:00",
      });

      (prisma.attendance.update as vi.Mock).mockResolvedValue({
        id: 1,
        clockOut: mockDate,
        undertimeMinutes: 60,
      });

      const request = new Request(
        "http://localhost:3000/api/attendance/clock",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: "1",
            type: "out",
            reason: "Medical appointment",
          }),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.undertimeMinutes).toBe(60);
      expect(data.isEarlyClockOut).toBe(true);
    });

    it("calculates undertime correctly for early clock-out", async () => {
      // 17:30 Manila time → 30 minutes early
      const mockDate = new Date("2026-04-25T09:30:00.000Z");
      vi.setSystemTime(mockDate);

      (prisma.attendance.findUnique as vi.Mock).mockResolvedValue({
        id: 1,
        clockIn: new Date("2026-04-25T01:00:00.000Z"),
        clockOut: null,
      });

      (prisma.workSchedule.findFirst as vi.Mock).mockResolvedValue({
        id: 1,
        endTime: "18:00",
      });

      (prisma.attendance.update as vi.Mock).mockImplementation((_args: any) =>
        Promise.resolve({
          id: 1,
          clockOut: mockDate,
          undertimeMinutes: 30,
        }),
      );

      const request = new Request(
        "http://localhost:3000/api/attendance/clock",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: "1",
            type: "out",
            reason: "Personal errand",
          }),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.undertimeMinutes).toBe(30);
    });
  });
});
