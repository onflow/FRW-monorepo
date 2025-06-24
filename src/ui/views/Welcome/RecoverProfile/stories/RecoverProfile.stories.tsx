import { Box } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import React from 'react';
import { fn } from 'storybook/test';

import { Link as LinkMock } from '@/stories/react-router-dom.mock';
import { useWallet as useWalletMock } from '@/stories/wallet-context.mock';

import RecoverProfile from '../index';

const meta = {
  title: 'views/Welcome/RecoverProfile',
  component: RecoverProfile,
  decorators: [
    (Story) => {
      LinkMock.mockReset();
      LinkMock.mockImplementation((props: any): React.ReactNode => <Box {...props} />);
      useWalletMock.mockReset();
      useWalletMock.mockImplementation(() => ({
        openapi: {
          checkImport: fn().mockResolvedValue({ status: 200 }),
        },
        getCurrentAccount: fn().mockResolvedValue(null),
        importProfileUsingPrivateKey: fn(),
        importProfileUsingMnemonic: fn(),
        isBooted: fn().mockResolvedValue(false),
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
} satisfies Meta<typeof RecoverProfile>;

export default meta;

type Story = StoryObj<typeof RecoverProfile>;

export const Default: Story = {
  args: {},
};
