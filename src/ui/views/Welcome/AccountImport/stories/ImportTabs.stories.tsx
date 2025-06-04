import { Box } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import React from 'react';
import { action } from 'storybook/actions';
import { fn } from 'storybook/test';

import { FLOW_BIP44_PATH } from '@/shared/utils/algo-constants';
import { useWallet as useWalletMock } from '@/stories/wallet-context.mock';

import ImportTabs from '../ImportTabs';

const meta = {
  title: 'View/Welcome/AccountImport/ImportTabs',
  component: ImportTabs,
  decorators: [
    (Story) => {
      useWalletMock.mockReset();
      useWalletMock.mockImplementation(() => ({
        openapi: {
          checkImport: fn().mockResolvedValue({ status: 200 }),
        },
      }));
      return (
        <Box sx={{ width: '100%', maxWidth: '600px', margin: 'auto' }}>
          <Story />
        </Box>
      );
    },
  ],
  parameters: {
    layout: 'centered',
  },
  args: {
    setMnemonic: fn(),
    setPk: fn(),
    setAccounts: fn(),
    setUsername: fn(),
    goPassword: fn(),
    handleSwitchTab: fn(),
    setErrorMessage: fn(),
    setShowError: fn(),
    handleGoogleAccountsFound: fn(),
    setPath: fn(),
    setPhrase: fn(),
  },
} satisfies Meta<typeof ImportTabs>;

export default meta;

type Story = StoryObj<typeof ImportTabs>;

export const Default: Story = {
  args: {
    setMnemonic: action('setMnemonic'),
    setPk: action('setPk'),
    setAccounts: action('setAccounts'),
    accounts: [],
    mnemonic: null,
    pk: null,
    setUsername: action('setUsername'),
    goPassword: action('goPassword'),
    handleSwitchTab: action('handleSwitchTab'),
    setErrorMessage: action('setErrorMessage'),
    setShowError: action('setShowError'),
    handleGoogleAccountsFound: action('handleGoogleAccountsFound'),
    path: FLOW_BIP44_PATH,
    setPath: action('setPath'),
    phrase: '',
    setPhrase: action('setPhrase'),
  },
};
