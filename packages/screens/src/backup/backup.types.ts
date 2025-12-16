/**
 * Types for the simplified 2-page backup flow
 * Used during key rotation to backup seed phrases
 */

/**
 * Backup flow step enumeration
 */
export type BackupStep = 'tip' | 'mnemonic';

/**
 * State for the backup flow
 */
export interface BackupState {
  /** Current step in the backup flow */
  currentStep: BackupStep;
  /** Whether the seed phrase has been revealed */
  isPhraseRevealed: boolean;
  /** Whether the user has confirmed their backup */
  isBackupConfirmed: boolean;
  /** The seed phrase words */
  seedPhrase: string[];
}

/**
 * Props for the BackupTipScreen
 */
export interface BackupTipScreenProps {
  /** Callback when user presses continue */
  onContinue: () => void;
  /** Callback when user presses back/close */
  onBack?: () => void;
}

/**
 * Props for the BackupMnemonicScreen
 */
export interface BackupMnemonicScreenProps {
  /** The seed phrase to display (12 words) */
  seedPhrase: string[];
  /** Callback when backup is complete */
  onComplete: () => void;
  /** Callback when user presses back */
  onBack?: () => void;
}

/**
 * Props for the MnemonicGrid component
 */
export interface MnemonicGridProps {
  /** The words to display in the grid */
  words: string[];
  /** Whether the words are revealed or hidden */
  isRevealed: boolean;
  /** Callback when reveal is triggered */
  onReveal?: () => void;
}

/**
 * Props for the RevealOverlay component
 */
export interface RevealOverlayProps {
  /** Whether the overlay is visible */
  visible: boolean;
  /** Callback when user taps to reveal */
  onReveal: () => void;
  /** Label text for the reveal button */
  label?: string;
}

/**
 * Backup tip item for display
 */
export interface BackupTip {
  /** Unique identifier */
  id: string;
  /** Icon component to render */
  icon: React.ReactNode;
  /** Tip title */
  title: string;
  /** Tip description */
  description: string;
}

/**
 * Props for BackupTipCard component
 */
export interface BackupTipCardProps {
  /** Icon to display */
  icon: React.ReactNode;
  /** Tip title */
  title: string;
  /** Tip description */
  description: string;
}
