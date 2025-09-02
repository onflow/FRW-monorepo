import type { Navigation } from '@onflow/frw-context';

/**
 * React Native Navigation implementation
 * Uses React Navigation's navigation prop
 */
class ReactNativeNavigation implements Navigation {
  private navigationRef: any = null;

  /**
   * Set the navigation reference from React Navigation
   * This should be called by the NavigationContainer setup
   */
  setNavigationRef(navigationRef: any) {
    this.navigationRef = navigationRef;
  }

  navigate(screen: string, params?: Record<string, unknown>): void {
    if (this.navigationRef?.current) {
      this.navigationRef.current.navigate(screen, params);
    } else {
      console.warn('[ReactNativeNavigation] Navigation attempted but no navigation ref available');
    }
  }

  goBack(): void {
    if (this.navigationRef?.current) {
      if (this.navigationRef.current.canGoBack()) {
        this.navigationRef.current.goBack();
      } else {
        console.warn('[ReactNativeNavigation] Cannot go back, no previous screen');
      }
    } else {
      console.warn('[ReactNativeNavigation] goBack attempted but no navigation ref available');
    }
  }

  canGoBack(): boolean {
    if (this.navigationRef?.current) {
      return this.navigationRef.current.canGoBack();
    }
    return false;
  }

  reset(routes: string[]): void {
    if (this.navigationRef?.current) {
      this.navigationRef.current.reset({
        index: routes.length - 1,
        routes: routes.map(route => ({ name: route })),
      });
    } else {
      console.warn('[ReactNativeNavigation] reset attempted but no navigation ref available');
    }
  }

  replace(screen: string, params?: Record<string, unknown>): void {
    if (this.navigationRef?.current) {
      this.navigationRef.current.replace(screen, params);
    } else {
      console.warn('[ReactNativeNavigation] replace attempted but no navigation ref available');
    }
  }

  push(screen: string, params?: Record<string, unknown>): void {
    if (this.navigationRef?.current) {
      this.navigationRef.current.push(screen, params);
    } else {
      console.warn('[ReactNativeNavigation] push attempted but no navigation ref available');
    }
  }

  pop(): void {
    if (this.navigationRef?.current) {
      this.navigationRef.current.pop();
    } else {
      console.warn('[ReactNativeNavigation] pop attempted but no navigation ref available');
    }
  }

  getCurrentRoute(): { name: string; params?: Record<string, unknown> } | null {
    if (this.navigationRef?.current) {
      const currentRoute = this.navigationRef.current.getCurrentRoute();
      return currentRoute
        ? {
            name: currentRoute.name,
            params: currentRoute.params,
          }
        : null;
    }
    return null;
  }

  getRouteParams(): Record<string, unknown> {
    return {};
  }
}

// Export singleton instance
export const reactNativeNavigation = new ReactNativeNavigation();
