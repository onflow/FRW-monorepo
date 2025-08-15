import {
  WalletType,
  type TokenModel,
  type CollectionModel,
  type NFTModel,
  type WalletAccount,
} from '@onflow/frw-types';
import { create } from 'zustand';

// Mock data for demonstration - matching React Native design
const MOCK_TOKENS: TokenModel[] = [
  {
    name: 'Flow',
    symbol: 'FLOW',
    balance: '2.16',
    priceInUSD: '0.85',
    balanceInUSD: '1.84',
    change: '+5.2%',
    decimal: 8,
    contractAddress: '0x1654653399040a61',
    identifier: 'A.1654653399040a61.FlowToken',
    logoURI:
      'https://cdn.jsdelivr.net/gh/FlowFans/flow-token-list@main/token-registry/A.1654653399040a61.FlowToken/logo.svg',
    type: WalletType.Flow,
    isVerified: true,
  },
  {
    name: 'Tether',
    symbol: 'USDT',
    balance: '2.16',
    priceInUSD: '1.00',
    balanceInUSD: '2.16',
    change: '+5.2%',
    decimal: 8,
    contractAddress: '0xb19436aae4d94622',
    identifier: 'A.b19436aae4d94622.TetherToken',
    logoURI: 'https://cryptologos.cc/logos/tether-usdt-logo.svg',
    type: WalletType.Flow,
    isVerified: true,
  },
  {
    name: 'COREUM',
    symbol: 'COREUM',
    balance: '2.16',
    priceInUSD: '0.12',
    balanceInUSD: '0.26',
    change: '+5.2%',
    decimal: 8,
    contractAddress: '0x3c5959b568896393',
    identifier: 'A.3c5959b568896393.COREUM',
    logoURI: 'https://cryptologos.cc/logos/coreum-coreum-logo.svg',
    type: WalletType.Flow,
    isVerified: true,
  },
  {
    name: 'Velas',
    symbol: 'VLX',
    balance: '2.16',
    priceInUSD: '0.03',
    balanceInUSD: '0.06',
    change: '+5.2%',
    decimal: 8,
    contractAddress: '0x4c5959b568896393',
    identifier: 'A.4c5959b568896393.VLX',
    logoURI: 'https://cryptologos.cc/logos/velas-vlx-logo.svg',
    type: WalletType.Flow,
    isVerified: true,
  },
  {
    name: 'UPHOLD',
    symbol: 'UPHOLD',
    balance: '2.16',
    priceInUSD: '0.05',
    balanceInUSD: '0.11',
    change: '+5.2%',
    decimal: 8,
    contractAddress: '0x5c5959b568896393',
    identifier: 'A.5c5959b568896393.UPHOLD',
    logoURI: 'https://cryptologos.cc/logos/uphold-uph-logo.svg',
    type: WalletType.Flow,
    isVerified: true,
  },
  {
    name: 'Horizon',
    symbol: 'ZEN',
    balance: '2.16',
    priceInUSD: '8.50',
    balanceInUSD: '18.36',
    change: '+5.2%',
    decimal: 8,
    contractAddress: '0x6c5959b568896393',
    identifier: 'A.6c5959b568896393.ZEN',
    logoURI: 'https://cryptologos.cc/logos/horizen-zen-logo.svg',
    type: WalletType.Flow,
    isVerified: true,
  },
];

const MOCK_COLLECTIONS: CollectionModel[] = [
  {
    id: 'topshot',
    name: 'NBA Top Shot',
    description:
      'NBA Top Shot is your chance to own, sell, and trade officially licensed NBA collectible highlights.',
    logoURI: 'https://nbatopshot.com/static/img/top-shot-logo-horizontal-white.svg',
    logo: 'https://nbatopshot.com/static/img/top-shot-logo-horizontal-white.svg',
    contractName: 'TopShot',
    address: '0x0b2a3299cc857e29',
    path: {
      storage_path: '/storage/MomentCollection',
      public_path: '/public/MomentCollection',
      private_path: '/private/MomentCollection',
    },
    type: WalletType.Flow,
  },
  {
    id: 'cryptokitties',
    name: 'CryptoKitties',
    description:
      'CryptoKitties is a game centered around breedable, collectible, and oh-so-adorable creatures we call CryptoKitties!',
    logoURI: 'https://www.cryptokitties.co/images/kitty-eth.svg',
    logo: 'https://www.cryptokitties.co/images/kitty-eth.svg',
    contractName: 'Kitty',
    address: '0x1d7e57aa55817448',
    path: {
      storage_path: '/storage/KittyCollection',
      public_path: '/public/KittyCollection',
      private_path: '/private/KittyCollection',
    },
    type: WalletType.Flow,
  },
];

