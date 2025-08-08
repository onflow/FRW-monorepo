/**
 * Extension Navigation Adapter
 * Adapts React Router navigation to the NavigationProp interface expected by UI components
 */

import { useNavigate, useLocation } from 'react-router';

export interface ExtensionNavigationProp {
  navigate(screen: string, params?: Record<string, unknown>): void;
}

// Screen mapping from UI component names to Extension routes
const SCREEN_ROUTE_MAPPING: Record<string, string> = {
  SendTo: '/dashboard/send',
  NFTList: '/dashboard/nft',
  TokenDetail: '/dashboard/tokendetail',
  Send: '/dashboard/token/send',
  Dashboard: '/dashboard',
  Settings: '/dashboard/setting',
} as const;

export function useExtensionNavigation(): ExtensionNavigationProp {
  const navigate = useNavigate();
  const location = useLocation();

  return {
    navigate: (screen: string, params?: Record<string, unknown>) => {
      console.log(`[Extension Navigation] Navigating to ${screen}`, params);

      // Get the mapped route or fallback to a default route
      const route = SCREEN_ROUTE_MAPPING[screen];

      if (route) {
        // Handle route parameters
        if (params) {
          const searchParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              searchParams.set(key, String(value));
            }
          });

          const queryString = searchParams.toString();
          const fullRoute = queryString ? `${route}?${queryString}` : route;
          navigate(fullRoute);
        } else {
          navigate(route);
        }
      } else {
        console.warn(`[Extension Navigation] Unknown screen: ${screen}, staying on current page`);
        // Optionally show a toast/notification about unknown navigation
      }
    },
  };
}

// Hook for getting route parameters in Extension
export function useExtensionRouteParams(): Record<string, string> {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const params: Record<string, string> = {};

  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}
