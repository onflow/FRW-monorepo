import { type CadenceService } from '@onflow/frw-cadence';
import { WalletType } from '@onflow/frw-types';
import { ScrollView, View, Text, Button, Card, YStack, XStack } from '@onflow/frw-ui';
import React, { useEffect } from 'react';

import { useDemoDataStore } from '../stores';
import type { BaseScreenProps } from '../types';

interface HomeScreenProps extends BaseScreenProps {
  // Props passed from iOS or other platforms
  address?: string;
  network?: string;

  // Optional cadence service for blockchain operations
  cadenceService?: CadenceService;

  // Navigation handlers - these should be provided by the consuming app
  onNavigateToSelectTokens?: () => void;
  onNavigateToColorDemo?: () => void;
  onNavigateToNFTDetail?: (params: {
    nft: {
      id: string;
      name: string;
      description: string;
      collectionName: string;
      contractName: string;
      contractAddress: string;
      thumbnail: string;
      type: WalletType;
    };
    selectedNFTs?: Array<{
      id: string;
      name: string;
      collectionName: string;
      type: WalletType;
    }>;
  }) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  navigation,
  bridge,
  t,
  address,
  network,
  cadenceService,
  onNavigateToSelectTokens,
  onNavigateToColorDemo,
  onNavigateToNFTDetail,
}) => {
  // Demo data store
  const {
    accounts,
    activeAccount,
    tokens,
    nfts,
    isLoadingAccounts,
    isLoadingTokens,
    isLoadingNFTs,
    fetchAccounts,
    fetchTokens,
    fetchNFTs,
  } = useDemoDataStore();
  // Load demo data on mount
  useEffect(() => {
    console.log('🏠 HomeScreen: Loading demo data...');
    fetchAccounts();
    fetchTokens();
    fetchNFTs();
  }, [fetchAccounts, fetchTokens, fetchNFTs]);

  // Debug log to see data state
  useEffect(() => {
    console.log('🏠 HomeScreen data state:', {
      accounts: accounts.length,
      activeAccount: activeAccount?.name,
      tokens: tokens.length,
      nfts: nfts.length,
      isLoadingAccounts,
      isLoadingTokens,
      isLoadingNFTs,
    });
  }, [accounts, activeAccount, tokens, nfts, isLoadingAccounts, isLoadingTokens, isLoadingNFTs]);

  useEffect(() => {
    const getAddr = async () => {
      if (!cadenceService) return;

      try {
        const res = await cadenceService.getAddr('0x65002784202869ce');
        console.log('🏠 HomeScreen getAddr:', res);
      } catch (error) {
        console.error('Failed to get address:', error);
      }
    };
    getAddr();
  }, [cadenceService]);

  useEffect(() => {
    console.log('🏠 HomeScreen mounted with params:', { address, network });
  }, [address, network]);

  const sendTx = async () => {
    if (!cadenceService) {
      console.log('🏠 HomeScreen: No cadenceService available');
      return;
    }

    try {
      const res = await cadenceService.emptyTx('Johnson');
      console.log('🏠 HomeScreen emptyTx:', res);
    } catch (error) {
      console.error('Failed to send transaction:', error);
    }
  };

  const handleSelectTokens = () => {
    if (onNavigateToSelectTokens) {
      onNavigateToSelectTokens();
    } else {
      navigation.navigate('SelectTokens', {});
    }
  };

  const handleColorDemo = () => {
    if (onNavigateToColorDemo) {
      onNavigateToColorDemo();
    } else {
      navigation.navigate('ColorDemo', {});
    }
  };

  const handleNFTDetailSelectable = () => {
    const params = {
      nft: {
        id: 'spring-tide-1',
        name: 'Spring Tide #1',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        collectionName: 'NBA Top Shot',
        contractName: 'TopShot',
        contractAddress: '0x0b2a3299cc857e29',
        thumbnail: 'https://via.placeholder.com/400x400/4ade80/ffffff?text=Spring+Tide+%231',
        type: WalletType.Flow,
      },
      selectedNFTs: [
        {
          id: 'spring-tide-1',
          name: 'Spring Tide #1',
          collectionName: 'NBA Top Shot',
          type: WalletType.Flow,
        },
        {
          id: 'spring-tide-2',
          name: 'Spring Tide #2',
          collectionName: 'NBA Top Shot',
          type: WalletType.Flow,
        },
        {
          id: 'spring-tide-3',
          name: 'Spring Tide #3',
          collectionName: 'NBA Top Shot',
          type: WalletType.Flow,
        },
        {
          id: 'spring-tide-4',
          name: 'Spring Tide #4',
          collectionName: 'NBA Top Shot',
          type: WalletType.Flow,
        },
      ],
    };

    if (onNavigateToNFTDetail) {
      onNavigateToNFTDetail(params);
    } else {
      navigation.navigate('NFTDetail', params);
    }
  };

  const handleNFTDetailViewOnly = () => {
    const params = {
      nft: {
        id: 'spring-tide-view-only',
        name: 'Spring Tide #1 (View Only)',
        description: 'This NFT is for viewing only, not selectable.',
        collectionName: 'NBA Top Shot',
        contractName: 'TopShot',
        contractAddress: '0x0b2a3299cc857e29',
        thumbnail: 'https://via.placeholder.com/400x400/22c55e/ffffff?text=View+Only',
        type: WalletType.Flow,
      },
      // selectedNFTs: undefined - selection disabled
    };

    if (onNavigateToNFTDetail) {
      onNavigateToNFTDetail(params);
    } else {
      navigation.navigate('NFTDetail', params);
    }
  };

  return (
    <ScrollView flex={1} bg="$background">
      <YStack flex={1} justify="center" items="center" p="$5" space="$6">
        <Text
          variant="heading"
          fontSize="$9"
          fontWeight="bold"
          color="$color"
          textAlign="center"
          mb="$4"
        >
          {t('home.title')}
        </Text>

        {/* Display props from iOS */}
        <YStack width="100%" space="$3" mb="$4">
          <Card variant="elevated" bg="$blue1" borderColor="$blue5" p="$4">
            <View minHeight={30} justify="center">
              <Text fontWeight="500" color="$blue11" numberOfLines={2} ellipsizeMode="middle">
                {t('home.address')}: {address || activeAccount?.address || t('home.notProvided')}
              </Text>
            </View>
          </Card>

          <Card variant="elevated" bg="$purple1" borderColor="$purple5" p="$4">
            <View minHeight={30} justify="center">
              <Text fontWeight="500" color="$purple11" numberOfLines={1} ellipsizeMode="tail">
                {t('home.network')}: {network || t('home.notProvided')}
              </Text>
            </View>
          </Card>
        </YStack>

        {/* Account Info */}
        {activeAccount && (
          <YStack width="100%" space="$2" mb="$4">
            <Text fontWeight="600" fontSize="$6" color="$color" mb="$2">
              {t('home.activeAccount')}
            </Text>
            <Card variant="elevated" bg="$green1" borderColor="$green5" p="$4">
              <XStack items="center" space="$3">
                <Text fontSize="$8">{activeAccount.emojiInfo?.emoji || '👤'}</Text>
                <YStack flex={1}>
                  <Text fontWeight="600" color="$green11">
                    {activeAccount.name}
                  </Text>
                  <Text fontSize="$3" color="$green10" fontFamily="$mono">
                    {activeAccount.address}
                  </Text>
                </YStack>
              </XStack>
            </Card>
          </YStack>
        )}

        {/* Data Summary */}
        <YStack width="100%" space="$2" mb="$4">
          <Text fontWeight="600" fontSize="$6" color="$color" mb="$2">
            {t('home.walletSummary')}
          </Text>

          <XStack space="$3">
            <Card variant="elevated" bg="$orange1" borderColor="$orange5" p="$4" flex={1}>
              <YStack items="center" space="$1">
                <Text fontSize="$7" fontWeight="bold" color="$orange11">
                  {isLoadingTokens ? '...' : tokens.length}
                </Text>
                <Text fontSize="$3" color="$orange10" textAlign="center">
                  {t('home.tokens')}
                </Text>
              </YStack>
            </Card>

            <Card variant="elevated" bg="$pink1" borderColor="$pink5" p="$4" flex={1}>
              <YStack items="center" space="$1">
                <Text fontSize="$7" fontWeight="bold" color="$pink11">
                  {isLoadingNFTs ? '...' : nfts.length}
                </Text>
                <Text fontSize="$3" color="$pink10" textAlign="center">
                  {t('home.nfts')}
                </Text>
              </YStack>
            </Card>
          </XStack>
        </YStack>

        {/* Send To Actions */}
        <YStack width="100%" space="$2" py="$2">
          <Text fontWeight="600" fontSize="$6" color="$color" mb="$2">
            {t('home.sendToActions')}
          </Text>

          <Button size="large" variant="secondary" onPress={sendTx}>
            <Text>{t('home.sendTx')}</Text>
          </Button>

          <Button size="large" variant="primary" onPress={handleSelectTokens}>
            <Text>{t('home.send')}</Text>
          </Button>
        </YStack>

        {/* Navigation buttons */}
        <YStack width="100%" space="$2" py="$2">
          <Text fontWeight="600" fontSize="$6" color="$color" mb="$2">
            {t('home.navigation')}
          </Text>

          <Button size="large" variant="success" onPress={handleColorDemo}>
            <Text color="$color" fontWeight="bold">
              {t('home.viewColors')}
            </Text>
          </Button>

          <Button size="large" variant="secondary" onPress={handleNFTDetailSelectable}>
            <Text color="white" fontWeight="bold">
              View NFT Detail (Selectable)
            </Text>
          </Button>

          <Button size="large" variant="success" onPress={handleNFTDetailViewOnly}>
            <Text color="white" fontWeight="bold">
              View NFT Detail (View Only)
            </Text>
          </Button>
        </YStack>
      </YStack>
    </ScrollView>
  );
};

export default HomeScreen;
