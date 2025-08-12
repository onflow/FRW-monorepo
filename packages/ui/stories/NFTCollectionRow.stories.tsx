import type { Meta, StoryObj } from '@storybook/react-vite';

import { NFTCollectionRow } from '../src/components/NFTCollectionRow';

const meta: Meta<typeof NFTCollectionRow> = {
  title: 'Components/NFTCollectionRow',
  component: NFTCollectionRow,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    collection: {
      control: 'object',
      description: 'The NFT collection data',
    },
    showDivider: {
      control: 'boolean',
      description: 'Whether to show a divider below the row',
    },
    onPress: {
      action: 'collection pressed',
      description: 'Callback when the collection row is pressed',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockCollection = {
  id: 'nba-topshot',
  name: 'NBA Top Shot',
  logoURI: 'https://assets.nba.com/media/nba-topshot/nba_logo.png',
  count: 15,
  contractName: 'TopShot',
};

export const Default: Story = {
  args: {
    collection: mockCollection,
    showDivider: false,
    onPress: () => console.log('Collection pressed'),
  },
};

export const WithDivider: Story = {
  args: {
    collection: mockCollection,
    showDivider: true,
    onPress: () => console.log('Collection pressed'),
  },
};

export const SingleItem: Story = {
  args: {
    collection: {
      ...mockCollection,
      name: 'Flow Punk',
      count: 1,
    },
    showDivider: false,
    onPress: () => console.log('Collection pressed'),
  },
};

export const LongName: Story = {
  args: {
    collection: {
      ...mockCollection,
      name: 'Very Long Collection Name That Should Wrap Nicely',
      count: 42,
    },
    showDivider: true,
    onPress: () => console.log('Collection pressed'),
  },
};

export const NoLogo: Story = {
  args: {
    collection: {
      id: 'mystery-collection',
      name: 'Mystery Collection',
      count: 8,
    },
    showDivider: false,
    onPress: () => console.log('Collection pressed'),
  },
};

export const EmptyCollection: Story = {
  args: {
    collection: undefined,
    showDivider: false,
    onPress: () => console.log('Collection pressed'),
  },
};
