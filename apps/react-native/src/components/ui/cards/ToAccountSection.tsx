import { isEVMAccount } from '@/lib';
import { type WalletAccount } from '@onflow/frw-types';
import { AddressBookService } from '@onflow/frw-services';
import { Edit as EditIcon, Link } from 'icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity, View } from 'react-native';
import { EVMChip, Text } from 'ui';
import { ContactAvatar } from '../media/ContactAvatar';
import { WalletAvatar } from '../media/WalletAvatar';
import AddressText from '../typography/AddressText';

interface ToAccountSectionProps {
  account: WalletAccount;
  isAccountIncompatible: boolean;
  onEditPress?: () => void;
  onLearnMorePress?: () => void;
}

// Check if account should show link icon (only for child and evm types)
const isLinkedAccount = (accountType?: string) => {
  return accountType === 'child' || accountType === 'evm';
};

export const ToAccountSection: React.FC<ToAccountSectionProps> = ({
  account,
  isAccountIncompatible,
  onEditPress,
  onLearnMorePress,
}) => {
  const { t } = useTranslation();
  const [isFromAddressBook, setIsFromAddressBook] = useState(false);

  // Check if should show parent emoji
  const shouldShowParentEmoji =
    isLinkedAccount((account as any).type) && account.parentEmoji?.emoji;

  // Check if account is from address book
  useEffect(() => {
    const checkAddressBook = async () => {
      try {
        const addressBookData = await AddressBookService.getInstance().getAddressBook();
        const isInAddressBook = addressBookData.contacts?.some(
          (contact: any) => contact.address.toLowerCase() === account.address.toLowerCase()
        );
        setIsFromAddressBook(!!isInAddressBook);
      } catch (error) {
        console.error('Failed to check address book:', error);
        setIsFromAddressBook(false);
      }
    };

    checkAddressBook();
  }, [account.address]);

  return (
    <View>
      {/* To Account Header */}
      <Text
        style={{
          fontSize: 12,
        }}
        className="text-fg-1 text-xs mb-3 font-normal"
      >
        {t('labels.toAccount')}
      </Text>

      {/* Incompatible Accounts Header */}
      {isAccountIncompatible && (
        <View className="flex-row items-center justify-between mb-3">
          <Text
            className="text-fg-2"
            style={{
              fontSize: 14,
              fontWeight: '400',
              lineHeight: 16,
              width: 154.02,
              height: 18.4,
            }}
          >
            {t('labels.incompatibleAccount')}
          </Text>
          <TouchableOpacity onPress={onLearnMorePress}>
            <Text
              className="text-primary"
              style={{
                fontSize: 14,
                fontWeight: '400',
                lineHeight: 16,
                width: 154.02,
                height: 18.4,
                textAlign: 'right',
              }}
            >
              {t('labels.learnMore')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Account Card with conditional opacity */}
      <View style={{ opacity: isAccountIncompatible ? 0.6 : 1 }}>
        <View>
          {/* Account Row - exact Figma layout with space-between */}
          <View className="flex-row items-center justify-between" style={{ gap: 12 }}>
            {/* Account Info Container - flexible width */}
            <View className="flex-row items-center gap-3 flex-1">
              {/* Enhanced Account Icon Container - with parent emoji support */}
              <View
                className="relative items-center justify-center"
                style={{
                  width: 42,
                  height: 42,
                }}
              >
                {/* Parent Emoji Container - positioned at top-left */}
                {shouldShowParentEmoji && (
                  <View
                    className="absolute rounded-full items-center justify-center w-5 h-5 z-10 border-[1.5px] border-surface-1 dark:border-surface-base"
                    style={{
                      left: -4, // Tighter positioning without affecting main layout
                      top: -4,
                      backgroundColor: account.parentEmoji?.color || '#F0F0F0',
                    }}
                  >
                    <Text className="text-center text-[8px] leading-3" disableAndroidFix={true}>
                      {account.parentEmoji?.emoji}
                    </Text>
                  </View>
                )}

                {/* Main account icon - use ContactAvatar for address book contacts */}
                {isFromAddressBook ? (
                  <ContactAvatar name={account.name} size={40} />
                ) : (
                  <WalletAvatar
                    value={account.avatar || account.emojiInfo?.emoji || '👤'}
                    fallback={account.emojiInfo?.emoji || '👤'}
                    size={40}
                    highlight={account.isActive}
                    backgroundColor={account.emojiInfo?.color}
                  />
                )}
              </View>

              {/* Account Details - flexible layout */}
              <View className="flex-1" style={{ minWidth: 0 }}>
                <View className="gap-0.5">
                  {/* Account Name with Link Icon and EVM Chip */}
                  <View
                    className="flex-row items-center gap-2"
                    style={{ flexWrap: 'wrap', minWidth: 0 }}
                  >
                    {isLinkedAccount((account as any).type) && (
                      <View className="mr-0.5">
                        <Link width={12} height={12} />
                      </View>
                    )}
                    <Text
                      className="text-fg-1 font-semibold"
                      style={{
                        fontSize: 14,
                        fontWeight: '600',
                        lineHeight: 16.8,
                        letterSpacing: -0.084,
                      }}
                    >
                      {account.name}
                    </Text>
                    {isEVMAccount({ address: account.address }) && <EVMChip />}
                  </View>

                  {/* Account Address */}
                  <AddressText
                    value={account.address}
                    className="text-fg-2"
                    style={{
                      fontSize: 12,
                      fontWeight: '400',
                      lineHeight: 16.8,
                    }}
                  />
                </View>
              </View>
            </View>

            {/* Edit Icon Container - exact Figma layout */}
            <TouchableOpacity
              onPress={onEditPress}
              className="items-center justify-center"
              style={{ width: 24, height: 24 }}
            >
              <EditIcon width={24} height={24} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};
