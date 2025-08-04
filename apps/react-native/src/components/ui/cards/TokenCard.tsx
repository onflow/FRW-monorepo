import { View, TouchableOpacity } from 'react-native';
import { Text } from '../typography/text';
import { IconView } from '../media/IconView';
import { VerifiedToken as VerifiedIcon } from 'icons';
import { TokenInfo } from '@/types';
import { formatCurrencyStringForDisplay } from '@/lib/string';
export interface TokenCardProps {
  token: TokenInfo;
  onPress?: () => void;
}

export function TokenCard({ token, onPress }: TokenCardProps) {
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
              {(() => {
                const balance = token.displayBalance ?? token.balance ?? '0';
                const numericBalance = parseFloat(balance);
                const formattedBalance = isNaN(numericBalance)
                  ? '0'
                  : formatCurrencyStringForDisplay({ value: numericBalance });
                return `${formattedBalance} ${token.symbol ?? ''}`;
              })()}
            </Text>
          </View>

          {/* Bottom row: Balance + change percentage */}
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-fg-2 text-left text-sm" numberOfLines={1} ellipsizeMode="tail">
                {(() => {
                  if (
                    !token.balanceInUSD ||
                    token.balanceInUSD === '0' ||
                    token.balanceInUSD === '0.00'
                  )
                    return '';
                  const usdValue = parseFloat(token.balanceInUSD);
                  return !isNaN(usdValue) && usdValue > 0 ? `$${usdValue.toFixed(2)}` : '';
                })()}
              </Text>
            </View>
            {token.change != null && token.change !== '' && (
              <View className="bg-primary/10 rounded-xl px-1.5 py-1">
                <Text className="text-primary text-xs">{token.change}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
