import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/schedules/route";
import prisma from "@/lib/db";

// Mock database
vi.mock("@/lib/db", () => ({
  default: {
    workSchedule: {
      count: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Mock auth middleware
vi.mock("@/lib/api-auth", () => ({
  withAuth: vi.fn((handler) => handler),
}));

vi.spyOn(console, "error").mockImplementation(() => {});

describe("GET /api/schedules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated schedules scoped to company", async () => {
    const mockSchedules = [
      {
        id: 1,
        userId: 1,
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "18:00",
        user: { employeeProfile: { firstName: "John", lastName: "Doe" } },
      },
    ];

    (prisma.workSchedule.count as vi.Mock).mockResolvedValue(1);
    (prisma.workSchedule.findMany as vi.Mock).mockResolvedValue(mockSchedules);

    const request = new Request("http://localhost:3000/api/schedules");
    const response = await GET(request, {}, { user: { companyId: 1 } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.schedules).toHaveLength(1);
    expect(prisma.workSchedule.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ companyId: 1 }),
      }),
    );
  });

  it("filters schedules by specific date and extracts day of week", async () => {
    (prisma.workSchedule.count as vi.Mock).mockResolvedValue(0);
    (prisma.workSchedule.findMany as vi.Mock).mockResolvedValue([]);

    // Wednesday (day 3) - 2026-05-06
    const request = new Request(
      "http://localhost:3000/api/schedules?date=2026-05-06",
    );
    await GET(request, {}, { user: { companyId: 1 } });

    expect(prisma.workSchedule.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          dayOfWeek: 3,
          effectiveFrom: { lte: new Date("2026-05-06") },
          OR: expect.arrayContaining([
            { effectiveTo: null },
            { effectiveTo: { gte: new Date("2026-05-06") } },
          ]),
        }),
      }),
    );
  });

  it("applies search filter on employee name and username", async () => {
    (prisma.workSchedule.count as vi.Mock).mockResolvedValue(0);
    (prisma.workSchedule.findMany as vi.Mock).mockResolvedValue([]);

    const request = new Request(
      "http://localhost:3000/api/schedules?search=john",
    );
    await GET(request, {}, { user: { companyId: 1 } });

    expect(prisma.workSchedule.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          user: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ username: expect.anything() }),
            ]),
          }),
        }),
      }),
    );
  });

  it("filters by team membership", async () => {
    (prisma.workSchedule.count as vi.Mock).mockResolvedValue(0);
    (prisma.workSchedule.findMany as vi.Mock).mockResolvedValue([]);

    const request = new Request(
      "http://localhost:3000/api/schedules?team=Engineering",
    );
    await GET(request, {}, { user: { companyId: 1 } });

    expect(prisma.workSchedule.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          user: expect.objectContaining({
            teamMembers: expect.objectContaining({
              some: expect.objectContaining({
                team: expect.objectContaining({
                  name: { equals: "Engineering" },
                }),
              }),
            }),
          }),
        }),
      }),
    );
  });
});

describe("POST /api/schedules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.workSchedule.findFirst as vi.Mock).mockResolvedValue(null);
  });

  it("returns 400 when required fields are missing", async () => {
    const request = new Request("http://localhost:3000/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("validates day of week is between 0 and 6", async () => {
    const request = new Request("http://localhost:3000/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: 1,
        dayOfWeek: 7, // Invalid value
        startTime: "09:00",
        endTime: "18:00",
        effectiveFrom: "2026-05-01",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("Invalid day of week");
  });

  it("validates time format is HH:MM", async () => {
    const request = new Request("http://localhost:3000/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: 1,
        dayOfWeek: 1,
        startTime: "9:00", // Invalid format
        endTime: "6:00 PM", // Invalid format
        effectiveFrom: "2026-05-01",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid time format. Use HH:MM (24-hour format)");
  });

  it("validates effectiveTo date is after effectiveFrom", async () => {
    const request = new Request("http://localhost:3000/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: 1,
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "18:00",
        effectiveFrom: "2026-05-10",
        effectiveTo: "2026-05-05", // Earlier than from date
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe(
      "Effective end date must be after effective start date",
    );
  });

  it("prevents conflicting active schedules for same day", async () => {
    (prisma.workSchedule.findFirst as vi.Mock).mockResolvedValue({ id: 1 });

    const request = new Request("http://localhost:3000/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: 1,
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "18:00",
        effectiveFrom: "2026-05-01",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("creates schedule successfully with valid data", async () => {
    const mockSchedule = {
      id: 1,
      userId: 1,
      dayOfWeek: 1,
      startTime: "09:00",
      endTime: "18:00",
      breakMinutes: 60,
      effectiveFrom: new Date("2026-05-01"),
    };

    (prisma.workSchedule.create as vi.Mock).mockResolvedValue(mockSchedule);

    const request = new Request("http://localhost:3000/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: 1,
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "18:00",
        breakMinutes: 60,
        effectiveFrom: "2026-05-01",
        effectiveTo: null,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(prisma.workSchedule.create).toHaveBeenCalled();
  });
});
