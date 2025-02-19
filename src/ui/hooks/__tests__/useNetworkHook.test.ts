import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useNetworkStore } from '@/ui/stores/networkStore';
import { useWallet, useWalletLoaded } from '@/ui/utils/WalletContext';

import { useNetworks } from '../useNetworkHook';

// Mock React
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useCallback: vi.fn().mockImplementation((fn) => fn),
  };
});

// Mock the store
vi.mock('@/ui/stores/networkStore', () => ({
  useNetworkStore: vi.fn((selector) =>
    selector({
      currentNetwork: 'mainnet',
      developerMode: false,
      emulatorModeOn: false,
      setNetwork: vi.fn(),
      setDeveloperMode: vi.fn(),
      setEmulatorModeOn: vi.fn(),
    })
  ),
}));

// Mock the wallet context
vi.mock('@/ui/utils/WalletContext', () => ({
  useWalletLoaded: vi.fn().mockReturnValue(true),
  useWallet: vi.fn().mockReturnValue({
    getNetwork: vi.fn().mockResolvedValue('mainnet'),
  }),
}));

describe('useNetworkHook', () => {
  let mockSetNetwork: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockSetNetwork = vi.fn();
    vi.mocked(useNetworkStore).mockImplementation((selector) =>
      selector({
        currentNetwork: 'mainnet',
        developerMode: false,
        emulatorModeOn: false,
        setNetwork: mockSetNetwork,
        setDeveloperMode: vi.fn(),
        setEmulatorModeOn: vi.fn(),
      })
    );
  });

  describe('fetchNetwork', () => {
    it('should correctly identify network type', async () => {
      const hook = useNetworks();
      await hook.fetchNetwork();

      expect(mockSetNetwork).toHaveBeenCalledWith('mainnet');
    });
  });
});
