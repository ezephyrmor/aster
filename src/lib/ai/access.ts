/**
 * Tenant-scoped access helpers for the sticker generator routes.
 */
import { currentUser } from "@/lib/tenant-prisma";
import type { PrismaClient } from "@prisma/client";

export type ScopedCtx = {
  prisma: PrismaClient;
  companyId: string;
  userId: string;
};

/** Resolve the authenticated user + scoped Prisma client. */
export async function getScopedCtx(): Promise<ScopedCtx> {
  const { prisma, user } = await currentUser();
  return {
    prisma: prisma as unknown as PrismaClient,
    companyId: user.companyId,
    userId: user.id,
  };
}

/**
 * Load a pack owned by the current tenant. Throws a typed error if the pack
 * does not belong to the tenant (cross-company access).
 */
export async function loadTenantPack(ctx: ScopedCtx, packId: string) {
  const pack = await ctx.prisma.stickerPack.findFirst({
    where: { id: packId, companyId: ctx.companyId },
    include: { items: { include: { asset: true } }, assets: true },
  });
  if (!pack) {
    throw new PackNotFoundError();
  }
  return pack;
}

export class PackNotFoundError extends Error {
  constructor() {
    super("Pack not found");
    this.name = "PackNotFoundError";
  }
}