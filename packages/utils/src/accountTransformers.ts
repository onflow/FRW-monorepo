import { type WalletAccount, type AccountDisplayData } from '@onflow/frw-types';

import { isEmoji } from './utils';

/**
 * Transform WalletAccount to unified AccountDisplayData
 * @param account - The wallet account to transform
 * @param options - Optional configuration for the transformation
 * @returns Transformed account data or null
 */
export const transformAccountForDisplay = (
  account: WalletAccount | null
): AccountDisplayData | null => {
  if (!account) return null;
  // For Internal Wallet accounts, we use emoji instead of avatar image
  return {
    // Core account info
    name: account.name,
    address: account.address,
    type: account.type as 'main' | 'child' | 'evm',

    // Avatar/display options
    avatar: !isEmoji(account.avatar) ? account.avatar : undefined,
    avatarSrc: !isEmoji(account.avatar) ? account.avatar : undefined,
    avatarFallback: isEmoji(account.emojiInfo?.emoji)
      ? account.emojiInfo?.emoji
      : account.name?.[0] || '',
    avatarBgColor: account.emojiInfo?.color || '#7B61FF',
    balance: account?.balance || '0 FLOW',
    nfts: account?.nfts || '0 NFTs',
    emojiInfo: isEmoji(account.emojiInfo?.emoji) ? account.emojiInfo : undefined,
    // Parent account info
    parentEmoji: account.parentEmoji
      ? {
          emoji: account.parentEmoji.emoji,
          name: account.parentEmoji.name,
          color: account.parentEmoji.color,
        }
      : undefined,
  };
};

/**
 * Legacy function for backward compatibility
 */
export const transformAccountForCard = (
  account: WalletAccount | null
): AccountDisplayData | null => {
  return transformAccountForDisplay(account);
};
