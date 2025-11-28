import type { ScreenName } from '@onflow/frw-types';

/**
 * Navigation abstraction interface
 * Each platform implements its own navigation system (React Navigation, React Router, etc.)
 */
export interface Navigation {
  /**
   * Navigate to a screen with optional parameters
   */
  navigate(screen: ScreenName, params?: Record<string, unknown>): void;

  /**
   * Go back to the previous screen
   */
  goBack(): void;

  /**
   * Check if navigation can go back
   */
  canGoBack(): boolean;

  /**
   * Reset the navigation stack to the specified routes
   */
  reset(routes: string[]): void;

  /**
   * Replace the current screen with a new one
   */
  replace(screen: ScreenName, params?: Record<string, unknown>): void;

  /**
   * Push a new screen onto the stack
   */
  push(screen: ScreenName, params?: Record<string, unknown>): void;

  /**
   * Pop the current screen from the stack
   */
  pop(): void;

  /**
   * Get the current route information
   */
  getCurrentRoute(): { name: string; params?: Record<string, unknown> } | null;

  /**
   * Get route parameters for the current screen
   * This provides a unified way to access route params across platforms
   */
  getRouteParams(): Record<string, unknown>;
}
