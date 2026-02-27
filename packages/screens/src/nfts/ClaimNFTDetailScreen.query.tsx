import { VerifiedToken } from '@onflow/frw-icons';
import { useWalletStore, walletSelectors } from '@onflow/frw-stores';
import {
  Avatar,
  Button,
  ClaimNFTAssetDrawer,
  NFTGrid,
  ScrollView,
  Separator,
  Text,
  XStack,
  YStack,
  useTheme,
} from '@onflow/frw-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ClaimItem, ClaimReceiver } from '../tokens/claim-types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ClaimNFTDetailScreenProps {
  item: ClaimItem;
  sender?: ClaimReceiver;
  onClaim?: () => void;
  onReject?: () => void;
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export function ClaimNFTDetailScreen({
  item,
  onClaim,
  onReject,
}: ClaimNFTDetailScreenProps): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const [claimDrawerVisible, setClaimDrawerVisible] = useState(false);

  const allAccounts = useWalletStore(walletSelectors.getAllAccounts);
  const activeAccount = useWalletStore(walletSelectors.getActiveAccount);

  const nftItems = (item.nftItems ?? []).map((n) => ({
    id: n.id,
    name: n.name,
    image: n.image,
    thumbnail: n.thumbnail,
  }));

  const itemCount = item.nftItems?.length ?? parseInt(item.amount, 10);

  return (
    <YStack flex={1} bg="$bg">
      <ScrollView flex={1} showsVerticalScrollIndicator={false}>
        <YStack>
          {/* Collection header */}
          <YStack items="center" pt="$6" pb="$4" px="$4" gap="$2">
            <Avatar src={item.logoURI} alt={item.name} fallback={item.name[0]} size={100} />
            <Text fontSize={13} color="$text2" mt="$1">
              {item.date}
            </Text>
            <XStack items="center" gap="$1.5">
              <Text fontSize={20} fontWeight="700" color="$text1">
                {item.name}
              </Text>
              {item.isVerified && (
                <VerifiedToken size={18} color={theme.success?.val ?? '#41CC5D'} />
              )}
            </XStack>

            {/* Info chips */}
            <XStack gap="$2" wrap="wrap" justify="center">
              {item.website && (
                <XStack bg="$bg2" rounded="$10" px="$3" py="$1.5" items="center">
                  <Text fontSize={13} color="$text2">
                    {t('claimNFTDetail.website', 'Website')}:{' '}
                    <Text fontSize={13} color="$text1" fontWeight="500">
                      {item.website}
                    </Text>
                  </Text>
                </XStack>
              )}
              <XStack bg="$bg2" rounded="$10" px="$3" py="$1.5" items="center">
                <Text fontSize={13} color="$text2">
                  {t('claimNFTDetail.items', 'Items')}:{' '}
                  <Text fontSize={13} color="$text1" fontWeight="500">
                    {itemCount}
                  </Text>
                </Text>
              </XStack>
            </XStack>
          </YStack>

          {/* Description */}
          {item.description && (
            <YStack px="$4" pb="$3" gap="$1">
              <Text fontSize={16} fontWeight="600" color="$text1">
                {t('claimNFTDetail.about', 'About')}
              </Text>
              <Text fontSize={14} color="$text2" lineHeight={20}>
                {item.description}
              </Text>
            </YStack>
          )}

          <Separator borderColor="$borderGlass" borderWidth={0.5} />

          {/* NFT grid */}
          <YStack px="$4" pt="$3" flex={1} minHeight={300}>
            <NFTGrid
              data={nftItems}
              isLoading={nftItems.length === 0 && itemCount > 0}
              selectable={false}
              onNFTPress={() => {}}
              emptyTitle={t('claimNFTDetail.empty', 'No NFTs')}
            />
          </YStack>

          {/* Spacer to clear fixed bottom bar */}
          <YStack height={100} />
        </YStack>
      </ScrollView>

      {/* Bottom action buttons */}
      <XStack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        px="$4"
        pb="$8"
        pt="$3"
        gap="$3"
        bg="$bg"
      >
        <YStack flex={1}>
          <Button variant="secondary" size="large" fullWidth onPress={onReject}>
            {t('claim.detail.reject', 'Reject')}
          </Button>
        </YStack>
        <YStack flex={1}>
          <Button
            variant="inverse"
            size="large"
            fullWidth
            onPress={() => setClaimDrawerVisible(true)}
          >
            {t('claim.detail.claim', 'Claim')}
          </Button>
        </YStack>
      </XStack>

      {activeAccount && (
        <ClaimNFTAssetDrawer
          visible={claimDrawerVisible}
          collectionName={item.name}
          collectionSymbol={item.symbol}
          collectionLogoURI={item.logoURI}
          isVerified={item.isVerified}
          nftItems={nftItems}
          totalCount={itemCount}
          receiver={activeAccount}
          allReceivers={allAccounts}
          onConfirm={() => {
            setClaimDrawerVisible(false);
            onClaim?.();
          }}
          onClose={() => setClaimDrawerVisible(false)}
          titleText={t('claim.drawer.title', 'Claim assets')}
          claimText={t('claim.drawer.cta', 'Claim')}
          warningText={t(
            'claimNFTDetail.warningText',
            'By accepting this NFT collection you will automatically accept future deposits of it as well'
          )}
        />
      )}
    </YStack>
  );
}
