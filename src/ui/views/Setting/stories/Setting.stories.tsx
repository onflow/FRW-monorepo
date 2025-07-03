import { type Meta, type StoryObj } from '@storybook/react-webpack5';
import React from 'react';
import { BrowserRouter } from 'react-router';
import { withRouter } from 'storybook-addon-remix-react-router';

import * as useAccountHooks from '@/ui/hooks/use-account-hooks';
import { useUserData } from '@/ui/hooks/use-data.mock';
import { useNetwork } from '@/ui/hooks/useNetworkHook.mock';
import { useProfiles } from '@/ui/hooks/useProfileHook.mock';
import { useWallet } from '@/ui/utils';

import SettingTab from '../index';

// Mock the useWallet hook
const mockUseWallet = {
  getActiveAccountType: () => Promise.resolve('main'),
  checkMnemonics: () => Promise.resolve(true),
  lockAdd: () => Promise.resolve(),
};

const meta: Meta<typeof SettingTab> = {
  title: 'Views/Setting/SettingTab',
  component: SettingTab,
  tags: ['autodocs'],
  parameters: {
    backgrounds: {
      default: 'dark',
    },
    docs: {
      description: {
        component: 'The main settings page for the Flow Wallet extension.',
      },
    },
  },
  decorators: [
    withRouter,
    (Story) => (
      <React.StrictMode>
        <BrowserRouter>
          <div
            style={{
              width: '400px',
              backgroundColor: '#1A1A1A',
              minHeight: '100vh',
              color: 'white',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <Story />
          </div>
        </BrowserRouter>
      </React.StrictMode>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SettingTab>;

export const Default: Story = {
  render: () => {
    (useAccountHooks as any).useUserInfo = () => ({
      avatar: 'https://lilico.app/api/avatar/beam/120/avatar',
      nickname: 'Test User',
      username: 'testuser',
      private: 0,
      created: '2021-01-01',
      id: '1',
    });
    useNetwork.mockReturnValue({
      network: 'mainnet',
      developerMode: false,
      emulatorModeOn: false,
    });
    useUserData.mockImplementation((key: string | null | undefined) => {
      if (key === 'currentId') return '1';
      if (key === 'userWallets') return { currentAddress: '0x12345678', network: 'mainnet' };
      if (key === 'keyringState') return { currentId: '1' };
      if (key === 'lilicoPayer') return '0x12345678';
      return undefined;
    });
    useProfiles.mockReturnValue({
      ...useProfiles(),
      profileIds: [],
      userInfo: undefined,
    });
    (useWallet as any).mockReturnValue(mockUseWallet);

    return <SettingTab />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Default settings page.',
      },
    },
  },
};

export const WithProfile: Story = {
  render: () => {
    (useAccountHooks as any).useUserInfo = () => ({
      avatar: 'https://lilico.app/api/avatar/beam/120/avatar',
      nickname: 'Test User',
      username: 'testuser',
      private: 0,
      created: '2021-01-01',
      id: '1',
    });
    useNetwork.mockReturnValue({
      network: 'mainnet',
      developerMode: false,
      emulatorModeOn: false,
    });
    useUserData.mockImplementation((key: string | null | undefined) => {
      if (key === 'currentId') return '1';
      if (key === 'userWallets') return { currentAddress: '0x12345678', network: 'mainnet' };
      if (key === 'keyringState') return { currentId: '1' };
      if (key === 'lilicoPayer') return '0x12345678';
      return undefined;
    });
    useProfiles.mockReturnValue({
      ...useProfiles(),
      profileIds: ['1', '2'],
      userInfo: {
        avatar: 'https://lilico.app/api/avatar/beam/120/avatar',
        nickname: 'Test User',
        username: 'testuser',
        private: 0,
        created: '2021-01-01',
        id: '1',
      },
    });
    (useWallet as any).mockReturnValue(mockUseWallet);

    return <SettingTab />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Settings page with a user profile displayed at the top.',
      },
    },
  },
};