const MOCK_NFTS: NFTModel[] = [
  {
    id: '1',
    name: 'LeBron James Dunk #1',
    description: 'LeBron James throws down a powerful dunk in this iconic NBA Top Shot moment.',
    collectionName: 'NBA Top Shot',
    contractName: 'TopShot',
    contractAddress: '0x0b2a3299cc857e29',
    thumbnail: 'https://via.placeholder.com/400x400/4ade80/ffffff?text=LeBron+Dunk+%231',
    type: WalletType.Flow,
    flowIdentifier: 'A.0b2a3299cc857e29.TopShot.NFT',
  },
  {
    id: '2',
    name: 'Stephen Curry 3-Pointer #2',
    description:
      'Stephen Curry drains a clutch three-pointer in this memorable NBA Top Shot moment.',
    collectionName: 'NBA Top Shot',
    contractName: 'TopShot',
    contractAddress: '0x0b2a3299cc857e29',
    thumbnail: 'https://via.placeholder.com/400x400/3b82f6/ffffff?text=Curry+3PT+%232',
    type: WalletType.Flow,
    flowIdentifier: 'A.0b2a3299cc857e29.TopShot.NFT',
  },
  {
    id: '3',
    name: 'Giannis Block #3',
    description: 'Giannis Antetokounmpo makes a spectacular block in this NBA Top Shot highlight.',
    collectionName: 'NBA Top Shot',
    contractName: 'TopShot',
    contractAddress: '0x0b2a3299cc857e29',
    thumbnail: 'https://via.placeholder.com/400x400/10b981/ffffff?text=Giannis+Block+%233',
    type: WalletType.Flow,
    flowIdentifier: 'A.0b2a3299cc857e29.TopShot.NFT',
  },
  {
    id: '4',
    name: 'Kawhi Leonard Steal #4',
    description: 'Kawhi Leonard makes a crucial steal in this NBA Top Shot moment.',
    collectionName: 'NBA Top Shot',
    contractName: 'TopShot',
    contractAddress: '0x0b2a3299cc857e29',
    thumbnail: 'https://via.placeholder.com/400x400/f59e0b/ffffff?text=Kawhi+Steal+%234',
    type: WalletType.Flow,
    flowIdentifier: 'A.0b2a3299cc857e29.TopShot.NFT',
  },
  {
    id: '5',
    name: 'CryptoKitty #1337',
    description: 'A rare and adorable CryptoKitty with unique traits.',
    collectionName: 'CryptoKitties',
    contractName: 'Kitty',
    contractAddress: '0x1d7e57aa55817448',
    thumbnail: 'https://via.placeholder.com/400x400/ec4899/ffffff?text=Kitty+%231337',
    type: WalletType.Flow,
    flowIdentifier: 'A.1d7e57aa55817448.Kitty.NFT',
  },
  {
    id: '6',
    name: 'CryptoKitty #2048',
    description: 'Another beautiful CryptoKitty with special characteristics.',
    collectionName: 'CryptoKitties',
    contractName: 'Kitty',
    contractAddress: '0x1d7e57aa55817448',
    thumbnail: 'https://via.placeholder.com/400x400/8b5cf6/ffffff?text=Kitty+%232048',
    type: WalletType.Flow,
    flowIdentifier: 'A.1d7e57aa55817448.Kitty.NFT',
  },
];

const MOCK_ACCOUNTS: WalletAccount[] = [
  {
    id: '1',
    name: 'Main Account',
    address: '0x1234567890abcdef',
    type: 'main',
    isActive: true,
    emojiInfo: { emoji: '🚀', name: 'rocket', color: '#FF6B6B' },
  },
  {
    id: '2',
    name: 'Secondary Account',
    address: '0xfedcba0987654321',
    type: 'child',
    isActive: false,
    emojiInfo: { emoji: '🌟', name: 'star', color: '#4ECDC4' },
  },
];

interface DemoDataState {
  // Data
  tokens: TokenModel[];
  collections: CollectionModel[];
  nfts: NFTModel[];
  accounts: WalletAccount[];
  activeAccount: WalletAccount | null;

  // Loading states
  isLoadingTokens: boolean;
  isLoadingNFTs: boolean;
  isLoadingAccounts: boolean;

  // Error states
  tokensError: string | null;
  nftsError: string | null;
  accountsError: string | null;
}

