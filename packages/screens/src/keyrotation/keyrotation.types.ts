/**
 * Types for the simplified 2-page key rotation flow
 * Used during key rotation to back up seed phrases
 */

import type { NewKeyInfo, KeyRotationServiceResult } from '@onflow/frw-types';

/**
 * Key rotation flow step enumeration
 */
export type KeyRotationStep = 'tip' | 'mnemonic';

/**
 * State for the key rotation flow
 */
export interface KeyRotationState {
  /** Current step in the key rotation flow */
  currentStep: KeyRotationStep;
  /** Whether the seed phrase has been revealed */
  isPhraseRevealed: boolean;
  /** Whether the user has confirmed their backup */
  isKeyRotationConfirmed: boolean;
  /** The new key info including seed phrase and flow key */
  newKeyInfo: NewKeyInfo | null;
}

/**
 * Props for the KeyRotationTipScreen
 */
export interface KeyRotationTipScreenProps {
  /** Callback when user presses continue and seed key is generated */
  onContinue: (newKeyInfo: NewKeyInfo) => void;
  /** Callback when user presses "Not now" */
  onSkip?: () => void;
  /** Callback when user presses back/close */
  onBack?: () => void;
}

/**
 * Props for the KeyRotationMnemonicScreen
 */
export interface KeyRotationMnemonicScreenProps {
  /** The new key info containing seed phrase and flow key */
  newKeyInfo: NewKeyInfo;
  /** The user's address for key rotation */
  address: string;
  /** Callback when key rotation is complete */
  onComplete: (result: KeyRotationServiceResult) => void;
  /** Callback when user presses back */
  onBack?: () => void;
  /** Callback when key rotation fails */
  onError?: (error: string) => void;
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
 * Key rotation tip item for display
 */
export interface KeyRotationTip {
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
 * Props for KeyRotationTipCard component
 */
export interface KeyRotationTipCardProps {
  /** Icon to display */
  icon: React.ReactNode;
  /** Tip title */
  title: string;
  /** Tip description */
  description: string;
}
