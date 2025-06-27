import { Box } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import React from 'react';
import { fn } from 'storybook/test';

import { Link as LinkMock } from '@/stories/react-router-dom.mock';
import { useWallet as useWalletMock } from '@/ui/utils/WalletContext.mock';

import ImportAccount from '../index';

const meta = {
  title: 'views/Welcome/import-account',
  component: ImportAccount,
  decorators: [
    (Story) => {
      LinkMock.mockReset();
      LinkMock.mockImplementation((props: any): React.ReactNode => <Box {...props} />);
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
} satisfies Meta<typeof ImportAccount>;

export default meta;

type Story = StoryObj<typeof ImportAccount>;

export const Default: Story = {
  args: {},
};
