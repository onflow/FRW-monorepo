/**
 * Unified account data type for all UI components
 * Contains all possible fields needed for different display contexts
 */
export interface AccountDisplayData {
  // Core account info
  name: string;
  address: string;
  type: 'main' | 'child' | 'evm';

  // Avatar/display options
  avatar?: string; // Simple avatar URL
  avatarSrc?: string; // Alternative avatar source
  avatarFallback?: string; // Fallback text/emoji
  avatarBgColor?: string; // Background color for avatar

  // Account metadata (optional - only used in lists/cards)
  balance?: string; // Account balance
  nfts?: string; // NFT count

  // Emoji info (optional - only used in cards)
  emojiInfo?: { emoji: string; name: string; color: string };

  // Parent account info (for linked accounts)
  parentEmoji?: {
    emoji: string;
    name: string;
    color: string;
  };
}
