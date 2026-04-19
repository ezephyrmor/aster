import prisma from "@/lib/db";
import { auth } from "@/lib/next-auth";

/**
 * Creates a tenant scoped Prisma client that automatically filters all queries by companyId
 *
 * This client CANNOT return or modify data from any other company.
 * All queries, creates, updates and deletes are automatically scoped.
 *
 * @param companyId - The company id to scope all operations to
 * @returns Prisma client scoped to the specified company
 */
export function getScopedPrisma(companyId: number) {
  // List of all tables that are tenant scoped
  const tenantTables = [
    "user",
    "brand",
    "team",
    "teamMember",
    "employeeProfile",
    "calendarEvent",
    "leaveCredit",
    "leaveRequest",
    "leaveUsage",
    "workSchedule",
    "attendance",
    "infraction",
    "brandManagerHistory",
    "teamHistory",
    "position",
    "department",
    "role",
    "leaveType",
    "infractionType",
    "infractionOffense",
  ];

  const scopedPrisma = new Proxy(prisma, {
    get(target, prop: string) {
      const original = target[prop as keyof typeof target];

      if (!tenantTables.includes(prop)) {
        return original;
      }

      // Create proxy for each model
      return new Proxy(original, {
        get(modelTarget, methodName: string) {
          const originalMethod =
            modelTarget[methodName as keyof typeof modelTarget];

          if (typeof originalMethod !== "function") {
            return originalMethod;
          }

          return function (...args: any[]) {
            let options = args[0] || {};

            // Modify query based on method
            switch (methodName) {
              case "findUnique":
              case "findUniqueOrThrow":
              case "findFirst":
              case "findFirstOrThrow":
              case "findMany":
              case "count":
              case "aggregate":
              case "groupBy":
                // Add company filter to WHERE clause
                options.where = {
                  ...options.where,
                  companyId,
                };
                break;

              case "create":
                // Automatically set companyId on create
                options.data = {
                  ...options.data,
                  companyId,
                };
                break;

              case "createMany":
                // Automatically set companyId on all records
                options.data = options.data.map((item: any) => ({
                  ...item,
                  companyId,
                }));
                break;

              case "update":
              case "updateMany":
              case "delete":
              case "deleteMany":
              case "upsert":
                // Always include companyId in filter
                options.where = {
                  ...options.where,
                  companyId,
                };
                break;
            }

            args[0] = options;
            return originalMethod.apply(modelTarget, args);
          };
        },
      });
    },
  });

  return scopedPrisma;
}

/**
 * Get current authenticated user and scoped prisma client
 *
 * Usage:
 * const { user, prisma } = await currentUser();
 * const users = await prisma.user.findMany(); // Automatically filtered to user's company
 *
 * @returns Current user and tenant scoped prisma client
 */
export async function currentUser() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return {
    user: session.user,
    prisma: getScopedPrisma(session.user.companyId),
  };
}
