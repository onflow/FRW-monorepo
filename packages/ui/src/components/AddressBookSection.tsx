import React from 'react';
import { FlatList, SectionList } from 'react-native';
import { Text, YStack, useThemeName } from 'tamagui';


import { RecipientItem, type RecipientItemProps } from './RecipientItem';

export interface AddressBookSectionProps {
  letter: string;
  contacts: RecipientItemProps[];
  copiedAddress?: string | null;
  copiedId?: string | null;
  copiedText?: string;
  isMobile?: boolean;
}

export function AddressBookSection({
  letter,
  contacts,
  copiedAddress,
  copiedId,
  copiedText = 'Copied!',
  isMobile = false,
}: AddressBookSectionProps): React.JSX.Element | null {
  if (contacts.length === 0) {
    return null;
  }

  return (
    <YStack gap={4} w="$100">
      {/* Letter Header */}
      <Text fontSize={14} fontWeight="400" color="$textSecondary" lineHeight={16.8} w="100%">
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
              isMobile={isMobile}
              copiedFeedback={
                copiedId
                  ? copiedId === (contact as any).id
                    ? copiedText
                    : undefined
                  : copiedAddress === `${contact.name}::${contact.address}`
                    ? copiedText
                    : undefined
              }
            />
            <YStack mt={'$2'} mb={'$2'} height={1} bg="$border1" w="100%" ml={0} />
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
  copiedText?: string;
  isMobile?: boolean;
}

export function AddressBookList({
  contacts,
  groupByLetter = true,
  copiedAddress,
  copiedId,
  copiedText = 'Copied!',
  isMobile = false,
}: AddressBookListProps): React.JSX.Element {
  if (!groupByLetter) {
    return (
      <FlatList
        data={contacts}
        keyExtractor={(item, index) => `${item.address}-${index}`}
        renderItem={({ item, index }) => (
          <YStack px="$4">
            <RecipientItem
              {...item}
              type="contact"
              showCopyButton={true}
              isMobile={isMobile}
              copiedFeedback={
                copiedId
                  ? copiedId === (item as any).id
                    ? copiedText
                    : undefined
                  : copiedAddress === `${item.name}::${item.address}`
                    ? copiedText
                    : undefined
              }
            />
            {index < contacts.length - 1 && <YStack height={1} bg="$border1" w="100%" ml={0} />}
          </YStack>
        )}
      />
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

  // Build sections array for SectionList
  const sections = sortedLetters.map((letter) => ({
    title: letter,
    data: groupedContacts[letter],
  }));

  return (
    <SectionList
      sections={sections as any}
      keyExtractor={(item: any, index) => `${item.address}-${index}`}
      renderSectionHeader={({ section }) => (
        <YStack gap={4} w="$100" px="$4">
          <Text fontSize={14} fontWeight="400" color="$textSecondary" lineHeight={16.8} w="100%">
            {(section as any).title}
          </Text>
        </YStack>
      )}
      renderItem={({ item, index, section }) => (
        <YStack px="$4">
          <RecipientItem
            {...(item as any)}
            type="contact"
            showCopyButton={true}
            isMobile={isMobile}
            copiedFeedback={
              copiedId
                ? copiedId === (item as any).id
                  ? copiedText
                  : undefined
                : copiedAddress === `${(item as any).name}::${(item as any).address}`
                  ? copiedText
                  : undefined
            }
          />
          {/* Divider between items */}
          {index < (section as any).data.length - 1 && (
            <YStack mt={'$2'} mb={'$2'} height={1} bg={dividerColor} w="100%" ml={0} />
          )}
        </YStack>
      )}
    />
  );
}
