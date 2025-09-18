import { flowService } from '@onflow/frw-services';
import type { WalletProfile } from '@onflow/frw-types';
import { create } from 'zustand';

interface ProfileStoreState {
  profiles: WalletProfile[];
  isLoading: boolean;
  error: string | null;
}

interface ProfileStoreActions {
  // Core bridge operations
  loadProfilesFromBridge: () => Promise<void>;

  // Utilities
  getProfileByUid: (uid: string) => WalletProfile | null;
  clearCache: () => void;
}

type ProfileStore = ProfileStoreState & ProfileStoreActions;

export const useProfileStore = create<ProfileStore>((set, get) => ({
  // Initial state
  profiles: [],
  isLoading: false,
  error: null,

  // Load profile data from bridge
  loadProfilesFromBridge: async () => {
    const currentState = get();

    // Prevent multiple simultaneous loads
    if (currentState.isLoading) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const flow = flowService();

      // Try to use the new getWalletProfiles method first
      try {
        console.log('📊 [ProfileStore] Attempting to fetch wallet profiles from bridge...');
        const walletProfilesData = await flow.getWalletProfiles();
        console.log('📊 [ProfileStore] Wallet profiles data from bridge:', walletProfilesData);

        if (!Array.isArray(walletProfilesData.profiles)) {
          throw new Error('Invalid profiles data from bridge');
        }

        // Clean profile data
        const profiles: WalletProfile[] = walletProfilesData.profiles;
        console.log('📊 [ProfileStore] Processed profiles:', {
          profilesCount: profiles.length,
          profiles: profiles.map(p => ({
            uid: p.uid,
            name: p.name,
            accountsCount: p.accounts.length,
            accounts: p.accounts.map(a => ({
              name: a.name,
              address: a.address,
              type: a.type,
              parentAddress: a.parentAddress
            }))
          }))
        });

        set({
          profiles,
          isLoading: false,
          error: null,
        });
      } catch (profileError) {
        console.log('📊 [ProfileStore] getWalletProfiles failed, falling back to getWalletAccounts:', profileError);
        const walletAccountsData = await flow.getWalletAccounts();
        console.log('📊 [ProfileStore] Wallet accounts data from bridge:', walletAccountsData);

        if (!walletAccountsData.accounts || !Array.isArray(walletAccountsData.accounts)) {
          throw new Error('Invalid accounts data from bridge');
        }

        // Convert accounts to a single profile structure
        const profiles: WalletProfile[] = [
          {
            uid: 'default-profile',
            name: 'Main Profile',
            avatar: '👤',
            accounts: walletAccountsData.accounts,
          },
        ];
        console.log('📊 [ProfileStore] Processed profiles from accounts fallback:', {
          profilesCount: profiles.length,
          profiles: profiles.map(p => ({
            uid: p.uid,
            name: p.name,
            accountsCount: p.accounts.length,
            accounts: p.accounts.map(a => ({
              name: a.name,
              address: a.address,
              type: a.type,
              parentAddress: a.parentAddress
            }))
          }))
        });

        set({
          profiles,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('📊 [ProfileStore] Error loading profiles:', error);
      set({
        profiles: [],
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load profiles',
      });
    }
  },

  // Get profile by UID
  getProfileByUid: (uid: string) => {
    return get().profiles.find((profile) => profile.uid === uid) || null;
  },

  // Clear cache
  clearCache: () => {
    set({
      profiles: [],
      isLoading: false,
      error: null,
    });
  },
}));

// Custom hook to get full profiles with their accounts
export const useAllProfiles = () => {
  const profiles = useProfileStore((state) => state.profiles);
  return profiles;
};
