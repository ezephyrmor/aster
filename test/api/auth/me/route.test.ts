import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/auth/me/route";
import { auth } from "@/lib/next-auth";
import prisma from "@/lib/db";

// Mock the dependencies
vi.mock("@/lib/next-auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

describe("GET /api/auth/me", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console.error during tests
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns 401 when user is not authenticated", async () => {
    (auth as vi.Mock).mockResolvedValue(null);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Not authenticated");
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("returns 404 when user exists in session but not in database", async () => {
    (auth as vi.Mock).mockResolvedValue({
      user: { id: "999" },
    });

    (prisma.user.findUnique as vi.Mock).mockResolvedValue(null);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("User not found");
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "999" },
      include: expect.anything(),
    });
  });

  it("returns user data with role when authenticated and user exists", async () => {
    const mockUser = {
      id: "1",
      username: "testuser",
      employeeProfile: {
        roleId: "2",
        role: {
          id: "2",
          name: "Admin",
        },
      },
    };

    (auth as vi.Mock).mockResolvedValue({
      user: { id: "1" },
    });

    (prisma.user.findUnique as vi.Mock).mockResolvedValue(mockUser);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.user).toEqual({
      id: "1",
      username: "testuser",
      roleId: "2",
      role: {
        id: "2",
        name: "Admin",
      },
    });
  });

  it("returns user data without role when employee profile does not exist", async () => {
    const mockUser = {
      id: "1",
      username: "testuser",
      employeeProfile: null,
    };

    (auth as vi.Mock).mockResolvedValue({
      user: { id: "1" },
    });

    (prisma.user.findUnique as vi.Mock).mockResolvedValue(mockUser);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.user.roleId).toBeUndefined();
    expect(data.user.role).toBeUndefined();
  });

  it("returns 500 when database error occurs", async () => {
    (auth as vi.Mock).mockResolvedValue({
      user: { id: "1" },
    });

    (prisma.user.findUnique as vi.Mock).mockRejectedValue(
      new Error("Database error"),
    );

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
    expect(console.error).toHaveBeenCalled();
  });
});
