import { Paragraph, XStack, YStack } from '@onflow/frw-ui';
import React, { useMemo } from 'react';
import { Select } from 'tamagui';

export interface PasskeyOption {
  credentialId: string;
  address?: string;
  keyInfo?: {
    keyIndex?: number;
  } | null;
  name?: string | null;
}

interface PasskeySelectProps {
  value?: string;
  options: PasskeyOption[];
  disabled?: boolean;
  onValueChange: (value: string) => void;
}

const EMOJIS = ['🔐', '🗝️', '📱', '💻', '⌚️', '🛡️', '🔒', '🧬', '👁️', '🧠', '🪪', '🔑'];
const BACKGROUNDS = [
  '#DCFCE7',
  '#E0F2FE',
  '#FEF9C3',
  '#FCE7F3',
  '#F3E8FF',
  '#FFE4E6',
  '#E7E5E4',
  '#F1F5F9',
  '#E4E4FF',
  '#FEE2E2',
  '#F5F5F5',
  '#E0E7FF',
];

const formatName = (option: PasskeyOption) => {
  if (option.name && option.name.trim().length > 0) {
    return option.name.trim();
  }
  return `Passkey ${option.credentialId.slice(-6)}`;
};

const formatAddress = (address?: string) => {
  if (!address) {
    return 'Address: Pending';
  }
  const normalized = address.startsWith('0x') ? address : `0x${address}`;
  return `Address: ${normalized}`;
};

const formatCredentialId = (credentialId: string) => `ID: ${credentialId}`;

const deriveSeed = (option: PasskeyOption): string => {
  if (option.address && option.address.length > 0) return option.address.toLowerCase();
  return option.credentialId;
};

const getPaletteForCredential = (option: PasskeyOption): { emoji: string; background: string } => {
  const seed = deriveSeed(option);
  if (!seed) {
    return { emoji: EMOJIS[0]!, background: BACKGROUNDS[0]! };
  }
  const hash = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const emoji = EMOJIS[hash % EMOJIS.length] ?? EMOJIS[0]!;
  const background = BACKGROUNDS[hash % BACKGROUNDS.length] ?? BACKGROUNDS[0]!;
  return { emoji, background };
};

export function PasskeySelect({ value, options, disabled, onValueChange }: PasskeySelectProps) {
  const placeholder = useMemo(
    () => (options.length === 0 ? 'No passkeys available' : 'Select a passkey'),
    [options.length]
  );
  const selectedOption = useMemo(
    () => options.find((option) => option.credentialId === value),
    [options, value]
  );

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled || options.length === 0}>
      <Select.Trigger
        width="100%"
        justifyContent="space-between"
        alignItems="center"
        borderWidth={1}
        borderColor="$borderColor"
        borderRadius="$4"
        paddingHorizontal="$3"
        paddingVertical="$2"
        backgroundColor="$backgroundStrong"
        disabled={disabled || options.length === 0}
      >
        <YStack flex={1} gap="$1">
          {selectedOption ? (
            <PasskeySummary option={selectedOption} compact />
          ) : (
            <Paragraph color="$gray11">{placeholder}</Paragraph>
          )}
        </YStack>
        <Select.Icon>
          <Paragraph color="$gray11">▾</Paragraph>
        </Select.Icon>
        <Select.Value
          placeholder={placeholder}
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
        />
      </Select.Trigger>

      <Select.Content minWidth={320} zIndex={1000}>
        <Select.Viewport>
          {options.map((option, index) => (
            <React.Fragment key={option.credentialId}>
              <Select.Item
                value={option.credentialId}
                index={index}
                textValue={`${formatName(option)} ${option.address ?? ''}`}
              >
                <Select.ItemText>
                  <PasskeySummary option={option} />
                </Select.ItemText>
                <Select.ItemIndicator>
                  <Paragraph fontWeight="600">✓</Paragraph>
                </Select.ItemIndicator>
              </Select.Item>
              {index < options.length - 1 ? (
                <YStack height={1} backgroundColor="$borderColor" marginHorizontal={12} />
              ) : null}
            </React.Fragment>
          ))}
        </Select.Viewport>
      </Select.Content>
    </Select>
  );
}

export function PasskeySummary({
  option,
  compact = false,
}: {
  option: PasskeyOption;
  compact?: boolean;
}) {
  const { emoji, background } = getPaletteForCredential(option);
  const name = formatName(option);
  return (
    <YStack gap="$1" alignItems="flex-start" paddingVertical="$2">
      <XStack gap="$2" alignItems="center">
        <YStack
          width={36}
          height={36}
          borderRadius={18}
          alignItems="center"
          justifyContent="center"
          backgroundColor={background}
        >
          <Paragraph fontSize="$5" textAlign="center">
            {emoji}
          </Paragraph>
        </YStack>
        <Paragraph fontWeight="600" fontSize="$3" textAlign="left">
          {name}
        </Paragraph>
      </XStack>
      <Paragraph fontFamily="$mono" fontSize="$2" color="$gray11" textAlign="left">
        {formatAddress(option.address)}
      </Paragraph>
      {compact ? null : (
        <Paragraph fontSize="$2" color="$gray11" textAlign="left">
          {formatCredentialId(option.credentialId)}
        </Paragraph>
      )}
    </YStack>
  );
}
