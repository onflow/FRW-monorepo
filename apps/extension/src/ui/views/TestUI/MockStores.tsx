// Mock stores for testing SelectTokensScreen in Extension environment
import React, { createContext, useContext, type ReactNode } from 'react';

// Mock store interfaces matching the real ones
interface MockSendStore {
  setSelectedToken: (token: any) => void;
  setTransactionType: (type: string) => void;
  setCurrentStep: (step: string) => void;
  clearTransactionData: () => void;
  setFromAccount: (account: any) => void;
}

interface MockTokenStore {
  getState: () => {
    getBalance: (address: string, type?: string, options?: any) => Promise<{ balance: string }>;
    getAccountBalance: (
      address: string,
      type?: string,
      network?: string
    ) => Promise<{ balance: string }>;
    forceRefresh: (address: string, network: string) => Promise<void>;
    fetchTokens: (address: string, network: string, includeNFT?: boolean) => Promise<void>;
    getNFTCollectionsForAddress: (address: string, network: string) => any[];
  };
}

interface MockWalletStore {
  isLoading: boolean;
  activeAccount: any | null;
  accounts: any[];
}

// Create contexts for the stores
const MockSendStoreContext = createContext<MockSendStore | null>(null);
const MockTokenStoreContext = createContext<MockTokenStore | null>(null);
const MockWalletStoreContext = createContext<MockWalletStore | null>(null);

// Mock store implementations
const createMockSendStore = (): MockSendStore => ({
  setSelectedToken: (token: any) => {
    console.log('[MockSendStore] setSelectedToken:', token);
  },
  setTransactionType: (type: string) => {
    console.log('[MockSendStore] setTransactionType:', type);
  },
  setCurrentStep: (step: string) => {
    console.log('[MockSendStore] setCurrentStep:', step);
  },
  clearTransactionData: () => {
    console.log('[MockSendStore] clearTransactionData');
  },
  setFromAccount: (account: any) => {
    console.log('[MockSendStore] setFromAccount:', account);
  },
});

const createMockTokenStore = (): MockTokenStore => ({
  getState: () => ({
    getBalance: async (address: string, type?: string, options?: any) => {
      console.log('[MockTokenStore] getBalance:', { address, type, options });
      return { balance: '100.5 FLOW' };
    },
    getAccountBalance: async (address: string, type?: string, network?: string) => {
      console.log('[MockTokenStore] getAccountBalance:', { address, type, network });
      return { balance: '100.5 FLOW' };
    },
    forceRefresh: async (address: string, network: string) => {
      console.log('[MockTokenStore] forceRefresh:', { address, network });
    },
    fetchTokens: async (address: string, network: string, includeNFT?: boolean) => {
      console.log('[MockTokenStore] fetchTokens:', { address, network, includeNFT });
    },
    getNFTCollectionsForAddress: (address: string, network: string) => {
      console.log('[MockTokenStore] getNFTCollectionsForAddress:', { address, network });
      return [
        {
          id: '1',
          name: 'Test NFT Collection',
          contractName: 'TestNFT',
          count: 5,
        },
      ];
    },
  }),
});

const createMockWalletStore = (): MockWalletStore => ({
  isLoading: false,
  activeAccount: {
    id: 1,
    address: '0x1234567890abcdef',
    name: 'Main Account',
    type: 'main',
    emojiInfo: {
      emoji: '🟢',
      name: 'green_circle',
      bgcolor: '#4CAF50',
    },
  },
  accounts: [
    {
      id: 1,
      address: '0x1234567890abcdef',
      name: 'Main Account',
      type: 'main',
      emojiInfo: {
        emoji: '🟢',
        name: 'green_circle',
        bgcolor: '#4CAF50',
      },
    },
    {
      id: 2,
      address: '0xabcdef1234567890',
      name: 'Child Account',
      type: 'child',
      emojiInfo: {
        emoji: '🔵',
        name: 'blue_circle',
        bgcolor: '#2196F3',
      },
    },
  ],
});

// Provider component
export const MockStoresProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const sendStore = createMockSendStore();
  const tokenStore = createMockTokenStore();
  const walletStore = createMockWalletStore();

  return (
    <MockSendStoreContext.Provider value={sendStore}>
      <MockTokenStoreContext.Provider value={tokenStore}>
        <MockWalletStoreContext.Provider value={walletStore}>
          {children}
        </MockWalletStoreContext.Provider>
      </MockTokenStoreContext.Provider>
    </MockSendStoreContext.Provider>
  );
};

// Mock hooks that match the real store hooks
export const useSendStore = (): MockSendStore => {
  const store = useContext(MockSendStoreContext);
  if (!store) {
    throw new Error('useSendStore must be used within MockStoresProvider');
  }
  return store;
};

export const useTokenStore = {
  getState: (): ReturnType<MockTokenStore['getState']> => {
    return createMockTokenStore().getState();
  },
};

export const useWalletStore = (): MockWalletStore => {
  const store = useContext(MockWalletStoreContext);
  if (!store) {
    throw new Error('useWalletStore must be used within MockStoresProvider');
  }
  return store;
};
