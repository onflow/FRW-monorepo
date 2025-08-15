/**
 * Route mapping utilities for migrating from old extension routes to new AppRouter routes
 */

// Map old extension routes to new AppRouter routes
export const ROUTE_MAPPING = {
  // Send flow routes
  'token/:id/send': '/dashboard/selecttokens',
  'token/:id/send/:toAddress': '/dashboard/sendto',

  // NFT routes
  'nested/nftdetail/:id': '/dashboard/nftdetail/:id',
  'nested/collectiondetail/:collection_address_name': '/dashboard/nftlist',

  // Dashboard
  '/': '/dashboard',
  dashboard: '/dashboard',
} as const;

// Reverse mapping for navigation from new routes to old routes
export const REVERSE_ROUTE_MAPPING = Object.fromEntries(
  Object.entries(ROUTE_MAPPING).map(([oldRoute, newRoute]) => [newRoute, oldRoute])
);

/**
 * Convert old extension route to new AppRouter route
 */
export function mapOldRouteToNew(oldRoute: string): string {
  // Check for exact matches first
  if (ROUTE_MAPPING[oldRoute as keyof typeof ROUTE_MAPPING]) {
    return ROUTE_MAPPING[oldRoute as keyof typeof ROUTE_MAPPING];
  }

  // Check for pattern matches (with parameters)
  for (const [pattern, newRoute] of Object.entries(ROUTE_MAPPING)) {
    const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, '([^/]+)') + '$');
    const match = oldRoute.match(regex);
    if (match) {
      // Replace parameters in the new route
      let result = newRoute;
      const paramMatches = pattern.match(/:[^/]+/g) || [];
      paramMatches.forEach((param, index) => {
        result = result.replace(param, match[index + 1]);
      });
      return result;
    }
  }

  // If no mapping found, return the original route
  return oldRoute;
}

/**
 * Convert new AppRouter route to old extension route
 */
export function mapNewRouteToOld(newRoute: string): string {
  // Check for exact matches first
  if (REVERSE_ROUTE_MAPPING[newRoute]) {
    return REVERSE_ROUTE_MAPPING[newRoute];
  }

  // Check for pattern matches (with parameters)
  for (const [pattern, oldRoute] of Object.entries(REVERSE_ROUTE_MAPPING)) {
    const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, '([^/]+)') + '$');
    const match = newRoute.match(regex);
    if (match) {
      // Replace parameters in the old route
      let result = oldRoute;
      const paramMatches = pattern.match(/:[^/]+/g) || [];
      paramMatches.forEach((param, index) => {
        result = result.replace(param, match[index + 1]);
      });
      return result;
    }
  }

  // If no mapping found, return the original route
  return newRoute;
}

/**
 * Check if a route should use the new AppRouter
 */
export function shouldUseNewRouter(route: string): boolean {
  // Routes that should use the new AppRouter
  const newRouterRoutes = [
    '/dashboard',
    '/dashboard/colordemo',
    '/dashboard/nftdetail',
    '/dashboard/nftlist',
    '/dashboard/selecttokens',
    '/dashboard/sendto',
    '/dashboard/sendtokens',
    '/dashboard/sendsinglenft',
    '/dashboard/sendmultiplenfts',
  ];

  return newRouterRoutes.some((newRoute) => route === newRoute || route.startsWith(newRoute + '/'));
}

/**
 * Navigation helper that decides whether to use old or new routing
 */
export function navigateWithRouting(
  navigate: (path: string, options?: Record<string, unknown>) => void,
  screen: string,
  params?: Record<string, unknown>
) {
  const newRoute = mapOldRouteToNew(screen);

  if (shouldUseNewRouter(newRoute)) {
    // Use new routing
    navigate(newRoute, { state: params });
  } else {
    // Use old routing
    navigate(screen, params);
  }
}
