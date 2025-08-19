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
    console.log('[DEBUG] ExtensionNavigation.navigate called:', screen, params);
    if (this.navigateCallback) {
      // Convert screen name to path and include params as state
      let path = this.convertScreenToPath(screen);

      // Handle dynamic routes with parameters
      if (screen === 'SendTo' || screen === 'SendToScreen') {
        // Use proper token route for SendToScreen
        const tokenId = params?.tokenId || 'flow';
        path = `/dashboard/token/${tokenId}/send`;
      } else if (screen === 'SendTokens' && params) {
        const tokenId = params.tokenId || 'flow';
        const address = params.address;
        if (address) {
          path = `/dashboard/token/${tokenId}/send-tokens/${address}`;
        } else {
          path = `/dashboard/token/${tokenId}/send`;
        }
      } else if (screen === 'NFTDetail' && params?.id) {
        path = `/dashboard/nested/nftdetail/${params.id}`;
      } else if (screen === 'NFTList' && params?.collection && params?.address) {
        path = `/dashboard/nested/collectiondetail/${params.collection}_${params.address}`;
      }

      console.log('[DEBUG] ExtensionNavigation navigating to:', path);
      this.navigateCallback(path, { state: params });
    } else {
      console.warn('[ExtensionNavigation] Navigation attempted but no navigate callback available');
    }
  }

  goBack(): void {
    console.log('[DEBUG] ExtensionNavigation.goBack called');
    if (typeof window !== 'undefined' && window.history) {
      console.log('[DEBUG] ExtensionNavigation using window.history.back()');
      window.history.back();
    } else if (this.navigateCallback) {
      // Fallback - navigate to dashboard
      console.log('[DEBUG] ExtensionNavigation fallback to dashboard');
      this.navigateCallback('/dashboard');
    } else {
      console.warn('[ExtensionNavigation] goBack attempted but no history available');
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
    if (typeof window !== 'undefined' && window.history) {
      window.history.back();
    } else if (this.navigateCallback) {
      // Fallback - navigate to dashboard
      this.navigateCallback('/dashboard');
    } else {
      console.warn('[ExtensionNavigation] pop attempted but no history available');
    }
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
      SendTo: '/dashboard/token/flow/send',
      SendTokens: '/dashboard/token/flow/send', // Default fallback
      SelectTokens: '/dashboard/select-tokens',
      SendToScreen: '/dashboard/token/flow/send', // Use proper token route
      SendSingleNFT: '/dashboard/nft/send',
      SendMultipleNFTs: '/dashboard/nft/send',
      SendNftEvm: '/dashboard/nftevm/send',
      NFTDetail: '/dashboard/nested/nftdetail',
      NFTList: '/dashboard/nested/collectiondetail',
    };

    return screenMapping[screen] || `/dashboard/${screen.toLowerCase()}`;
  }

  /**
   * Convert extension paths back to screen names
   */
  private convertPathToScreen(path: string): string {
    const pathMapping: Record<string, string> = {
      '/dashboard': 'Home',
      '/dashboard/sendtoscreen': 'SendToScreen',
      '/dashboard/select-tokens': 'SelectTokens',
      '/dashboard/nft/send': 'SendSingleNFT',
      '/dashboard/nftevm/send': 'SendNftEvm',
      '/dashboard/nested/nftdetail': 'NFTDetail',
      '/dashboard/nested/collectiondetail': 'NFTList',
    };

    return pathMapping[path] || path.replace('/dashboard/', '');
  }
}

// Export singleton instance
export const extensionNavigation = new ExtensionNavigation();
