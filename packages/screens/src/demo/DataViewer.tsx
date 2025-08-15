import { ScrollView, View, Text, Button, XStack, YStack } from '@onflow/frw-ui';
import React, { useEffect } from 'react';

import { useDemoDataStore } from '../stores';

export const DataViewer: React.FC = () => {
  const {
    tokens,
    nfts,
    collections,
    accounts,
    activeAccount,
    isLoadingTokens,
    isLoadingNFTs,
    isLoadingAccounts,
    tokensError,
    nftsError,
    accountsError,
    fetchTokens,
    fetchNFTs,
    fetchCollections,
    fetchAccounts,
  } = useDemoDataStore();

  useEffect(() => {
    console.log('📊 DataViewer: Loading all data...');
    fetchAccounts();
    fetchTokens();
    fetchNFTs();
    fetchCollections();
  }, [fetchAccounts, fetchTokens, fetchNFTs, fetchCollections]);

  useEffect(() => {
    console.log('📊 DataViewer: Data state updated:', {
      tokens: tokens.length,
      nfts: nfts.length,
      collections: collections.length,
      accounts: accounts.length,
      activeAccount: activeAccount?.name,
      loading: { tokens: isLoadingTokens, nfts: isLoadingNFTs, accounts: isLoadingAccounts },
      errors: { tokens: tokensError, nfts: nftsError, accounts: accountsError },
    });
  }, [
    tokens,
    nfts,
    collections,
    accounts,
    activeAccount,
    isLoadingTokens,
    isLoadingNFTs,
    isLoadingAccounts,
    tokensError,
    nftsError,
    accountsError,
  ]);

  return (
    <View flex={1} bg="$background" p="$4">
      <ScrollView>
        <YStack space="$6">
          <Text fontSize="$8" fontWeight="bold" color="$color" textAlign="center">
            Demo Data Viewer
          </Text>

          {/* Accounts Section */}
          <YStack space="$3">
            <XStack items="center" justify="space-between">
              <Text fontSize="$6" fontWeight="600" color="$color">
                Accounts ({accounts.length})
              </Text>
              {isLoadingAccounts && <Text color="$textSecondary">Loading...</Text>}
              {accountsError && <Text color="$error">Error!</Text>}
            </XStack>

            {accounts.map((account) => (
              <View key={account.id} p="$3" bg="$bg2" borderRadius="$3">
                <XStack items="center" space="$3">
                  <Text fontSize="$6">{account.emojiInfo?.emoji || '👤'}</Text>
                  <YStack flex={1}>
                    <Text fontWeight="600" color="$color">
                      {account.name} {account.isActive && '(Active)'}
                    </Text>
                    <Text fontSize="$3" color="$textSecondary" fontFamily="$mono">
                      {account.address}
                    </Text>
                  </YStack>
                </XStack>
              </View>
            ))}
          </YStack>

          {/* Tokens Section */}
          <YStack space="$3">
            <XStack items="center" justify="space-between">
              <Text fontSize="$6" fontWeight="600" color="$color">
                Tokens ({tokens.length})
              </Text>
              {isLoadingTokens && <Text color="$textSecondary">Loading...</Text>}
              {tokensError && <Text color="$error">Error!</Text>}
            </XStack>

            {tokens.map((token) => (
              <View key={token.id} p="$3" bg="$bg2" borderRadius="$3">
                <XStack items="center" justify="space-between">
                  <YStack>
                    <Text fontWeight="600" color="$color">
                      {token.name} ({token.symbol})
                    </Text>
                    <Text fontSize="$3" color="$textSecondary">
                      Balance: {token.balance}
                    </Text>
                  </YStack>
                  <Text color="$textSecondary">${token.price}</Text>
                </XStack>
              </View>
            ))}
          </YStack>

          {/* Collections Section */}
          <YStack space="$3">
            <Text fontSize="$6" fontWeight="600" color="$color">
              Collections ({collections.length})
            </Text>

            {collections.map((collection) => (
              <View key={collection.id} p="$3" bg="$bg2" borderRadius="$3">
                <Text fontWeight="600" color="$color">
                  {collection.name}
                </Text>
                <Text fontSize="$3" color="$textSecondary">
                  {collection.description}
                </Text>
              </View>
            ))}
          </YStack>

          {/* NFTs Section */}
          <YStack space="$3">
            <XStack items="center" justify="space-between">
              <Text fontSize="$6" fontWeight="600" color="$color">
                NFTs ({nfts.length})
              </Text>
              {isLoadingNFTs && <Text color="$textSecondary">Loading...</Text>}
              {nftsError && <Text color="$error">Error!</Text>}
            </XStack>

            {nfts.map((nft) => (
              <View key={nft.id} p="$3" bg="$bg2" borderRadius="$3">
                <XStack items="center" space="$3">
                  <View width={60} height={60} bg="$bg3" borderRadius="$3" />
                  <YStack flex={1}>
                    <Text fontWeight="600" color="$color">
                      {nft.name}
                    </Text>
                    <Text fontSize="$3" color="$textSecondary">
                      {nft.collectionName}
                    </Text>
                    <Text fontSize="$2" color="$textSecondary" numberOfLines={2}>
                      {nft.description}
                    </Text>
                  </YStack>
                </XStack>
              </View>
            ))}
          </YStack>

          {/* Refresh Button */}
          <Button
            variant="primary"
            onPress={() => {
              fetchAccounts();
              fetchTokens();
              fetchNFTs();
              fetchCollections();
            }}
          >
            <Text>Refresh All Data</Text>
          </Button>
        </YStack>
      </ScrollView>
    </View>
  );
};

export default DataViewer;
