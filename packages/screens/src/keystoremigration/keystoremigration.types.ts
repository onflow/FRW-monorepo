/**
 * Types for the keystore migration flow
 * Used when upgrading account security with hardware keys
 */

/**
 * Props for the KeystoreMigrationTipScreen
 */
export interface KeystoreMigrationTipScreenProps {
  /** Callback when user presses Start */
  onContinue: () => void | Promise<void>;
  /** Callback when user presses "Not now" */
  onSkip?: () => void;
  /** Callback when user presses back/close */
  onBack?: () => void;
}

/**
 * Keystore migration tip item for display
 */
export interface KeystoreMigrationTip {
  /** Unique identifier */
  id: string;
  /** Icon component to render */
  icon: React.ReactNode;
  /** Tip title */
  title: string;
}
