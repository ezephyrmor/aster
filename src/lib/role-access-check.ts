import prisma from "@/lib/db";

interface PageAccessResult {
  authorized: boolean;
  reason?: string;
}

/**
 * Role ID that bypasses all page access checks.
 * Set this to the UUID of the super admin role in your database.
 */
const SUPER_ADMIN_ROLE_ID = "00000000-0000-0000-0000-000000000201";

/**
 * Known action verbs that can appear as path segments.
 * These are checked in the URL to determine the required permission.
 */
const ACTION_VERBS = ["create", "edit", "view", "delete", "approve"] as const;

type ActionVerb = (typeof ACTION_VERBS)[number];

/**
 * Converts a Next.js route pattern (with [param] segments) into a regex
 * for matching against actual URL paths.
 *
 * Examples:
 *   /dashboard/employees/[id] → /^\/dashboard\/employees\/[^/]+$/
 *   /dashboard/employees/[id]/edit → /^\/dashboard\/employees\/[^/]+\/edit$/
 */
function routePatternToRegex(pattern: string): RegExp {
  // Escape regex special characters except the [param] segments
  const escaped = pattern
    .replace(/[.+?^${}()|\\]/g, "\\$&")
    .replace(/\[.*?\]/g, "[^/]+");

  return new RegExp(`^${escaped}$`);
}

/**
 * Checks if a given URL pathname matches a navigation item's effective URL.
 * Supports exact match and dynamic segment ([param]) matching.
 */
function pathMatchesNavigationUrl(
  targetPathname: string,
  itemUrl: string | null,
  featurePath: string | null,
): boolean {
  const effectiveUrl = featurePath || itemUrl;
  if (!effectiveUrl) return false;

  // Exact match first (fast path)
  if (effectiveUrl === targetPathname) {
    return true;
  }

  // Check if effective URL has dynamic segments
  if (effectiveUrl.includes("[")) {
    const regex = routePatternToRegex(effectiveUrl);
    return regex.test(targetPathname);
  }

  return false;
}

/**
 * Extracts the action verb and base resource URL from a pathname.
 *
 * Examples:
 *   /dashboard/brands             → { basePath: "/dashboard/brands", action: null }
 *   /dashboard/brands/create      → { basePath: "/dashboard/brands", action: "create" }
 *   /dashboard/brands/edit/123    → { basePath: "/dashboard/brands", action: "edit" }
 *   /dashboard/brands/view/123    → { basePath: "/dashboard/brands", action: "view" }
 *   /dashboard/brands/delete/123  → { basePath: "/dashboard/brands", action: "delete" }
 *   /dashboard/users              → { basePath: "/dashboard/users", action: null }
 *   /dashboard/users/edit/123     → { basePath: "/dashboard/users", action: "edit" }
 */
function extractActionFromPath(pathname: string): {
  basePath: string;
  action: ActionVerb | null;
} {
  const segments = pathname.split("/").filter(Boolean);

  // A path must have at least 2 segments to be a dashboard page (e.g. /dashboard/brands)
  if (segments.length < 2) {
    return { basePath: pathname, action: null };
  }

  // Check the Nth segment (after dashboard/resource/) for an action verb
  // Structure: /dashboard/{resource}/{action}/{id?}
  //            segments[0]=dashboard segments[1]=resource segments[2]=action segments[3]=id
  const possibleAction = segments[2]; // After /dashboard/{resource}/

  if (possibleAction && ACTION_VERBS.includes(possibleAction as ActionVerb)) {
    // Base path is everything up to the action segment: /dashboard/{resource}
    const basePath = "/" + segments.slice(0, 2).join("/");
    return { basePath, action: possibleAction as ActionVerb };
  }

  // If there are >2 segments but the 3rd isn't an action verb, it's likely a dynamic segment
  // e.g. /dashboard/users/123 (old pattern), or /dashboard/brands/123
  if (segments.length > 2) {
    // If the third segment looks like a UUID, treat it as a dynamic ID
    // and check the 4th segment for an action verb
    const nextSegment = segments[3];
    if (nextSegment && ACTION_VERBS.includes(nextSegment as ActionVerb)) {
      const basePath = "/" + segments.slice(0, 2).join("/");
      return { basePath, action: nextSegment as ActionVerb };
    }

    // Otherwise, treat the path as-is (it might be a resource with a dynamic ID that
    // isn't a standard action - grant view access if the nav item matches)
    // e.g. /dashboard/infractions/{id} → base is itself, no action extracted
    return { basePath: pathname, action: null };
  }

  // Standard /dashboard/{resource} path
  return { basePath: pathname, action: null };
}

