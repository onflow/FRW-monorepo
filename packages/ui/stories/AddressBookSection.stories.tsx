import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { YStack } from 'tamagui';

import { AddressBookSection, AddressBookList } from '../src/components/AddressBookSection';
import type { RecipientItemProps } from '../src/components/RecipientItem';

const meta: Meta<typeof AddressBookSection> = {
  title: 'Components/AddressBookSection',
  component: AddressBookSection,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'AddressBookSection displays contacts grouped by letter with proper sectioning for address book views.',
      },
    },
  },
  argTypes: {
    letter: { control: 'text' },
    contacts: { control: false },
  },
  decorators: [
    (Story): React.JSX.Element => (
      <YStack padding="$4" width={400}>
        <Story />
      </YStack>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AddressBookSection>;

const sampleContacts: RecipientItemProps[] = [
  {
    name: 'Alice Cooper',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    type: 'contact',
  },
  {
    name: 'Anna Smith',
    address: '0x9876543210fedcba9876543210fedcba98765432',
    type: 'contact',
  },
];

export const SingleSection: Story = {
  args: {
    letter: 'A',
    contacts: sampleContacts,
  },
};

export const EmptySection: Story = {
  args: {
    letter: 'Z',
    contacts: [],
  },
};

// AddressBookList stories
const fullContactList: RecipientItemProps[] = [
  // A section
  {
    name: 'Alice Cooper',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    type: 'contact',
  },
  {
    name: 'Anna Smith',
    address: '0x9876543210fedcba9876543210fedcba98765432',
    type: 'contact',
  },
  {
    name: 'Andrew Johnson',
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    type: 'contact',
  },
  // B section
  {
    name: 'Bob Wilson',
    address: '0x5555666677778888999900001111222233334444',
    type: 'contact',
  },
  {
    name: 'Betty Davis',
    address: '0x1111222233334444555566667777888899990000',
    type: 'contact',
  },
  // C section
  {
    name: 'Charlie Brown',
    address: '0xaaaaaabbbbbbccccccddddddeeeeeeffffffffff',
    type: 'contact',
  },
  {
    name: 'Catherine Miller',
    address: '0xdeadbeefcafebabe123456789abcdef012345678',
    type: 'contact',
  },
];

export const FullAddressBook: Story = {
  render: () => <AddressBookList contacts={fullContactList} groupByLetter={true} />,
};

export const FlatContactList: Story = {
  render: () => <AddressBookList contacts={fullContactList} groupByLetter={false} />,
};

export const SingleLetterAddressBook: Story = {
  render: () => (
    <AddressBookList
      contacts={[
        {
          name: 'Tiger',
          address: '0x0c666c888d8fb259',
          type: 'contact',
          avatar: '🐯',
        },
      ]}
      groupByLetter={true}
    />
  ),
};
