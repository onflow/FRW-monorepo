import { type Currency, type TokenModel } from '@onflow/frw-types';
import { getDisplayBalanceWithSymbol } from '@onflow/frw-utils';
import { TouchableOpacity, View } from 'react-native';

import { formatCurrencyStringForDisplay } from '@/lib/string';
import { VerifiedToken as VerifiedIcon } from 'icons';

import { AccessibilityStatus } from '../media/AccessibilityStatus';
import { IconView } from '../media/IconView';
import { Text } from '../typography/text';

export interface TokenCardProps {
  token: TokenModel;
  currency: Currency;
  isAccessible?: boolean;
  onPress?: () => void;
}

export function TokenCard({
  token,
  currency = { name: 'USD', symbol: '$', rate: '1' },
  onPress,
  isAccessible = true,
}: TokenCardProps) {
  return (
    <TouchableOpacity onPress={onPress} className="w-full" activeOpacity={0.7}>
      <View className="flex-row items-center py-4 px-0 w-full gap-2">
        <IconView src={token.logoURI ?? ''} />
        {/* Token name + verified icon + balance */}
        <View className="flex-1 ml-2 gap-1">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-1">
              <Text
                className="font-semibold text-sm text-fg-1"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {token.name}
              </Text>
              {token.isVerified && <VerifiedIcon width={16} height={16} />}
            </View>
            <Text
              className="text-sm text-fg-1 min-w-3 text-right"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {getDisplayBalanceWithSymbol(token) || '0'}
            </Text>
          </View>

          {/* Bottom row: Balance + change percentage */}
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-2">
              <Text className="text-fg-2 text-left text-sm" numberOfLines={1} ellipsizeMode="tail">
                {(() => {
                  if (token.priceInCurrency === '0' || token.priceInCurrency === '0.00') return '';
                  const currencyValue = parseFloat(token.priceInCurrency ?? '0');
                  return !isNaN(currencyValue) && currencyValue > 0
                    ? `${currency.symbol}${formatCurrencyStringForDisplay({ value: currencyValue, digits: 4 })}`
                    : '';
                })()}
              </Text>
              <AccessibilityStatus isAccessible={isAccessible} />
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-fg-2 text-left text-sm" numberOfLines={1} ellipsizeMode="tail">
                {(() => {
                  if (
                    !token.balanceInCurrency ||
                    token.balanceInCurrency === '0' ||
                    token.balanceInCurrency === '0.00'
                  )
                    return '';
                  const currencyValue = parseFloat(token.balanceInCurrency);
                  return !isNaN(currencyValue) && currencyValue > 0
                    ? `${currency.symbol}${currencyValue.toFixed(2)}`
                    : '';
                })()}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
