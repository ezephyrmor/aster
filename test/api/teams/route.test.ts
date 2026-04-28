import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/teams/route";
import prisma from "@/lib/db";

// Mock dependencies
vi.mock("@/lib/db", () => ({
  default: {
    team: {
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    brand: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    teamMember: {
      create: vi.fn(),
    },
    teamHistory: {
      create: vi.fn(),
    },
  },
}));

// Mock auth middleware
vi.mock("@/lib/api-auth", () => ({
  withAuth: vi.fn((handler) => {
    return (request: Request) =>
      handler(request, {}, { user: { companyId: "1", id: 1 } });
  }),
}));

describe("GET /api/teams", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns paginated teams for current company", async () => {
    const mockTeams = [
      {
        id: 1,
        name: "Engineering Team",
        companyId: "1",
        brandId: "1",
        brand: { id: 1, name: "Test Brand" },
        members: [],
        _count: { members: 3 },
      },
    ];

    (prisma.team.count as vi.Mock).mockResolvedValue(1);
    (prisma.team.findMany as vi.Mock).mockResolvedValue(mockTeams);
    (prisma.brand.findMany as vi.Mock).mockResolvedValue([
      { id: 1, name: "Test Brand" },
    ]);

    const request = new Request("http://localhost:3000/api/teams");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.teams).toHaveLength(1);
    expect(data.pagination.total).toBe(1);
    expect(data.brands).toHaveLength(1);
    expect(prisma.team.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { companyId: "1" },
      }),
    );
  });

  it("applies brand filter correctly", async () => {
    (prisma.team.count as vi.Mock).mockResolvedValue(0);
    (prisma.team.findMany as vi.Mock).mockResolvedValue([]);
    (prisma.brand.findMany as vi.Mock).mockResolvedValue([]);

    const request = new Request("http://localhost:3000/api/teams?brandId=5");
    await GET(request);

    expect(prisma.team.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [{ companyId: "1" }, { brandId: "5" }],
        },
      }),
    );
  });

  it("applies search filter correctly", async () => {
    (prisma.team.count as vi.Mock).mockResolvedValue(0);
    (prisma.team.findMany as vi.Mock).mockResolvedValue([]);
    (prisma.brand.findMany as vi.Mock).mockResolvedValue([]);

    const request = new Request("http://localhost:3000/api/teams?search=dev");
    await GET(request);

    expect(prisma.team.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [{ companyId: "1" }, { name: { contains: "dev" } }],
        },
      }),
    );
  });

  it("returns 500 on database error", async () => {
    (prisma.team.count as vi.Mock).mockRejectedValue(
      new Error("Database error"),
    );

    const request = new Request("http://localhost:3000/api/teams");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to fetch teams");
  });
});

describe("POST /api/teams", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("creates team successfully with valid data", async () => {
    const teamData = {
      name: "New Team",
      description: "Team description",
      brandId: "1",
    };

    const createdTeam = {
      id: "1",
      ...teamData,
      companyId: "1",
    };

    (prisma.brand.findUnique as vi.Mock).mockResolvedValue({
      id: 1,
      name: "Test Brand",
    });
    (prisma.team.findUnique as vi.Mock).mockResolvedValue(null);
    (prisma.team.create as vi.Mock).mockResolvedValue(createdTeam);
    (prisma.teamHistory.create as vi.Mock).mockResolvedValue({});

    const request = new Request("http://localhost:3000/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(teamData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.name).toBe("New Team");
    expect(prisma.team.create).toHaveBeenCalled();
    expect(prisma.teamHistory.create).toHaveBeenCalled();
  });

  it("returns 400 when team name is missing", async () => {
    const teamData = {
      description: "Team description",
      brandId: "1",
    };

    const request = new Request("http://localhost:3000/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(teamData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Team name is required");
    expect(prisma.team.create).not.toHaveBeenCalled();
  });

  it("returns 400 when brandId is missing", async () => {
    const teamData = {
      name: "New Team",
      description: "Team description",
    };

    const request = new Request("http://localhost:3000/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(teamData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Brand is required");
    expect(prisma.team.create).not.toHaveBeenCalled();
  });

  it("returns 400 when brand does not exist", async () => {
    const teamData = {
      name: "New Team",
      description: "Team description",
      brandId: "999",
    };

    (prisma.brand.findUnique as vi.Mock).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(teamData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Brand not found");
    expect(prisma.team.create).not.toHaveBeenCalled();
  });

  it("returns 400 when team name already exists", async () => {
    const teamData = {
      name: "Existing Team",
      description: "Team description",
      brandId: "1",
    };

    (prisma.brand.findUnique as vi.Mock).mockResolvedValue({
      id: 1,
      name: "Test Brand",
    });
    (prisma.team.findUnique as vi.Mock).mockResolvedValue({
      id: 1,
      name: "Existing Team",
    });

    const request = new Request("http://localhost:3000/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(teamData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Team name already exists");
    expect(prisma.team.create).not.toHaveBeenCalled();
  });

  it("creates team and adds leader when leaderId is provided", async () => {
    const teamData = {
      name: "New Team",
      description: "Team description",
      brandId: "1",
      leaderId: "5",
      performedBy: 2,
    };

    const createdTeam = {
      id: "1",
      ...teamData,
      companyId: "1",
    };

    (prisma.brand.findUnique as vi.Mock).mockResolvedValue({
      id: 1,
      name: "Test Brand",
    });
    (prisma.team.findUnique as vi.Mock).mockResolvedValue(null);
    (prisma.team.create as vi.Mock).mockResolvedValue(createdTeam);
    (prisma.teamMember.create as vi.Mock).mockResolvedValue({});
    (prisma.teamHistory.create as vi.Mock).mockResolvedValue({});

    const request = new Request("http://localhost:3000/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(teamData),
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(prisma.teamMember.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          teamId: "1",
          userId: "5",
          isLeader: true,
        },
      }),
    );
    expect(prisma.teamHistory.create).toHaveBeenCalledTimes(2);
  });
});
