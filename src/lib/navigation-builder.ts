import { PrismaClient } from "@prisma/client";
import { UserNavigation, NavigationItem } from "../types/navigation";

const prisma = new PrismaClient();

export async function buildUserNavigation({
  companyId,
  roleId,
}: {
  companyId: string;
  roleId: string;
}): Promise<UserNavigation> {
  // Get assigned navigation template for this role
  const roleNavigation = await prisma.roleNavigation.findFirst({
    where: {
      companyId,
      roleId,
      archivedAt: null,
    },
  });

  if (!roleNavigation) {
    return {
      version: 3,
      template: "default.sidebar",
      generatedAt: new Date().toISOString(),
      items: [],
    };
  }

  // Get navigation template
  const navigationTemplate =
    await prisma.featureNavigationTemplate.findUniqueOrThrow({
      where: { id: roleNavigation.navigationTemplateId },
    });

  // Get all navigation items for this template
  const allItems = await prisma.featureNavigationItem.findMany({
    where: {
      templateId: roleNavigation.navigationTemplateId,
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  // Build hierarchical tree
  const buildTree = (parentId: string | null): NavigationItem[] => {
    return allItems
      .filter((item) => item.parentId === parentId)
      .map((item) => ({
        name: item.name,
        type: item.type as "page" | "container",
        alias: item.alias ?? undefined,
        icon: item.icon ?? undefined,
        code: item.featureCode ?? undefined,
        url: item.url ?? undefined,
        children:
          buildTree(item.id).length > 0 ? buildTree(item.id) : undefined,
      }));
  };

  console.log(
    "Navigation structure built:",
    JSON.stringify(buildTree(null), null, 2),
  );

  return {
    version: 3,
    template: navigationTemplate.code,
    generatedAt: new Date().toISOString(),
    items: buildTree(null),
  };
}
