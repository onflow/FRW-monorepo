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
        console.log('ProfileStore: Attempting to load profiles with getWalletProfiles');
        const walletProfilesData = await flow.getWalletProfiles();
        console.log('ProfileStore: getWalletProfiles result:', walletProfilesData);

        if (!Array.isArray(walletProfilesData.profiles)) {
          throw new Error('Invalid profiles data from bridge');
        }

        // Clean profile data
        const profiles: WalletProfile[] = walletProfilesData.profiles;
        console.log('ProfileStore: Using profiles data:', profiles);

        set({
          profiles,
          isLoading: false,
          error: null,
        });
      } catch (profileError) {
        // Fallback to getWalletAccounts if getWalletProfiles is not available
        console.log('ProfileStore: getWalletProfiles failed, falling back to getWalletAccounts. Error:', profileError);
        
        const walletAccountsData = await flow.getWalletAccounts();
        console.log('ProfileStore: walletAccountsData:', walletAccountsData);
        
        if (!walletAccountsData.accounts || !Array.isArray(walletAccountsData.accounts)) {
          throw new Error('Invalid accounts data from bridge');
        }

        // Convert accounts to a single profile structure
        const profiles: WalletProfile[] = [{
          uid: 'default-profile',
          name: 'Main Profile',
          avatar: '👤',
          accounts: walletAccountsData.accounts,
        }];
        
        console.log('Fallback profiles created:', profiles);

        set({
          profiles,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
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
  console.log('useAllProfiles returning:', profiles);
  return profiles;
};
