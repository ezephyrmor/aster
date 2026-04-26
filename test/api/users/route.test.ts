import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/users/route";
import prisma from "@/lib/db";
import { hashPassword, generateSalt } from "@/lib/password";
import { generateUsername, generatePassword } from "@/lib/userGenerator";

// Mock dependencies
vi.mock("@/lib/db", () => ({
  default: {
    user: {
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    role: {
      findUnique: vi.fn(),
    },
    position: {
      findUnique: vi.fn(),
    },
    department: {
      findUnique: vi.fn(),
    },
    employeeStatusModel: {
      findUnique: vi.fn(),
    },
    employeeStatusHistory: {
      create: vi.fn(),
    },
    $transaction: vi.fn((callback) =>
      callback({
        user: {
          create: vi.fn().mockResolvedValue({
            id: 1,
            username: "testuser",
            employeeProfile: {
              id: 1,
              firstName: "John",
              lastName: "Doe",
              hireDate: new Date("2026-01-01"),
            },
          }),
        },
        employeeStatusHistory: {
          create: vi.fn(),
        },
      }),
    ),
  },
}));

vi.mock("@/lib/password", () => ({
  hashPassword: vi.fn().mockResolvedValue("hashed_password"),
  generateSalt: vi.fn().mockReturnValue("random_salt"),
}));

vi.mock("@/lib/userGenerator", () => ({
  generateUsername: vi.fn().mockReturnValue("john.doe"),
  generatePassword: vi.fn().mockReturnValue("generated_pass_123"),
}));

// Mock auth middleware
vi.mock("@/lib/api-auth", () => ({
  withAuth: vi.fn((handler) => {
    return (request: Request, context: any) =>
      handler(request, context, { user: { companyId: 1, id: 1 } });
  }),
}));

vi.mock("@/lib/validations", () => ({
  withValidation: vi.fn(
    (_schema, handler) => (request: Request) =>
      request
        .json()
        .then((data) =>
          handler(data, request, {}, { user: { companyId: 1, id: 1 } }),
        ),
  ),
  CreateUserSchema: {},
}));

describe("GET /api/users", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns paginated users scoped to current company", async () => {
    const mockUsers = [
      {
        id: 1,
        username: "john.doe",
        companyId: 1,
        employeeProfile: {
          firstName: "John",
          lastName: "Doe",
          role: { name: "Admin" },
          status: { name: "Active" },
        },
        teamMembers: [],
        company: { id: 1, name: "Test Company" },
      },
    ];

    (prisma.user.count as vi.Mock).mockResolvedValue(1);
    (prisma.user.findMany as vi.Mock).mockResolvedValue(mockUsers);

    const request = new Request("http://localhost:3000/api/users");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.users).toHaveLength(1);
    expect(data.pagination.total).toBe(1);
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { companyId: 1 },
      }),
    );
  });

  it("applies search filter on first and last name", async () => {
    (prisma.user.count as vi.Mock).mockResolvedValue(0);
    (prisma.user.findMany as vi.Mock).mockResolvedValue([]);

    const request = new Request("http://localhost:3000/api/users?search=john");
    await GET(request);

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          companyId: 1,
          AND: {
            OR: [
              { employeeProfile: { firstName: { contains: "john" } } },
              { employeeProfile: { lastName: { contains: "john" } } },
            ],
          },
        },
      }),
    );
  });

  it("applies role filter correctly", async () => {
    (prisma.user.count as vi.Mock).mockResolvedValue(0);
    (prisma.user.findMany as vi.Mock).mockResolvedValue([]);

    const request = new Request("http://localhost:3000/api/users?role=Admin");
    await GET(request);

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          companyId: 1,
          AND: { employeeProfile: { role: { name: "Admin" } } },
        },
      }),
    );
  });
});

describe("POST /api/users", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("creates user successfully with minimum required data", async () => {
    const userData = {
      firstName: "John",
      lastName: "Doe",
      role: 2,
    };

    (prisma.user.findUnique as vi.Mock).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(generateUsername).toHaveBeenCalledWith("John", "Doe");
    expect(generatePassword).toHaveBeenCalledWith(12);
    expect(hashPassword).toHaveBeenCalled();
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it("returns 400 when username already exists", async () => {
    const userData = {
      firstName: "John",
      lastName: "Doe",
      username: "existing.user",
      role: 2,
    };

    (prisma.user.findUnique as vi.Mock).mockResolvedValue({
      id: 1,
      username: "existing.user",
    });

    const request = new Request("http://localhost:3000/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Username already exists. Please try again.");
  });

  it("generates unique username by checking for existing", async () => {
    const userData = {
      firstName: "John",
      lastName: "Doe",
      role: 2,
    };

    let callCount = 0;
    (prisma.user.findUnique as vi.Mock).mockImplementation(() => {
      callCount++;
      return callCount <= 2 ? { id: callCount, username: "john.doe" } : null;
    });

    const request = new Request("http://localhost:3000/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    await POST(request);

    expect(prisma.user.findUnique).toHaveBeenCalledTimes(4);
    expect(generateUsername).toHaveBeenCalledTimes(3);
  });
});
