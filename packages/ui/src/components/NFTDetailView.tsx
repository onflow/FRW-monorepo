import React from 'react';
import { YStack, ScrollView } from 'tamagui';

import { NFTInfoSection } from './NFTInfoSection';
import { NFTPropertiesGrid, type NFTProperty } from './NFTPropertiesGrid';
import { SelectableNFTImage } from './SelectableNFTImage';
import { BackgroundWrapper } from '../layout/BackgroundWrapper';

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
  };
  showOwner?: boolean;
  backgroundColor?: string;
}

export function NFTDetailView({
  nft,
  selected = false,
  selectable = false,
  onToggleSelection,
  owner,
  showOwner = false,
  backgroundColor = '$background',
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
    <BackgroundWrapper backgroundColor={backgroundColor}>
      <ScrollView flex={1} showsVerticalScrollIndicator={false}>
        <YStack w={345} gap={20}>
          {/* NFT Image */}
          <YStack items="center" alignSelf="stretch">
            <SelectableNFTImage
              src={nft.image}
              selected={selected}
              selectable={selectable}
              onToggleSelection={onToggleSelection}
              borderRadius={16}
              width={343}
              height={343}
            />
          </YStack>

          {/* NFT Content */}
          <YStack items="flex-end" gap={20} w={343}>
            {/* NFT Info Section */}
            <YStack alignSelf="stretch" gap={18}>
              <NFTInfoSection
                name={nft.name}
                collection={nft.collection}
                description={nft.description}
                owner={owner}
                showOwner={showOwner}
              />
            </YStack>

            {/* Properties Section */}
            {allProperties.length > 0 && (
              <YStack alignSelf="stretch" gap={20}>
                <NFTPropertiesGrid
                  properties={allProperties}
                  title="Properties"
                  columns={2}
                  gap={13}
                  propertyGap={9}
                />
              </YStack>
            )}
          </YStack>
        </YStack>
      </ScrollView>
    </BackgroundWrapper>
  );
}
