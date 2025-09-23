import React from 'react';
import { Text, YStack } from 'tamagui';

import { RecipientItem, type RecipientItemProps } from './RecipientItem';

export interface AddressBookSectionProps {
  letter: string;
  contacts: RecipientItemProps[];
  copiedAddress?: string | null;
  copiedId?: string | null;
}

export function AddressBookSection({
  letter,
  contacts,
  copiedAddress,
  copiedId,
}: AddressBookSectionProps): React.JSX.Element | null {
  if (contacts.length === 0) {
    return null;
  }

  return (
    <YStack gap={4} w="$100">
      {/* Letter Header */}
      <Text
        fontSize={14}
        fontWeight="400"
        color="rgba(255, 255, 255, 0.4)"
        lineHeight={16.8}
        w="100%"
      >
        {letter}
      </Text>

      {/* Contacts List */}
      <YStack gap={0}>
        {contacts.map((contact, index) => (
          <YStack key={`${contact.address}-${index}`}>
            <RecipientItem
              {...contact}
              type="contact"
              showCopyButton={true}
              copiedFeedback={
                copiedId
                  ? copiedId === (contact as any).id
                    ? 'Copied!'
                    : undefined
                  : copiedAddress === `${contact.name}::${contact.address}`
                    ? 'Copied!'
                    : undefined
              }
            />
            <YStack mt={'$2'} mb={'$2'} height={1} bg="rgba(255, 255, 255, 0.1)" w="100%" ml={0} />
          </YStack>
        ))}
      </YStack>
    </YStack>
  );
}

export interface AddressBookListProps {
  contacts: RecipientItemProps[];
  groupByLetter?: boolean;
  copiedAddress?: string | null;
  copiedId?: string | null;
}

export function AddressBookList({
  contacts,
  groupByLetter = true,
  copiedAddress,
  copiedId,
}: AddressBookListProps): React.JSX.Element {
  if (!groupByLetter) {
    return (
      <YStack gap={0}>
        {contacts.map((contact, index) => (
          <YStack key={`${contact.address}-${index}`}>
            <RecipientItem
              {...contact}
              type="contact"
              showCopyButton={true}
              copiedFeedback={
                copiedId
                  ? copiedId === (contact as any).id
                    ? 'Copied!'
                    : undefined
                  : copiedAddress === `${contact.name}::${contact.address}`
                    ? 'Copied!'
                    : undefined
              }
            />
            {index < contacts.length - 1 && (
              <YStack height={1} bg="rgba(255, 255, 255, 0.1)" w="100%" ml={0} />
            )}
          </YStack>
        ))}
      </YStack>
    );
  }

  // Group contacts by first letter
  const groupedContacts = contacts.reduce(
    (groups, contact) => {
      const firstLetter = contact.name.charAt(0).toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(contact);
      return groups;
    },
    {} as Record<string, RecipientItemProps[]>
  );

  // Sort letters alphabetically
  const sortedLetters = Object.keys(groupedContacts).sort();

  return (
    <YStack gap={16}>
      {sortedLetters.map((letter) => (
        <AddressBookSection
          key={letter}
          letter={letter}
          contacts={groupedContacts[letter]}
          copiedAddress={copiedAddress}
          copiedId={copiedId}
        />
      ))}
    </YStack>
  );
}
