import { CheckCircle } from '@onflow/frw-icons';
import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { YStack } from 'tamagui';

import { NFTListCard } from '../src/components/NFTListCard';

const meta: Meta<typeof NFTListCard> = {
  title: 'Components/NFTListCard',
  component: NFTListCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'NFTListCard displays NFT information in a horizontal list format with account info, navigation chevron, and selection states. Used in send flows and list views.',
      },
    },
  },
  argTypes: {
    nft: {
      control: 'object',
      description: 'NFT data to display',
    },
    selected: {
      control: 'boolean',
      description: 'Whether the NFT is selected',
    },
    showAmount: {
      control: 'boolean',
      description: 'Show amount badge for ERC1155 tokens',
    },
    account: {
      control: 'object',
      description: 'Account information to display',
    },
    onPress: {
      action: 'pressed',
      description: 'Called when the card is pressed',
    },
    onDetailPress: {
      action: 'detail pressed',
      description: 'Called when the NFT image is pressed for details',
    },
  },
  decorators: [
    (Story) => (
      <YStack p="$4" maxWidth={400}>
        <Story />
      </YStack>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof NFTListCard>;

// Mock NFT data
const mockNFT = {
  id: '1',
  name: 'Cool Cats #1234',
  image:
    'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=400&h=400&fit=crop&crop=center',
  thumbnail:
    'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=200&h=200&fit=crop&crop=center',
};

const mockNFTWithAmount = {
  ...mockNFT,
  name: 'GameStop x ImmutableX #5678',
  amount: '3',
  image:
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop&crop=center',
  thumbnail:
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop&crop=center',
};

const mockAccount = {
  name: 'Main Account',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Flow',
};

const longNameNFT = {
  ...mockNFT,
  name: 'Super Long NFT Collection Name That Should Truncate Properly #9999',
  image:
    'https://images.unsplash.com/photo-1616091216791-a5360b5fc78a?w=400&h=400&fit=crop&crop=center',
  thumbnail:
    'https://images.unsplash.com/photo-1616091216791-a5360b5fc78a?w=200&h=200&fit=crop&crop=center',
};

export const Default: Story = {
  args: {
    nft: mockNFT,
    selected: false,
  },
};

export const WithAccount: Story = {
  args: {
    nft: mockNFT,
    selected: false,
    account: mockAccount,
  },
};

export const Selected: Story = {
  args: {
    nft: mockNFT,
    selected: true,
    account: mockAccount,
    selectionIcon: <CheckCircle size={20} color="#00EF8B" theme="filled" />,
  },
};

export const WithAmount: Story = {
  args: {
    nft: mockNFTWithAmount,
    selected: false,
    showAmount: true,
    account: mockAccount,
  },
};

export const WithAmountSelected: Story = {
  args: {
    nft: mockNFTWithAmount,
    selected: true,
    showAmount: true,
    account: mockAccount,
    selectionIcon: <CheckCircle size={20} color="#00EF8B" theme="filled" />,
  },
};

export const LongName: Story = {
  args: {
    nft: longNameNFT,
    selected: false,
    account: mockAccount,
  },
};

export const NoAccount: Story = {
  args: {
    nft: mockNFT,
    selected: false,
  },
};

export const NoImage: Story = {
  args: {
    nft: {
      id: '2',
      name: 'NFT Without Image',
    },
    selected: false,
    account: mockAccount,
  },
};

// Multiple cards in a list
export const InList: Story = {
  render: () => (
    <YStack gap="$2">
      <NFTListCard
        nft={mockNFT}
        selected={false}
        account={mockAccount}
        onPress={() => console.log('Card 1 pressed')}
        onDetailPress={() => console.log('Card 1 detail pressed')}
      />
      <NFTListCard
        nft={mockNFTWithAmount}
        selected={true}
        showAmount={true}
        account={mockAccount}
        selectionIcon={<CheckCircle size={20} color="#00EF8B" theme="filled" />}
        onPress={() => console.log('Card 2 pressed')}
        onDetailPress={() => console.log('Card 2 detail pressed')}
      />
      <NFTListCard
        nft={longNameNFT}
        selected={false}
        account={mockAccount}
        onPress={() => console.log('Card 3 pressed')}
        onDetailPress={() => console.log('Card 3 detail pressed')}
      />
    </YStack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example of multiple NFTListCards in a list layout, showing different states.',
      },
    },
  },
};
