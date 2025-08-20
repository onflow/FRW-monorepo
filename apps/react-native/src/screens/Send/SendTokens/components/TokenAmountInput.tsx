import { type TokenModel } from '@onflow/frw-types';
import { type Currency } from '@onflow/frw-types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { useAndroidTextFix } from '@/lib';
import { SwitchVertical, VerifiedToken as VerifiedIcon } from 'icons';
import { ChevronDown, FlowLogo } from 'ui';

interface TokenAmountInputProps {
  selectedToken: TokenModel | null;
  formData: {
    tokenAmount: string;
    fiatAmount: string;
    isTokenMode: boolean;
  };
  onAmountChange: (text: string) => void;
  onToggleInputMode: () => void;
  onTokenSelectorPress: () => void;
  onMaxPress: () => void;
  tokenToUsdRate: number;
  currency: Currency;
}

export const TokenAmountInput = ({
  selectedToken,
  formData,
  onAmountChange,
  onToggleInputMode,
  onTokenSelectorPress,
  onMaxPress,
  tokenToUsdRate,
  currency = { name: 'USD', symbol: '$', rate: '1' },
}: TokenAmountInputProps) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const androidTextFix = useAndroidTextFix();
  const [tokenLogoError, setTokenLogoError] = useState(false);

  // Reset logo error when token changes
  useEffect(() => {
    setTokenLogoError(false);
  }, [selectedToken]);

  return (
    <View>
      {/* Send Tokens Title */}
      <View className="flex-row items-center gap-4 mb-3">
        <Text className="text-fg-1 text-xs font-normal w-[75px]" style={{ fontSize: 12 }}>
          {t('transaction.sendTokens')}
        </Text>
      </View>

      {/* Main Token Amount Row */}
      <View className="flex-row items-center justify-between gap-3">
        {/* Token Logo and Amount */}
        <View className="flex-row items-center gap-3 flex-1">
          {/* Token Logo - always show FlowLogo for FLOW tokens or on image error */}
          {selectedToken?.logoURI &&
          selectedToken?.symbol !== 'FLOW' &&
          selectedToken?.name !== 'FLOW' &&
          selectedToken.logoURI.trim() !== '' &&
          !tokenLogoError ? (
            <View style={{ width: 35.2, height: 35.2 }}>
              <Image
                source={{ uri: selectedToken.logoURI }}
                style={{ width: 35.2, height: 35.2, borderRadius: 17.6 }}
                resizeMode="cover"
                onError={() => {
                  console.log(
                    '[TokenAmountInput] Failed to load token logo, falling back to FlowLogo'
                  );
                  setTokenLogoError(true);
                }}
              />
            </View>
          ) : (
            <FlowLogo width={35.2} height={35.2} />
          )}

          {/* Amount Input - flexible width for full text display */}
          <View className="flex-1 flex-row items-center">
            {/* Dollar sign for fiat mode */}
            {!formData.isTokenMode && (
              <Text
                className="text-fg-1 font-medium"
                style={[
                  androidTextFix,
                  {
                    fontSize: 28,
                    lineHeight: 32,
                    fontWeight: '500',
                    includeFontPadding: false,
                    color: isDark ? '#FFFFFF' : '#000D07',
                    marginRight: 0,
                  },
                ]}
              >
                {currency.symbol}
              </Text>
            )}

            <TextInput
              value={formData.isTokenMode ? formData.tokenAmount : formData.fiatAmount}
              onChangeText={onAmountChange}
              placeholder={formData.isTokenMode ? '0.00' : '0.00'}
              keyboardType="numeric"
              className="text-fg-1 font-medium flex-1"
              style={[
                androidTextFix,
                {
                  fontSize: 28,
                  lineHeight: 32,
                  fontWeight: '500',
                  includeFontPadding: false,
                  paddingVertical: 0,
                  margin: 0,
                  minHeight: 32,
                  color: isDark ? '#FFFFFF' : '#000D07',
                },
              ]}
              placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 13, 7, 0.5)'}
              selectionColor={isDark ? '#00EF8B' : '#00B877'}
              selectTextOnFocus={true}
            />
          </View>
        </View>

        {/* Token Selector - flexible width */}
        <TouchableOpacity
          className="flex-row items-center justify-between px-3 py-2"
          style={{
            height: 35.2,
            borderRadius: 39,
            minWidth: 85,
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#FFFFFF',
          }}
          onPress={onTokenSelectorPress}
        >
          <View className="flex-row items-center gap-1">
            <Text
              className="text-fg-1 font-semibold"
              style={[
                androidTextFix,
                {
                  fontSize: 12,
                  lineHeight: 18,
                  fontWeight: '600',
                  includeFontPadding: false,
                  minWidth: 45,
                },
              ]}
              numberOfLines={1}
            >
              {selectedToken?.symbol || selectedToken?.name || t('placeholders.selectToken')}
            </Text>
            {/* Verified token icon - only show if token is verified */}
            {selectedToken?.isVerified !== false && <VerifiedIcon width={12} height={12} />}
          </View>
          {/* Chevron Down - 14x14px */}
          <View className="ml-2">
            <ChevronDown width={14} height={14} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Bottom Conversion Row */}
      <View className="flex-row items-center justify-between mt-3">
        {/* Swap Button and USD Value */}
        <View className="flex-row items-center gap-4">
          {/* Swap Button - exact 25x25px */}
          <TouchableOpacity
            className={`${
              isDark ? 'bg-overlay/10' : 'bg-surface-2/20'
            } items-center justify-center`}
            style={{
              width: 25,
              height: 25,
              borderRadius: 56.818180084228516,
              padding: 4.545454502105713,
            }}
            onPress={onToggleInputMode}
          >
            <SwitchVertical width={12} height={12} />
          </TouchableOpacity>

          {/* USD Value */}
          <Text
            className="text-fg-2"
            style={[
              androidTextFix,
              {
                fontSize: 14,
                lineHeight: 16,
                includeFontPadding: false,
                minWidth: 125,
              },
            ]}
            numberOfLines={1}
          >
            {formData.isTokenMode
              ? `${currency.symbol}${formData.fiatAmount}`
              : `${formData.tokenAmount} ${selectedToken?.symbol || 'FLOW'}`}
          </Text>
        </View>

        {/* Balance and MAX Button */}
        <View className="flex-row items-center justify-end gap-3 flex-1">
          <View style={{ alignItems: 'flex-end' }}>
            <Text
              className="text-fg-2"
              style={[
                androidTextFix,
                {
                  fontSize: 14,
                  lineHeight: 16,
                  textAlign: 'right',
                  includeFontPadding: false,
                  minWidth: 125,
                },
              ]}
              numberOfLines={1}
            >
              {selectedToken?.balance
                ? (() => {
                    const balanceString = selectedToken.balance.toString();
                    const parts = balanceString.split(' ');
                    if (parts.length >= 2) {
                      const numericBalance = parseFloat(parts[0]);
                      const tokenSymbol = parts.slice(1).join(' ');
                      return `${numericBalance.toFixed(8).replace(/\.?0+$/, '')} ${tokenSymbol}`;
                    }
                    return balanceString;
                  })()
                : '0 FLOW'}
            </Text>
          </View>

          {/* MAX Button */}
          <TouchableOpacity
            className="items-center justify-center px-3 py-1"
            style={{
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.1)',
              borderRadius: 39,
              paddingHorizontal: 10,
              paddingVertical: 3,
            }}
            onPress={onMaxPress}
          >
            <Text
              className="text-fg-1"
              style={[
                androidTextFix,
                {
                  fontSize: 12,
                  lineHeight: 18,
                  fontWeight: '600',
                  includeFontPadding: false,
                  color: isDark ? '#FFFFFF' : '#FFFFFF',
                  minWidth: 35,
                },
              ]}
            >
              MAX
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
