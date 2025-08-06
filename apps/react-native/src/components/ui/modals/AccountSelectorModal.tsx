import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import type { WalletAccount } from '@onflow/frw-types';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { ActivityIndicator, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

import NativeFRWBridge from '@/bridge/NativeFRWBridge';
import { useTheme } from '@/contexts/ThemeContext';
import { useAndroidTextFix } from '@/lib';

import { WalletAccountSection } from '../index';

interface AccountSelectorModalProps {
  onAccountSelect: (account: WalletAccount) => void;
  currentAccount?: WalletAccount | null;
  onClose?: () => void;
}

export interface AccountSelectorModalRef {
  present: () => void;
  dismiss: () => void;
}

export const AccountSelectorModal = forwardRef<AccountSelectorModalRef, AccountSelectorModalProps>(
  ({ onAccountSelect, currentAccount, onClose }, ref) => {
    const { isDark } = useTheme();
    const androidTextFix = useAndroidTextFix();
    const bottomSheetRef = useRef<BottomSheet>(null);
    const [accounts, setAccounts] = useState<WalletAccount[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Theme-aware accent green color
    const accentGreen = isDark ? '#00EF8B' : '#00B877';

    // Cache for full account list to ensure we always have complete data
    const [fullAccountsCache, setFullAccountsCache] = useState<WalletAccount[]>([]);

    // Load accounts when modal opens
    useEffect(() => {
      if (isOpen) {
        loadAccounts(0);
      }
    }, [isOpen]);

    // Ensure we always have at least the current account when modal opens (only after load attempt)
    useEffect(() => {
      // Only trigger fallback after a reasonable delay to allow normal loading to complete
      const timeoutId = setTimeout(() => {
        if (isOpen && accounts.length === 0 && !isLoading && currentAccount) {
          console.log(
            '[AccountSelector] No accounts loaded but have currentAccount, using as fallback'
          );
          setAccounts([
            {
              id: currentAccount.id || currentAccount.address,
              name: currentAccount.name,
              emojiInfo: currentAccount.emojiInfo,
              parentEmoji: currentAccount.parentEmoji,
              address: currentAccount.address,
              type: (currentAccount as any).type || 'main',
              isActive: true,
            },
          ]);
        }
      }, 1000); // Wait 1 second before applying fallback

      return () => clearTimeout(timeoutId);
    }, [isOpen, accounts.length, isLoading, currentAccount]);

    const loadAccounts = useCallback(
      async (retryCount = 0) => {
        setIsLoading(true);

        try {
          const walletAccountsData = await NativeFRWBridge.getWalletAccounts();

          // Check if we got a valid response
          if (
            !Array.isArray(walletAccountsData.accounts) ||
            walletAccountsData.accounts.length === 0
          ) {
            console.warn(
              '[AccountSelector] Bridge returned empty or invalid accounts, trying fallback...'
            );

            // If this is the first attempt and we get limited data, try again with a small delay
            if (retryCount === 0) {
              console.log('[AccountSelector] First attempt returned limited data, retrying...');
              setTimeout(() => {
                loadAccounts(1);
              }, 300);
              return;
            }

            // First try to use cached full account list
            if (fullAccountsCache.length > 0) {
              console.log('[AccountSelector] Using cached full account list');
              setAccounts(fullAccountsCache);
              return;
            }

            // Fallback: if we have currentAccount, at least show that
            if (currentAccount) {
              console.log('[AccountSelector] Using currentAccount as fallback');
              setAccounts([
                {
                  id: currentAccount.id || currentAccount.address,
                  name: currentAccount.name,
                  emojiInfo: currentAccount.emojiInfo,
                  parentEmoji: currentAccount.parentEmoji,
                  address: currentAccount.address,
                  type: (currentAccount as any).type || 'main',
                  isActive: currentAccount.isActive || true,
                },
              ]);
            } else {
              console.log('[AccountSelector] No fallback available, showing empty state');
              setAccounts([]);
            }
            return;
          }

          const accountsArray: WalletAccount[] = walletAccountsData.accounts.map((account: any) => {
            // Debug: Log child account data to see avatar field and parentEmoji
            if (account.type === 'child' || account.type === 'evm') {
              console.log('DEBUG: Linked account from bridge:', {
                name: account.name,
                emojiInfo: account.emojiInfo,
                parentEmoji: account.parentEmoji,
                avatar: account.avatar,
                address: account.address,
                type: account.type,
              });
            }

            return {
              id: account.id,
              name: account.name,
              emojiInfo: account.emojiInfo,
              parentEmoji: account.parentEmoji, // Include parentEmoji field for linked accounts
              avatar: account.avatar, // Include avatar field for child accounts (squid images!)
              address: account.address,
              isActive: account.isActive || false,
              type: account.type, // Preserve the type field!
            };
          });

          // If we got a good response with multiple accounts, cache it as the full list
          if (accountsArray.length > 1 || (accountsArray.length === 1 && !currentAccount)) {
            setFullAccountsCache(accountsArray);
          } else if (accountsArray.length === 1 && retryCount === 0) {
            // If we only got one account on first try, retry once more
            setTimeout(() => {
              loadAccounts(1);
            }, 500);
            return;
          }

          setAccounts(accountsArray);
        } catch (error) {
          console.error('[AccountSelector] Failed to load wallet accounts:', error);
          console.error('[AccountSelector] Error details:', JSON.stringify(error));

          // Enhanced fallback: try cached accounts first, then current account
          if (fullAccountsCache.length > 0) {
            console.log('[AccountSelector] Error fallback: using cached full account list');
            setAccounts(fullAccountsCache);
            console.log(
              '[AccountSelector] Error fallback: Set cached accounts, count:',
              fullAccountsCache.length
            );
          } else if (currentAccount) {
            console.log('[AccountSelector] Error fallback: using currentAccount');
            console.log('[AccountSelector] Current account data:', JSON.stringify(currentAccount));
            setAccounts([
              {
                id: currentAccount.id || currentAccount.address,
                name: currentAccount.name,
                emojiInfo: currentAccount.emojiInfo,
                parentEmoji: currentAccount.parentEmoji,
                address: currentAccount.address,
                isActive: true,
                // isIncompatible removed from WalletAccount interface
                type: (currentAccount as any).type, // Preserve type in fallback
              },
            ]);
            console.log('[AccountSelector] Error fallback: Set single current account');
          } else {
            console.log(
              '[AccountSelector] No fallback available - current account is null/undefined'
            );
            setAccounts([]);
          }
        } finally {
          setIsLoading(false);
        }
      },
      [currentAccount, fullAccountsCache]
    );

    // Bottom sheet handlers
    const handleSheetChanges = useCallback(
      (index: number) => {
        if (index === -1) {
          setIsOpen(false);
          onClose?.();
        }
      },
      [onClose]
    );

    const renderBackdrop = useCallback(
      (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.6}
          pressBehavior="close"
        />
      ),
      []
    );

    // Fixed snap points - multiple options to choose from
    const snapPoints = React.useMemo(() => {
      return ['40%', '55%', '70%', '85%']; // Fixed set of snap points
    }, []);

    // Calculate which snap point index to use based on account count
    const getTargetSnapIndex = React.useCallback(() => {
      if (accounts.length === 0) return 1; // 55% while loading

      if (accounts.length <= 2) return 1; // 55% for 1-2 accounts
      if (accounts.length <= 4) return 2; // 70% for 3-4 accounts
      if (accounts.length <= 6) return 3; // 85% for 5-6 accounts
      return 3; // 85% for 7+ accounts
    }, [accounts.length]);

    const backgroundStyle = React.useMemo(
      () => ({
        backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
      }),
      [isDark]
    );

    const handleStyle = React.useMemo(
      () => ({
        backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingTop: 8,
      }),
      [isDark]
    );

    // Snap to appropriate height based on account count
    useEffect(() => {
      if (isOpen && accounts.length > 0) {
        const targetIndex = getTargetSnapIndex();
        console.log(
          `[AccountSelector] Snapping to index ${targetIndex} (${snapPoints[targetIndex]}) for ${accounts.length} accounts`
        );

        setTimeout(() => {
          bottomSheetRef.current?.snapToIndex(targetIndex);
        }, 100);
      }
    }, [accounts.length, isOpen, getTargetSnapIndex, snapPoints]);

    // Create a dismiss function we can call directly
    const dismissModal = useCallback(() => {
      console.log('[AccountSelector] Dismissing modal');
      setIsOpen(false);

      // Try multiple methods to close the bottom sheet
      if (bottomSheetRef.current) {
        console.log('[AccountSelector] Trying snapToIndex(-1)');
        bottomSheetRef.current.snapToIndex(-1);

        // Try other potential methods
        setTimeout(() => {
          if (bottomSheetRef.current) {
            console.log('[AccountSelector] Trying close() method');
            (bottomSheetRef.current as any).close?.();

            setTimeout(() => {
              console.log('[AccountSelector] Trying forceClose() method');
              (bottomSheetRef.current as any).forceClose?.();
            }, 100);
          }
        }, 50);
      }
      onClose?.();
    }, [onClose]);

    useImperativeHandle(ref, () => ({
      present: () => {
        setIsOpen(true);
        // The index prop will handle opening to the correct position
        setTimeout(() => {
          const targetIndex = getTargetSnapIndex();
          bottomSheetRef.current?.snapToIndex(targetIndex);
        }, 100);
      },
      dismiss: dismissModal,
    }));

    const handleAccountPress = (account: WalletAccount) => {
      console.log('[AccountSelector] Account selected, attempting to close drawer');
      onAccountSelect(account);

      // Call dismiss directly
      dismissModal();
    };

    const AccountItem: React.FC<{ account: WalletAccount; isSelected: boolean }> = ({
      account,
      isSelected,
    }) => (
      <TouchableOpacity
        onPress={() => handleAccountPress(account)}
        style={{
          paddingVertical: 6,
          paddingHorizontal: 12,
          backgroundColor: isSelected
            ? isDark
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.05)'
            : 'transparent',
          borderRadius: 8,
          marginBottom: 4,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <View style={{ flex: 1 }}>
          <WalletAccountSection
            account={account}
            onAccountPress={() => handleAccountPress(account)}
            useLetterAvatar={false}
          />
        </View>

        {/* Selection indicator */}
        {isSelected && (
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: accentGreen,
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 8,
            }}
          >
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 12,
                fontWeight: 'bold',
              }}
            >
              ✓
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={isOpen ? 1 : -1} // Sync with isOpen state
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={backgroundStyle}
        handleStyle={handleStyle}
        onChange={handleSheetChanges}
        key={`bottomsheet-${isOpen ? 'open' : 'closed'}`} // Use state-based key
      >
        <BottomSheetView
          style={{ flex: 1, paddingTop: 12, paddingHorizontal: 16, paddingBottom: 24 }}
        >
          <SafeAreaView style={{ flex: 1 }}>
            {/* Header */}
            <View
              style={{
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text
                style={[
                  androidTextFix,
                  {
                    fontSize: 18,
                    fontWeight: '700',
                    color: isDark ? '#FFFFFF' : '#000000',
                    lineHeight: 24,
                    textAlign: 'center',
                  },
                ]}
              >
                Select Account
              </Text>
            </View>

            {/* Account List */}
            <View style={{ flex: 1 }}>
              {isLoading ? (
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingVertical: 24,
                  }}
                >
                  <ActivityIndicator
                    size="large"
                    color={isDark ? '#FFFFFF' : '#000000'}
                    style={{ marginBottom: 16 }}
                  />
                  <Text
                    style={[
                      androidTextFix,
                      {
                        color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                        fontSize: 16,
                        fontWeight: '500',
                        minWidth: 150,
                        textAlign: 'center',
                      },
                    ]}
                  >
                    Loading accounts...
                  </Text>
                </View>
              ) : accounts.length === 0 ? (
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingVertical: 24,
                  }}
                >
                  <Text
                    style={[
                      androidTextFix,
                      {
                        color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                        fontSize: 16,
                        textAlign: 'center',
                        minWidth: 150,
                      },
                    ]}
                  >
                    No accounts available
                  </Text>
                </View>
              ) : (
                <BottomSheetScrollView
                  showsVerticalScrollIndicator={true}
                  contentContainerStyle={{ paddingBottom: 12 }}
                >
                  {accounts.map(account => {
                    const isSelected = currentAccount?.address === account.address;
                    return (
                      <AccountItem
                        key={account.id || account.address}
                        account={account}
                        isSelected={isSelected}
                      />
                    );
                  })}
                </BottomSheetScrollView>
              )}
            </View>
          </SafeAreaView>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

AccountSelectorModal.displayName = 'AccountSelectorModal';
