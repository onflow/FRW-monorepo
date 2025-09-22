import React from 'react';
import { YStack, ScrollView } from 'tamagui';

import { NFTInfoSection } from './NFTInfoSection';
import { NFTPropertiesGrid, type NFTProperty } from './NFTPropertiesGrid';
import { SelectableNFTImage } from './SelectableNFTImage';

export interface NFTDetailData {
  id?: string;
  name: string;
  image: string;
  collection?: string;
  description?: string;
  contractName?: string;
  contractAddress?: string;
  collectionContractName?: string;
  properties?: NFTProperty[];
  type?: 'evm' | 'flow'; // determines if EVM badge should show
  contractType?: string; // 'ERC721' | 'ERC1155'
  amount?: number; // Available quantity for ERC1155
}

export interface NFTDetailViewProps {
  nft: NFTDetailData;
  selected?: boolean;
  selectable?: boolean;
  onToggleSelection?: () => void;
  owner?: {
    name?: string;
    avatar?: string;
    address?: string;
    emojiInfo?: {
      emoji?: string;
      color?: string;
    };
  };
  showOwner?: boolean;
  backgroundColor?: string;
  contentPadding?: number;
}

export function NFTDetailView({
  nft,
  selected = false,
  selectable = false,
  onToggleSelection,
  owner,
  showOwner = false,
  backgroundColor = '$bgDrawer',
  contentPadding = 0,
}: NFTDetailViewProps) {
  // Generate properties from NFT data
  const generateProperties = (): NFTProperty[] => {
    const props: NFTProperty[] = [];

    if (nft.id) {
      props.push({ label: 'ID', value: nft.id });
    }
    if (nft.contractName) {
      props.push({ label: 'Contract', value: nft.contractName });
    }
    if (nft.contractAddress) {
      props.push({
        label: 'Address',
        value: `${nft.contractAddress.slice(0, 8)}...${nft.contractAddress.slice(-4)}`,
      });
    }
    if (nft.collectionContractName && nft.collectionContractName !== nft.contractName) {
      props.push({ label: 'Collection Contract', value: nft.collectionContractName });
    }

    // Add custom properties if provided
    if (nft.properties) {
      props.push(...nft.properties);
    }

    return props;
  };

  const allProperties = generateProperties();

  return (
    <YStack bg={backgroundColor}>
      <ScrollView flex={1} showsVerticalScrollIndicator={false}>
        <YStack px={contentPadding} pb={20}>
          {/* NFT Image */}
          <YStack mb={23}>
            <SelectableNFTImage
              src={nft.image}
              selected={selected}
              selectable={selectable}
              onImagePress={selectable ? onToggleSelection : undefined}
              borderRadius={16}
              contractType={nft.contractType}
              amount={nft.amount}
            />
          </YStack>

          {/* NFT Info */}
          <YStack mb={20}>
            <NFTInfoSection
              name={nft.name}
              collection={nft.collection}
              description={nft.description}
              owner={owner}
              showOwner={showOwner}
              spacing={18}
            />
          </YStack>

          {/* Properties */}
          {allProperties.length > 0 && (
            <NFTPropertiesGrid
              properties={allProperties}
              title="Properties"
              columns={2}
              gap={9}
              titleSpacing={13}
            />
          )}
        </YStack>
      </ScrollView>
    </YStack>
  );
}
