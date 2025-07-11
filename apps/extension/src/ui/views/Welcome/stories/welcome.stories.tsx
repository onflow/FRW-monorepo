import { Box } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import React from 'react';
import { fn } from 'storybook/test';
import { withRouter } from 'storybook-addon-remix-react-router';

import { useWallet as useWalletMock } from '@/ui/hooks/use-wallet.mock';

import Welcome from '../index';

const meta = {
  title: 'views/Welcome',
  component: Welcome,
  decorators: [
    withRouter,
    (Story) => {
      useWalletMock.mockReset();
      useWalletMock.mockResolvedValue({
        openapi: {
          checkImport: fn().mockResolvedValue({ status: 200 }),
        },
        getCurrentAccount: fn().mockResolvedValue(null),
        importProfileUsingPrivateKey: fn(),
        importProfileUsingMnemonic: fn(),
        isBooted: fn().mockResolvedValue(false),
      });
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
} satisfies Meta<typeof Welcome>;

export default meta;

type Story = StoryObj<typeof Welcome>;

export const Default: Story = {
  args: {},
};
