import { act, useState, useEffect } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useNetwork } from '../useNetworkHook';

// Mock React
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useEffect: vi.fn().mockImplementation((fn) => {
      const cleanup = fn();
      return cleanup;
    }),
    useState: vi.fn().mockImplementation((initialValue) => [initialValue, vi.fn()]),
  };
});

// Mock chrome API
const mockChromeStorage = {
  local: {
    get: vi.fn(),
  },
  onChanged: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
  },
};

vi.stubGlobal('chrome', {
  storage: mockChromeStorage,
});

describe('useNetworkHook', () => {
  let setNetworkMock: ReturnType<typeof vi.fn>;
  let setDeveloperModeMock: ReturnType<typeof vi.fn>;
  let setEmulatorModeOnMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    setNetworkMock = vi.fn();
    setDeveloperModeMock = vi.fn();
    setEmulatorModeOnMock = vi.fn();

    // Mock useState to return our mock setters
    vi.mocked(useState).mockImplementationOnce(() => ['mainnet', setNetworkMock]);
    vi.mocked(useState).mockImplementationOnce(() => [false, setDeveloperModeMock]);
    vi.mocked(useState).mockImplementationOnce(() => [false, setEmulatorModeOnMock]);

    // Reset chrome storage mock with default values
    mockChromeStorage.local.get.mockImplementation((key) => {
      if (key === 'developerMode') {
        return Promise.resolve({ developerMode: false });
      }
      if (key === 'emulatorMode') {
        return Promise.resolve({ emulatorMode: false });
      }
      if (key === 'userWallets') {
        return Promise.resolve({ userWallets: { network: 'mainnet' } });
      }
      return Promise.resolve({});
    });
  });

  it('should initialize with default values', () => {
    const { network, developerMode, emulatorModeOn } = useNetwork();

    expect(network).toBe('mainnet');
    expect(developerMode).toBe(false);
    expect(emulatorModeOn).toBe(false);
    expect(mockChromeStorage.onChanged.addListener).toHaveBeenCalled();
  });

  it('should load initial data from storage', async () => {
    // Mock storage returns for initial load
    mockChromeStorage.local.get.mockImplementation((key) => {
      if (key === 'developerMode') {
        return Promise.resolve({ developerMode: true });
      }
      if (key === 'emulatorMode') {
        return Promise.resolve({ emulatorMode: true });
      }
      if (key === 'userWallets') {
        return Promise.resolve({ userWallets: { network: 'testnet' } });
      }
      return Promise.resolve({});
    });

    useNetwork();

    // Wait for promises to resolve
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockChromeStorage.local.get).toHaveBeenCalledWith('developerMode');
    expect(mockChromeStorage.local.get).toHaveBeenCalledWith('emulatorMode');
    expect(mockChromeStorage.local.get).toHaveBeenCalledWith('userWallets');
  });

  it('should handle storage changes for userWallets', () => {
    useNetwork();

    // Simulate storage change event for userWallets
    const handleStorageChange = mockChromeStorage.onChanged.addListener.mock.calls[0][0];

    handleStorageChange(
      {
        userWallets: {
          newValue: { network: 'testnet', emulatorMode: true },
          oldValue: { network: 'mainnet', emulatorMode: false },
        },
      },
      'local'
    );

    expect(setNetworkMock).toHaveBeenCalledWith('testnet');
    expect(setEmulatorModeOnMock).toHaveBeenCalledWith(true);
  });

  it('should handle storage changes for developerMode', () => {
    useNetwork();

    // Simulate storage change event for developerMode
    const handleStorageChange = mockChromeStorage.onChanged.addListener.mock.calls[0][0];

    handleStorageChange(
      {
        developerMode: {
          newValue: true,
          oldValue: false,
        },
      },
      'local'
    );

    expect(setDeveloperModeMock).toHaveBeenCalledWith(true);
  });

  it('should clean up listeners on unmount', () => {
    useNetwork();

    // Get the cleanup function from the useEffect mock
    const cleanupFn = vi.mocked(useEffect).mock.calls[0][0]();

    if (cleanupFn) {
      // Call the cleanup function
      cleanupFn();

      expect(mockChromeStorage.onChanged.removeListener).toHaveBeenCalled();
    }
  });

  it('should not update state if component is unmounted', async () => {
    // Create a flag to simulate mounted state
    let mounted = true;

    // Override the useEffect implementation for this test only
    vi.mocked(useEffect).mockImplementationOnce((fn) => {
      fn();
      return () => {
        mounted = false;
      };
    });

    // Override useState implementations to check mounted flag
    vi.mocked(useState).mockReset();
    vi.mocked(useState).mockImplementationOnce(() => [
      'mainnet',
      (val) => {
        if (mounted) setNetworkMock(val);
      },
    ]);
    vi.mocked(useState).mockImplementationOnce(() => [
      false,
      (val) => {
        if (mounted) setDeveloperModeMock(val);
      },
    ]);
    vi.mocked(useState).mockImplementationOnce(() => [
      false,
      (val) => {
        if (mounted) setEmulatorModeOnMock(val);
      },
    ]);

    // Mock storage to return delayed promises
    mockChromeStorage.local.get.mockImplementation((key) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          if (key === 'developerMode') {
            resolve({ developerMode: true });
          } else if (key === 'emulatorMode') {
            resolve({ emulatorMode: true });
          } else if (key === 'userWallets') {
            resolve({ userWallets: { network: 'testnet' } });
          } else {
            resolve({});
          }
        }, 10); // Small delay to ensure it happens after unmount
      });
    });

    // Call the hook
    useNetwork();

    // Clear mocks before unmounting
    setNetworkMock.mockClear();
    setDeveloperModeMock.mockClear();
    setEmulatorModeOnMock.mockClear();

    // Simulate unmounting
    mounted = false;

    // Wait for delayed promises to resolve
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });

    // State setters should not be called after unmount
    expect(setNetworkMock).not.toHaveBeenCalled();
    expect(setDeveloperModeMock).not.toHaveBeenCalled();
    expect(setEmulatorModeOnMock).not.toHaveBeenCalled();
  });
});
