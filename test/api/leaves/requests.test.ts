import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/leaves/requests/route";
import prisma from "@/lib/db";
import { auth } from "@/lib/next-auth";

// Mock database
vi.mock("@/lib/db", () => ({
  default: {
    leaveRequest: {
      count: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    teamMember: {
      findMany: vi.fn(),
    },
    leaveCredit: {
      findMany: vi.fn(),
    },
    leaveStatus: {
      findFirst: vi.fn(),
    },
  },
}));

// Mock auth
vi.mock("@/lib/next-auth", () => ({
  auth: vi.fn(),
}));

// Mock auth middleware
vi.mock("@/lib/api-auth", () => ({
  withAuth: vi.fn((handler) => handler),
}));

vi.spyOn(console, "error").mockImplementation(() => {});

describe("GET /api/leaves/requests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated leave requests scoped to company", async () => {
    const mockRequests = [
      {
        id: 1,
        userId: 1,
        startDate: new Date(),
        endDate: new Date(),
        user: { employeeProfile: { firstName: "John", lastName: "Doe" } },
      },
    ];

    (prisma.leaveRequest.count as vi.Mock).mockResolvedValue(1);
    (prisma.leaveRequest.findMany as vi.Mock).mockResolvedValue(mockRequests);

    const request = new Request("http://localhost:3000/api/leaves/requests");
    const response = await GET(request, {}, { user: { companyId: 1 } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.requests).toHaveLength(1);
    expect(prisma.leaveRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ companyId: 1 }),
      }),
    );
  });

  it("applies search filter on user name and username", async () => {
    (prisma.leaveRequest.count as vi.Mock).mockResolvedValue(0);
    (prisma.leaveRequest.findMany as vi.Mock).mockResolvedValue([]);

    const request = new Request(
      "http://localhost:3000/api/leaves/requests?search=john",
    );
    await GET(request, {}, { user: { companyId: 1 } });

    expect(prisma.leaveRequest.findMany).toHaveBeenCalledWith(
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

  it("filters by team members when teamId is provided", async () => {
    const mockTeamMembers = [{ userId: 1 }, { userId: 2 }, { userId: 3 }];

    (prisma.teamMember.findMany as vi.Mock).mockResolvedValue(mockTeamMembers);
    (prisma.leaveRequest.count as vi.Mock).mockResolvedValue(0);
    (prisma.leaveRequest.findMany as vi.Mock).mockResolvedValue([]);

    const request = new Request(
      "http://localhost:3000/api/leaves/requests?teamId=5",
    );
    await GET(request, {}, { user: { companyId: 1 } });

    expect(prisma.teamMember.findMany).toHaveBeenCalled();
    expect(prisma.leaveRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: { in: [1, 2, 3] },
        }),
      }),
    );
  });

  it("validates sort fields and falls back to createdAt", async () => {
    (prisma.leaveRequest.count as vi.Mock).mockResolvedValue(0);
    (prisma.leaveRequest.findMany as vi.Mock).mockResolvedValue([]);

    const request = new Request(
      "http://localhost:3000/api/leaves/requests?sortBy=invalid_field",
    );
    await GET(request, {}, { user: { companyId: 1 } });

    expect(prisma.leaveRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: "desc" },
      }),
    );
  });
});

describe("POST /api/leaves/requests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (auth as vi.Mock).mockResolvedValue({ user: { companyId: 1 } });
    (prisma.leaveStatus.findFirst as vi.Mock).mockResolvedValue({
      id: 1,
      name: "Pending",
    });
    (prisma.leaveRequest.findFirst as vi.Mock).mockResolvedValue(null);
  });

  it("returns 400 when required fields are missing", async () => {
    const request = new Request("http://localhost:3000/api/leaves/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("validates end date is after start date", async () => {
    const request = new Request("http://localhost:3000/api/leaves/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: 1,
        leaveTypeId: 2,
        startDate: "2026-05-10",
        endDate: "2026-05-05",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("End date must be after start date");
  });

  it("validates sufficient leave credits for paid leaves", async () => {
    // Request 3 days leave but only have 2 credits
    (prisma.leaveCredit.findMany as vi.Mock).mockResolvedValue([{}, {}]);

    const request = new Request("http://localhost:3000/api/leaves/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: 1,
        leaveTypeId: 2,
        startDate: "2026-05-05",
        endDate: "2026-05-07",
        isPaid: true,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Insufficient leave credits");
    expect(data.availableCredits).toBe(2);
    expect(data.requestedDays).toBe(3);
  });

  it("prevents overlapping approved leave requests", async () => {
    (prisma.leaveRequest.findFirst as vi.Mock).mockResolvedValue({ id: 1 });

    const request = new Request("http://localhost:3000/api/leaves/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: 1,
        leaveTypeId: 2,
        startDate: "2026-05-10",
        endDate: "2026-05-12",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("prevents duplicate pending requests", async () => {
    // First call for approved, second for pending
    (prisma.leaveRequest.findFirst as vi.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 2 });

    const request = new Request("http://localhost:3000/api/leaves/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: 1,
        leaveTypeId: 2,
        startDate: "2026-05-10",
        endDate: "2026-05-12",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("creates leave request successfully with valid data", async () => {
    const mockLeaveData = {
      id: 1,
      userId: 1,
      leaveTypeId: 2,
      startDate: new Date("2026-05-10"),
      endDate: new Date("2026-05-12"),
      statusId: 1,
    };

    (prisma.leaveRequest.create as vi.Mock).mockResolvedValue(mockLeaveData);
    (prisma.leaveCredit.findMany as vi.Mock).mockResolvedValue([
      {},
      {},
      {},
      {},
    ]);

    // Clear default mock and mock all 3 duplicate/overlap checks
    (prisma.leaveRequest.findFirst as vi.Mock).mockReset();
    (prisma.leaveRequest.findFirst as vi.Mock)
      .mockResolvedValueOnce(null) // Approved overlap
      .mockResolvedValueOnce(null) // Pending overlap
      .mockResolvedValueOnce(null); // Exact duplicate

    const request = new Request("http://localhost:3000/api/leaves/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: 1,
        leaveTypeId: 2,
        startDate: "2026-05-10",
        endDate: "2026-05-12",
        reason: "Vacation leave",
        isPaid: true,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(prisma.leaveRequest.create).toHaveBeenCalled();
  });
});
