import { Box } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import React from 'react';
import { fn } from 'storybook/test';

import { useWallet as useWalletMock } from '@/stories/wallet-context.mock';

import AccountImport from '../index';

const meta = {
  title: 'View/Welcome/AccountImport',
  component: AccountImport,
  decorators: [
    (Story) => {
      useWalletMock.mockReset();
      useWalletMock.mockImplementation(() => ({
        openapi: {
          checkImport: fn().mockResolvedValue({ status: 200 }),
        },
        getCurrentAccount: fn().mockResolvedValue(null),
        importProfileUsingPrivateKey: fn(),
        importProfileUsingMnemonic: fn(),
      }));
      return (
        <Box
          sx={{
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
          }}
        >
          <Story />
        </Box>
      );
    },
  ],
  parameters: {
    layout: 'centered',
  },
  args: {},
} satisfies Meta<typeof AccountImport>;

export default meta;

type Story = StoryObj<typeof AccountImport>;

export const Default: Story = {
  args: {},
};
