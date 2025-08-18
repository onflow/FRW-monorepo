import React, { createContext, useContext } from 'react';

import type { Navigation } from './interfaces/Navigation';

/**
 * Navigation Context for providing navigation functionality to components
 */
export const NavigationContext = createContext<Navigation | null>(null);

/**
 * Hook to access navigation functionality
 * @returns Navigation instance from the current platform
 * @throws Error if used outside of NavigationProvider
 */
export function useNavigation(): Navigation {
  const navigation = useContext(NavigationContext);

  if (!navigation) {
    throw new Error(
      'useNavigation must be used within a NavigationProvider. ' +
        'Make sure your app is wrapped with a NavigationProvider that provides the platform navigation implementation.'
    );
  }

  return navigation;
}

/**
 * Provider component props
 */
export interface NavigationProviderProps {
  navigation: Navigation;
  children: React.ReactNode;
}

/**
 * NavigationProvider component - platforms should wrap their app with this
 * @param props - Provider props containing navigation implementation and children
 */
export function NavigationProvider({ navigation, children }: NavigationProviderProps) {
  return <NavigationContext.Provider value={navigation}>{children}</NavigationContext.Provider>;
}
