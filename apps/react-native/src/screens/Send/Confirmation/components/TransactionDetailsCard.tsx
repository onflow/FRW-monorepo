import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Image } from 'react-native';

import { VerifiedToken as VerifiedIcon } from 'icons';
import { FlowLogo, Text } from 'ui';

import { NFTDisplayGrid } from './NFTDisplayGrid';

interface Token {
  symbol?: string;
  name?: string;
  logoURI?: string;
  identifier?: string;
  decimal?: number;
  contractAddress?: string;
}

interface NFT {
  id: string | number;
  name?: string;
  thumbnail?: string | object;
}

interface FormData {
  tokenAmount: string;
  fiatAmount: string;
}

interface TransactionDetailsCardProps {
  transactionType: string;
  selectedToken?: Token;
  selectedNFTs?: NFT[];
  formData: FormData;
}

export const TransactionDetailsCard: React.FC<TransactionDetailsCardProps> = ({
  transactionType,
  selectedToken,
  selectedNFTs,
  formData,
}) => {
  const { t } = useTranslation();
  function formatAmount(val: string | number | undefined | null): string {
    // Handle undefined, null, empty string, or whitespace-only strings
    if (val === undefined || val === null || val === '' || String(val).trim() === '') {
      return '0';
    }

    const str = String(val).trim();
    const num = parseFloat(str);

    // Handle invalid numbers (NaN)
    if (isNaN(num)) {
      return '0';
    }

    // Handle zero values
    if (num === 0) {
      return '0';
    }

    // For valid numbers, preserve existing formatting if it looks good
    if (str.includes('.')) {
      // Remove trailing zeros after decimal point
      return num.toString();
    }

    // For whole numbers, don't add unnecessary decimal
    return num.toString();
  }

  function formatUsdAmount(val: string | number | undefined | null): string {
    const num = parseFloat(String(val || '0'));
    return isNaN(num) ? '0.00' : num.toFixed(2);
  }

  const isTokenTransaction = transactionType === 'tokens';
  const isNFTTransaction = ['single-nft', 'multiple-nfts'].includes(transactionType);
  const amount = formData.tokenAmount;

  return (
    <View
      className="bg-white/10 rounded-2xl w-full"
      style={{
        paddingHorizontal: 16,
        paddingVertical: 2,
        height: 141,
        justifyContent: 'center',
      }}
    >
      {/* Column layout with gaps */}
      <View style={{ gap: 12 }}>
        {/* Header Row */}
        <Text
          style={{
            fontSize: 12,
            fontWeight: '400',
            lineHeight: 16,
            color: 'rgba(255, 255, 255, 0.8)',
          }}
        >
          {transactionType === 'tokens' ? t('transaction.sendTokens') : t('transaction.sendNFTs')}
        </Text>

        {/* Amount and Token Row */}
        {isTokenTransaction && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 11,
            }}
          >
            {/* Token Logo - always show FlowLogo for FLOW tokens or on image error */}
            {selectedToken?.logoURI &&
            selectedToken?.symbol !== 'FLOW' &&
            selectedToken?.name !== 'FLOW' &&
            selectedToken.logoURI.trim() !== '' ? (
              <Image
                source={{ uri: selectedToken.logoURI }}
                style={{
                  width: 35.2,
                  height: 35.2,
                  borderRadius: 17.6,
                }}
                resizeMode="cover"
                onError={() => {
                  console.log(
                    '[TransactionDetailsCard] Failed to load token logo, falling back to Flow logo'
                  );
                }}
              />
            ) : (
              <FlowLogo width={35.2} height={35.2} />
            )}

            {/* Amount - with explicit width to ensure it displays */}
            <View style={{ flex: 1, paddingHorizontal: 8 }}>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: '500',
                  lineHeight: 32,
                  color: '#FFFFFF',
                }}
              >
                {formatAmount(amount)}
              </Text>
            </View>

            {/* Token Selector */}
            <View
              className="bg-white/10 rounded-full flex-row items-center"
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                gap: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  lineHeight: 18,
                  letterSpacing: -0.006,
                  color: '#FFFFFF',
                  minWidth: 45,
                }}
              >
                {selectedToken?.symbol || selectedToken?.name || 'FLOW'}
              </Text>
              <VerifiedIcon width={10} height={10} />
            </View>
          </View>
        )}

        {/* USD Value Row */}
        {isTokenTransaction && (
          <Text
            style={{
              fontSize: 14,
              fontWeight: '400',
              lineHeight: 16,
              color: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            {`$${formatUsdAmount(formData.fiatAmount)}`}
          </Text>
        )}

        {/* NFT Display Row */}
        {isNFTTransaction && selectedNFTs && (
          <NFTDisplayGrid nfts={selectedNFTs} transactionType={transactionType} />
        )}
      </View>
    </View>
  );
};
