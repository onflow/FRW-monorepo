import { navigation, bridge } from '@onflow/frw-context';
import { useWalletStore } from '@onflow/frw-stores';
import { type NFTModel } from '@onflow/frw-types';
import {
  NFTDetailView,
  NFTSelectionBar,
  type NFTDetailData,
  type NFTData,
  YStack,
  ExtensionHeader,
} from '@onflow/frw-ui';
import { getNFTCover, getNFTId } from '@onflow/frw-utils';
import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface NFTDetailScreenProps {
  nft?: NFTModel;
  selectedNFTs?: NFTModel[];
  onSelectionChange?: (nftId: string, selected: boolean) => void;
}

export function NFTDetailScreen({ nft, selectedNFTs, onSelectionChange }: NFTDetailScreenProps) {
  // navigation is imported directly from ServiceContext
  const { t } = useTranslation();
  const { activeAccount } = useWalletStore();
  const isExtension = bridge.getPlatform() === 'extension';

  // Determine if selection is enabled
  const isSelectable = selectedNFTs !== undefined && selectedNFTs !== null;

  // Check if current NFT is in selected list
  const initialSelected =
    isSelectable && selectedNFTs?.some((selectedNFT) => getNFTId(selectedNFT) === getNFTId(nft));
  const [isSelected, setIsSelected] = useState(initialSelected || false);

  // Convert NFTModel to NFTDetailData
  const convertToNFTDetailData = useCallback(
    (nftModel: NFTModel): NFTDetailData => ({
      id: nftModel.id,
      name: nftModel.name || 'Untitled NFT',
      image: getNFTCover(nftModel),
      collection: nftModel.collectionName,
      description: nftModel.description,
      contractName: nftModel.contractName,
      contractAddress: nftModel.contractAddress,
      collectionContractName: nftModel.collectionContractName,
    }),
    []
  );

  // Convert NFTModel to NFTData for selection bar
  const convertToNFTData = useCallback(
    (nftModel: NFTModel): NFTData => ({
      id: getNFTId(nftModel),
      name: nftModel.name || 'Untitled',
      image: getNFTCover(nftModel),
      collection: nftModel.collectionName || '',
    }),
    []
  );

  const nftDetailData = nft ? convertToNFTDetailData(nft) : null;

  // Get current selected NFTs array
  const getCurrentSelectedNFTs = useCallback((): NFTData[] => {
    if (!isSelectable || !selectedNFTs || !nft) return [];

    const otherSelectedNFTs = selectedNFTs
      .filter((selectedNFT) => getNFTId(selectedNFT) !== getNFTId(nft))
      .map(convertToNFTData);

    return isSelected ? [...otherSelectedNFTs, convertToNFTData(nft)] : otherSelectedNFTs;
  }, [isSelectable, selectedNFTs, nft, isSelected, convertToNFTData]);

  const currentSelectedNFTs = getCurrentSelectedNFTs();

  // Handle selection toggle
  const handleToggleSelection = useCallback(() => {
    if (isSelectable && nft) {
      const newSelectedState = !isSelected;
      setIsSelected(newSelectedState);

      // Communicate the change back to the parent screen
      if (onSelectionChange) {
        onSelectionChange(getNFTId(nft), newSelectedState);
      }
    }
  }, [isSelectable, nft, isSelected, onSelectionChange]);

  // Handle NFT removal from selection bar
  const handleRemoveNFT = useCallback(
    (nftId: string) => {
      if (onSelectionChange) {
        onSelectionChange(nftId, false);
      }
      // If the removed NFT is the current one, update local state
      if (nft && getNFTId(nft) === nftId) {
        setIsSelected(false);
      }
    },
    [onSelectionChange, nft]
  );

  // Handle continue action (could navigate to send confirmation)
  const handleContinue = useCallback(() => {
    // TODO: Implement navigation to next step in send flow
    console.log('Continue with selected NFTs:', currentSelectedNFTs);
    navigation.navigate('SendAmount', { selectedNFTs: currentSelectedNFTs });
  }, [currentSelectedNFTs, navigation]);

  // Update local selection state when props change
  useEffect(() => {
    if (isSelectable && selectedNFTs && nft) {
      const isCurrentlySelected = selectedNFTs.some(
        (selectedNFT) => getNFTId(selectedNFT) === getNFTId(nft)
      );
      setIsSelected(isCurrentlySelected);
    }
  }, [isSelectable, selectedNFTs, nft]);

  if (!nft || !nftDetailData) {
    return (
      <YStack flex={1} items="center" justify="center" p="$4">
        <YStack items="center" gap="$4">
          <YStack
            width={60}
            height={60}
            borderRadius="$4"
            bg="$bg3"
            items="center"
            justify="center"
          >
            <YStack width={24} height={24} borderRadius="$2" bg="$textTertiary" />
          </YStack>
          <YStack items="center" gap="$2">
            <YStack fontSize="$5" fontWeight="600" color="$color">
              {t('nft.notFound.title')}
            </YStack>
            <YStack fontSize="$4" color="$textSecondary" textAlign="center">
              {t('nft.notFound.message')}
            </YStack>
          </YStack>
        </YStack>
      </YStack>
    );
  }

  const owner = activeAccount
    ? {
        name: activeAccount.name,
        avatar: activeAccount.avatar || activeAccount.emojiInfo?.emoji,
        address: activeAccount.address,
      }
    : undefined;

  return (
    <YStack flex={1}>
      {isExtension && (
        <ExtensionHeader
          title={t('send.title')}
          help={true}
          onGoBack={() => navigation.goBack()}
          onNavigate={(link: string) => navigation.navigate(link)}
        />
      )}
      <NFTDetailView
        nft={nftDetailData}
        selected={isSelected}
        selectable={isSelectable}
        onToggleSelection={handleToggleSelection}
        owner={owner}
        showOwner={!!owner}
      />

      {/* Selection Bar - only shown when selection is enabled and NFTs are selected */}
      {isSelectable && currentSelectedNFTs.length > 0 && (
        <NFTSelectionBar
          selectedNFTs={currentSelectedNFTs}
          onRemoveNFT={handleRemoveNFT}
          onNFTPress={() => navigation.navigate('NFTView', { id: nftDetailData.id })}
          onContinue={handleContinue}
          continueText={t('buttons.continue')}
          isEditing={false}
        />
      )}
    </YStack>
  );
}
