import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';

import {
  navigateWithRouting,
  shouldUseNewRouter,
} from '@/ui/navigation/RouteMapping';

/**
 * Enhanced navigation hook that handles both old and new routing systems
 */
export function useAppNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateToScreen = useCallback(
    (screen: string, params?: Record<string, unknown>) => {
      navigateWithRouting(navigate, screen, params);
    },
    [navigate]
  );

  const navigateToRoute = useCallback(
    (route: string, params?: Record<string, unknown>) => {
      if (shouldUseNewRouter(route)) {
        navigate(route, { state: params });
      } else {
        navigate(route, params);
      }
    },
    [navigate]
  );

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const getCurrentRoute = useCallback(() => {
    return location.pathname;
  }, [location.pathname]);

  const isNewRouter = useCallback(
    (route?: string) => {
      const currentRoute = route || location.pathname;
      return shouldUseNewRouter(currentRoute);
    },
    [location.pathname]
  );

  return {
    navigate: navigateToScreen,
    navigateToRoute,
    goBack,
    getCurrentRoute,
    isNewRouter,
    location,
  };
}

/**
 * Hook for creating navigation objects compatible with screen components
 */
export function useScreenNavigation() {
  const { navigate, goBack } = useAppNavigation();

  return {
    navigate,
    goBack,
  };
}
