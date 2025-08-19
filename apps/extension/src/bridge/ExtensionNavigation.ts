import type { Navigation } from '@onflow/frw-context';

/**
 * Extension Navigation implementation
 * Uses React Router for navigation within the extension popup
 */
class ExtensionNavigation implements Navigation {
  private navigateCallback: ((path: string, options?: any) => void) | null = null;
  private locationRef: { current: any } | null = null;
  private historyRef: { current: any } | null = null;

  /**
   * Set the React Router navigate function
   * This should be called by the extension app initialization
   */
  setNavigateCallback(navigateCallback: (path: string, options?: any) => void) {
    this.navigateCallback = navigateCallback;
  }

  /**
   * Set the React Router location reference
   */
  setLocationRef(locationRef: { current: any }) {
    this.locationRef = locationRef;
  }

  /**
   * Set the React Router history reference
   */
  setHistoryRef(historyRef: { current: any }) {
    this.historyRef = historyRef;
  }

  navigate(screen: string, params?: Record<string, unknown>): void {
    if (this.navigateCallback) {
      // Convert screen name to path and include params as state
      const path = this.convertScreenToPath(screen);
      this.navigateCallback(path, { state: params });
    } else {
      console.warn('[ExtensionNavigation] Navigation attempted but no navigate callback available');
    }
  }

  goBack(): void {
    if (this.historyRef?.current) {
      this.historyRef.current.back();
    } else if (this.navigateCallback) {
      // Fallback - navigate to dashboard
      this.navigateCallback('/dashboard');
    } else {
      console.warn('[ExtensionNavigation] goBack attempted but no history reference available');
    }
  }

  canGoBack(): boolean {
    // In extension, we can typically go back unless we're at the root
    if (this.locationRef?.current) {
      return this.locationRef.current.pathname !== '/dashboard';
    }
    return true; // Default to true for extension
  }

  reset(routes: string[]): void {
    if (this.navigateCallback && routes.length > 0) {
      // Navigate to the last route in the array
      const finalRoute = routes[routes.length - 1];
      const path = this.convertScreenToPath(finalRoute);
      this.navigateCallback(path, { replace: true });
    } else {
      console.warn('[ExtensionNavigation] reset attempted but no navigate callback available');
    }
  }

  replace(screen: string, params?: Record<string, unknown>): void {
    if (this.navigateCallback) {
      const path = this.convertScreenToPath(screen);
      this.navigateCallback(path, { state: params, replace: true });
    } else {
      console.warn('[ExtensionNavigation] replace attempted but no navigate callback available');
    }
  }

  push(screen: string, params?: Record<string, unknown>): void {
    // In React Router, navigate is essentially push
    this.navigate(screen, params);
  }

  pop(): void {
    // Same as goBack in React Router context
    this.goBack();
  }

  getCurrentRoute(): { name: string; params?: Record<string, unknown> } | null {
    if (this.locationRef?.current) {
      return {
        name: this.convertPathToScreen(this.locationRef.current.pathname),
        params: this.locationRef.current.state || undefined,
      };
    }
    return null;
  }

  /**
   * Convert screen names to extension paths
   * Maps the screen names used by shared screens to extension routes
   */
  private convertScreenToPath(screen: string): string {
    const screenMapping: Record<string, string> = {
      Home: '/dashboard',
      SendTo: '/send-to-screen',
      SendTokens: '/send-tokens-screen',
      SelectTokens: '/select-tokens-screen',
      SendSingleNFT: '/send-nft',
      SendMultipleNFTs: '/send-nft',
      NFTDetail: '/nft-detail',
      NFTList: '/nft-list',
      Confirmation: '/confirmation',
    };

    return screenMapping[screen] || `/${screen.toLowerCase()}`;
  }

  /**
   * Convert extension paths back to screen names
   */
  private convertPathToScreen(path: string): string {
    const pathMapping: Record<string, string> = {
      '/dashboard': 'Home',
      '/send-to-screen': 'SendTo',
      '/send-tokens-screen': 'SendTokens',
      '/select-tokens-screen': 'SelectTokens',
      '/send-nft': 'SendSingleNFT',
      '/nft-detail': 'NFTDetail',
      '/nft-list': 'NFTList',
      '/confirmation': 'Confirmation',
    };

    return pathMapping[path] || path.replace('/', '');
  }
}

// Export singleton instance
export const extensionNavigation = new ExtensionNavigation();
