import { Button, CardMedia } from '@mui/material';
import { useSendStore } from '@onflow/frw-stores';
import { type CollectionModel, type NFTModel, WalletType } from '@onflow/frw-types';
import React from 'react';
import { useNavigate } from 'react-router';

import SendIcon from '@/ui/assets/svg/detailSend.svg';

interface NFTSendButtonProps {
  nftDetail: any;
  media: any;
  collectionInfo?: any;
  isAccessibleNft?: boolean;
  walletType?: WalletType;
}

const NFTSendButton: React.FC<NFTSendButtonProps> = ({
  nftDetail,
  media,
  collectionInfo,
  isAccessibleNft = true,
  walletType = WalletType.Flow,
}) => {
  const navigate = useNavigate();
  const {
    setSelectedCollection,
    setSelectedNFTs,
    setCurrentStep,
    setTransactionType,
    selectedCollection,
  } = useSendStore();

  const handleSendClick = async () => {
    try {
      setTransactionType('single-nft');
      setCurrentStep('nft-detail');

      // Validate required data
      if (!nftDetail?.id) {
        throw new Error('NFT ID is required');
      }

      // Check for contract name in different possible locations
      const contractName = nftDetail?.collectionContractName || nftDetail?.contractName;
      if (!contractName) {
        throw new Error('Collection contract name is required');
      }

      // Create NFT data with proper fallbacks for both Flow and EVM NFTs
      const nftData: NFTModel = {
        id: nftDetail.id,
        name: media?.title || nftDetail.name,
        description: media?.description || '',
        thumbnail: media?.image || nftDetail.collectionSquareImage,
        contractName: contractName,
        contractAddress: nftDetail.collectionContractAddress || nftDetail.contractAddress,
        collectionName: nftDetail.collectionName || contractName,
        collectionContractName: contractName,
        flowIdentifier: nftDetail.flowIdentifier,
        address: nftDetail.contractAddress || nftDetail.collectionContractAddress,
        evmAddress:
          nftDetail.evmAddress || nftDetail.contractAddress || nftDetail.collectionContractAddress,
        type: walletType,
      };

      // Create collection data with proper fallbacks
      const contractAddress =
        nftDetail.collectionContractAddress || nftDetail.contractAddress || '';
      const evmContractAddress =
        nftDetail.evmAddress ||
        nftDetail.contractAddress ||
        nftDetail.collectionContractAddress ||
        '';

      // Create proper path fallbacks for both Flow and EVM NFTs
      const createPathFallbacks = () => {
        if (collectionInfo?.path) {
          // Use existing collection info paths
          return {
            private_path: collectionInfo.path.privatePath || collectionInfo.path.private_path || '',
            public_path: collectionInfo.path.publicPath || collectionInfo.path.public_path || '',
            storage_path: collectionInfo.path.storagePath || collectionInfo.path.storage_path || '',
          };
        } else {
          // For EVM NFTs, use a generic path structure
          return {
            private_path: `/storage/${contractName}`,
            public_path: `/public/${contractName}`,
            storage_path: `/storage/${contractName}`,
          };
        }
      };

      // For EVM NFTs, use the EVM contract address as the ID
      // For Flow NFTs, use the contract name as the ID
      const collectionId = walletType === WalletType.EVM ? evmContractAddress : contractName;

      const basicCollection: CollectionModel = {
        id: collectionId,
        name: contractName,
        contractName: contractName,
        address: contractAddress,
        evmAddress: evmContractAddress,
        description: collectionInfo?.description || '',
        logoURI: nftDetail.collectionSquareImage,
        logo: nftDetail.collectionSquareImage,
        type: walletType,
        count: 1,
        path: createPathFallbacks(),
      };

      // Only set collection if it's not already set, invalid, or doesn't match the current wallet type
      if (!selectedCollection || !selectedCollection.id || selectedCollection.type !== walletType) {
        setSelectedCollection(basicCollection);
      }

      // Always set the selected NFT
      setSelectedNFTs([nftData]);

      // Navigate to the new send flow
      navigate('/dashboard/token/flow/send');
    } catch (error) {
      console.error('Error setting up NFT send flow:', error);
    }
  };

  return (
    <Button
      sx={{
        backgroundColor: '#FFFFFF33',
        p: '12px',
        color: '#fff',
        borderRadius: '12px',
        height: '42px',
        fill: 'var(--Special-Color-White-2, rgba(255, 255, 255, 0.20))',
        filter: 'drop-shadow(0px 8px 16px rgba(0, 0, 0, 0.24))',
        backdropFilter: 'blur(6px)',
      }}
      disabled={!isAccessibleNft}
      onClick={handleSendClick}
    >
      <CardMedia
        image={SendIcon}
        sx={{ width: '20px', height: '20px', color: '#fff', marginRight: '8px' }}
      />
      {chrome.i18n.getMessage('Send')}
    </Button>
  );
};

export default NFTSendButton;