interface DemoDataActions {
  // Data fetching (simulated)
  fetchTokens: (address?: string) => Promise<void>;
  fetchNFTs: (address?: string, collectionId?: string) => Promise<void>;
  fetchCollections: (address?: string) => Promise<void>;
  fetchAccounts: () => Promise<void>;

  // Account management
  setActiveAccount: (account: WalletAccount) => void;

  // Utilities
  reset: () => void;

  // Getters
  getTokenById: (id: string) => TokenModel | undefined;
  getNFTById: (id: string) => NFTModel | undefined;
  getCollectionById: (id: string) => CollectionModel | undefined;
  getNFTsByCollection: (collectionId: string) => NFTModel[];
}

type DemoDataStore = DemoDataState & DemoDataActions;

// Simulate network delay
const simulateDelay = (ms: number = 1000) => new Promise((resolve) => setTimeout(resolve, ms));

export const useDemoDataStore = create<DemoDataStore>((set, get) => ({
  // Initial state
  tokens: MOCK_TOKENS,
  collections: [],
  nfts: [],
  accounts: [],
  activeAccount: null,

  isLoadingTokens: false,
  isLoadingNFTs: false,
  isLoadingAccounts: false,

  tokensError: null,
  nftsError: null,
  accountsError: null,

  // Actions
  fetchTokens: async (address?: string) => {
    set({ isLoadingTokens: true, tokensError: null });

    try {
      await simulateDelay(800);
      set({
        tokens: MOCK_TOKENS,
        isLoadingTokens: false,
        tokensError: null,
      });
    } catch (error) {
      set({
        tokens: [],
        isLoadingTokens: false,
        tokensError: error instanceof Error ? error.message : 'Failed to fetch tokens',
      });
    }
  },

  fetchNFTs: async (address?: string, collectionId?: string) => {
    set({ isLoadingNFTs: true, nftsError: null });

    try {
      await simulateDelay(1200);

      let filteredNFTs = MOCK_NFTS;
      if (collectionId) {
        const collection = MOCK_COLLECTIONS.find((c) => c.id === collectionId);
        if (collection) {
          filteredNFTs = MOCK_NFTS.filter((nft) => nft.collectionName === collection.name);
        }
      }

      set({
        nfts: filteredNFTs,
        isLoadingNFTs: false,
        nftsError: null,
      });
    } catch (error) {
      set({
        nfts: [],
        isLoadingNFTs: false,
        nftsError: error instanceof Error ? error.message : 'Failed to fetch NFTs',
      });
    }
  },

  fetchCollections: async (address?: string) => {
    try {
      await simulateDelay(600);
      set({ collections: MOCK_COLLECTIONS });
    } catch (error) {
      console.error('Failed to fetch collections:', error);
    }
  },

  fetchAccounts: async () => {
    set({ isLoadingAccounts: true, accountsError: null });

    try {
      await simulateDelay(500);
      set({
        accounts: MOCK_ACCOUNTS,
        activeAccount: MOCK_ACCOUNTS.find((acc) => acc.isActive) || MOCK_ACCOUNTS[0] || null,
        isLoadingAccounts: false,
        accountsError: null,
      });
    } catch (error) {
      set({
        accounts: [],
        activeAccount: null,
        isLoadingAccounts: false,
        accountsError: error instanceof Error ? error.message : 'Failed to fetch accounts',
      });
    }
  },

  setActiveAccount: (account: WalletAccount) => {
    const updatedAccounts = get().accounts.map((acc) => ({
      ...acc,
      isActive: acc.id === account.id,
    }));

    set({
      accounts: updatedAccounts,
      activeAccount: account,
    });
  },

  reset: () => {
    set({
      tokens: [],
      collections: [],
      nfts: [],
      accounts: [],
      activeAccount: null,
      isLoadingTokens: false,
      isLoadingNFTs: false,
      isLoadingAccounts: false,
      tokensError: null,
      nftsError: null,
      accountsError: null,
    });
  },

  // Getters
  getTokenById: (id: string) => {
    return get().tokens.find((token) => token.id === id);
  },

  getNFTById: (id: string) => {
    return get().nfts.find((nft) => nft.id === id);
  },

  getCollectionById: (id: string) => {
    return get().collections.find((collection) => collection.id === id);
  },

  getNFTsByCollection: (collectionId: string) => {
    const collection = get().getCollectionById(collectionId);
    if (!collection) return [];

    return get().nfts.filter((nft) => nft.collectionName === collection.name);
  },
}));