/**
 * Checks if the user's role has permission to access a specific page/action.
 *
 * Lookup chain:
 *   Role → RoleNavigation → FeatureNavigationTemplate → FeatureNavigationItem
 *
 * For base pages (no action verb in URL):
 *   - Simply checks if the URL matches a navigation item → grants access
 *
 * For action pages (create/edit/delete/view in URL):
 *   - Matches the base resource URL to a navigation item
 *   - Checks that nav item's `permissions` JSON for the specific action
 *
 * @param roleId - The user's role ID
 * @param pathname - The page URL path to check (e.g. "/dashboard/employees/create")
 * @returns { authorized: boolean, reason?: string }
 */
export async function checkPageAccess(
  roleId: string,
  pathname: string,
): Promise<PageAccessResult> {
  // Super admin bypass — allow full access to feature-manager section

  if (
    roleId === SUPER_ADMIN_ROLE_ID &&
    (pathname.startsWith("/dashboard/feature-manager") ||
      pathname === "/dashboard/feature-manager")
  ) {
    return { authorized: true };
  }

  // Normalize pathname
  const normalizedPathname = pathname.split("?")[0].replace(/\/+$/, "") || "/";

  // Extract action and base path from the URL
  const { basePath, action } = extractActionFromPath(normalizedPathname);

  try {
    // Query the role's navigation items with their permissions and linked feature paths
    const rows = await prisma.$queryRaw<
      Array<{
        item_url: string | null;
        feature_code: string | null;
        feature_path: string | null;
        permissions: Record<string, boolean> | null;
      }>
    >`
      SELECT
        fni.url AS item_url,
        fni.feature_code,
        f.path AS feature_path,
        fni.permissions
      FROM role_navigations rn
      JOIN feature_navigation_templates fnt
        ON rn.navigation_template_id = fnt.id AND fnt.archived_at IS NULL
      JOIN feature_navigation_items fni
        ON fni.template_id = fnt.id
      LEFT JOIN features f
        ON f.code = fni.feature_code AND f.archived_at IS NULL
      WHERE rn.role_id = ${roleId}
        AND rn.archived_at IS NULL
      ORDER BY fni.sort_order ASC
    `;

    // If no navigation template is assigned to this role, deny access
    if (!rows || rows.length === 0) {
      return {
        authorized: false,
        reason: "No navigation template has been assigned to your role.",
      };
    }

    // Try to find a navigation item whose effective URL matches the basePath
    let matchedItem: (typeof rows)[0] | null = null;

    for (const row of rows) {
      if (pathMatchesNavigationUrl(basePath, row.item_url, row.feature_path)) {
        matchedItem = row;
        break;
      }
    }

    // Also try matching the full pathname if basePath didn't match
    // (handles cases where the URL is a direct page match with no action extraction)
    if (!matchedItem) {
      for (const row of rows) {
        if (
          pathMatchesNavigationUrl(
            normalizedPathname,
            row.item_url,
            row.feature_path,
          )
        ) {
          matchedItem = row;
          break;
        }
      }
    }

    // No matching navigation item found for this URL
    if (!matchedItem) {
      return {
        authorized: false,
        reason: "You do not have access to this page.",
      };
    }

    // If no specific action was extracted (base page like /dashboard/brands),
    // grant access — having the nav item in your role is sufficient
    if (!action) {
      return { authorized: true };
    }

    // Check the specific action permission from the nav item's permissions JSON
    const permissions = matchedItem.permissions;
    const hasPermission = permissions?.[action] === true;

    if (!hasPermission) {
      return {
        authorized: false,
        reason: `You do not have '${action}' permission for this resource.`,
      };
    }

    // Grant access — the action is permitted for the matched nav item
    return { authorized: true };
  } catch (error) {
    console.error("Error checking page access:", error);
    // On error, allow access to prevent system lockouts
    return { authorized: true };
  }
}
