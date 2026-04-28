import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/brands/route";
import prisma from "@/lib/db";
import { withAuth } from "@/lib/api-auth";

// Mock dependencies
vi.mock("@/lib/db", () => ({
  default: {
    brand: {
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    industry: {
      findMany: vi.fn(),
    },
  },
}));

// Mock auth middleware to bypass auth for unit testing
vi.mock("@/lib/api-auth", () => ({
  withAuth: vi.fn((handler) => {
    return (request: Request) =>
      handler(request, {}, { user: { companyId: "1", id: 1 } });
  }),
}));

vi.mock("@/lib/validations", () => ({
  withValidation: vi.fn(
    (_schema, handler) => (request: Request) =>
      request.json().then((data) => handler(data)),
  ),
  CreateBrandSchema: {},
}));

describe("GET /api/brands", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns paginated brands for current company", async () => {
    const mockBrands = [
      {
        id: 1,
        name: "Test Brand",
        companyId: "1",
        industry: { name: "Technology" },
        company: { id: 1, name: "Test Company" },
        manager: null,
        _count: { teams: 2 },
      },
    ];

    (prisma.brand.count as vi.Mock).mockResolvedValue(1);
    (prisma.brand.findMany as vi.Mock).mockResolvedValue(mockBrands);
    (prisma.industry.findMany as vi.Mock).mockResolvedValue([
      { name: "Technology" },
      { name: "Healthcare" },
    ]);

    const request = new Request("http://localhost:3000/api/brands");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.brands).toHaveLength(1);
    expect(data.pagination.total).toBe(1);
    expect(data.industries).toEqual(["Technology", "Healthcare"]);
    expect(prisma.brand.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { companyId: "1" },
      }),
    );
  });

  it("applies search filter correctly", async () => {
    (prisma.brand.count as vi.Mock).mockResolvedValue(0);
    (prisma.brand.findMany as vi.Mock).mockResolvedValue([]);
    (prisma.industry.findMany as vi.Mock).mockResolvedValue([]);

    const request = new Request("http://localhost:3000/api/brands?search=test");
    await GET(request);

    expect(prisma.brand.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [{ companyId: "1" }, { name: { contains: "test" } }],
        },
      }),
    );
  });

  it("handles pagination parameters", async () => {
    (prisma.brand.count as vi.Mock).mockResolvedValue(25);
    (prisma.brand.findMany as vi.Mock).mockResolvedValue([]);
    (prisma.industry.findMany as vi.Mock).mockResolvedValue([]);

    const request = new Request(
      "http://localhost:3000/api/brands?page=2&limit=5",
    );
    const response = await GET(request);
    const data = await response.json();

    expect(data.pagination.page).toBe(2);
    expect(data.pagination.limit).toBe(5);
    expect(data.pagination.totalPages).toBe(5);
    expect(prisma.brand.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 5,
        take: 5,
      }),
    );
  });

  it("returns 500 on database error", async () => {
    (prisma.brand.count as vi.Mock).mockRejectedValue(
      new Error("Database error"),
    );

    const request = new Request("http://localhost:3000/api/brands");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to fetch brands");
  });
});

describe("POST /api/brands", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("creates brand successfully when name is unique", async () => {
    const brandData = {
      name: "New Brand",
      description: "Brand description",
      industryId: "1",
    };

    const createdBrand = {
      id: 1,
      ...brandData,
      industry: { name: "Technology" },
      manager: null,
    };

    (prisma.brand.findUnique as vi.Mock).mockResolvedValue(null);
    (prisma.brand.create as vi.Mock).mockResolvedValue(createdBrand);

    const request = new Request("http://localhost:3000/api/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(brandData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.name).toBe("New Brand");
    expect(prisma.brand.create).toHaveBeenCalled();
  });

  it("returns 400 when brand name already exists", async () => {
    const brandData = {
      name: "Existing Brand",
      description: "Brand description",
    };

    (prisma.brand.findUnique as vi.Mock).mockResolvedValue({
      id: 1,
      name: "Existing Brand",
    });

    const request = new Request("http://localhost:3000/api/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(brandData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Brand name already exists");
    expect(prisma.brand.create).not.toHaveBeenCalled();
  });

  it("returns 500 on database error during creation", async () => {
    const brandData = {
      name: "New Brand",
      description: "Brand description",
    };

    (prisma.brand.findUnique as vi.Mock).mockResolvedValue(null);
    (prisma.brand.create as vi.Mock).mockRejectedValue(
      new Error("Database error"),
    );

    const request = new Request("http://localhost:3000/api/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(brandData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to create brand");
  });
});
