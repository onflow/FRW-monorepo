import React from 'react';
import { Card, Paragraph, XStack, YStack } from 'tamagui';

export interface PasskeyCredential {
  credentialId: string;
  address?: string;
  keyInfo?: {
    keyIndex?: number;
  } | null;
}

interface PasskeyCredentialCardProps {
  credential: PasskeyCredential;
  isSelected: boolean;
  onSelect: (credentialId: string) => void;
}

const formatAddress = (address?: string) => {
  if (!address) return 'Address pending';
  const normalized = address.startsWith('0x') ? address : `0x${address}`;
  return normalized;
};

const formatCredentialId = (credentialId: string) => {
  return `${credentialId.slice(0, 8)}…${credentialId.slice(-6)}`;
};

export function PasskeyCredentialCard({
  credential,
  isSelected,
  onSelect,
}: PasskeyCredentialCardProps): React.ReactElement {
  return (
    <Card
      variant={isSelected ? 'elevated' : 'outlined'}
      p="$4"
      bg={isSelected ? '$primary' : '$bg'}
      borderColor={isSelected ? '$primary' : '$border'}
      borderWidth={isSelected ? 2 : 1}
      pressStyle={{ scale: 0.98 }}
      cursor="pointer"
      onPress={() => onSelect(credential.credentialId)}
      animation="quick"
      animateOnly={['transform', 'backgroundColor', 'borderColor']}
    >
      <YStack gap="$2">
        <XStack items="center" justify="space-between">
          <Paragraph fontWeight="600" fontSize="$4" color={isSelected ? '$color1' : '$text'}>
            {formatAddress(credential.address)}
          </Paragraph>
          {isSelected && (
            <XStack bg="$color1" rounded="$10" px="$2" py="$1">
              <Paragraph fontSize="$1" fontWeight="600" color={isSelected ? '$primary' : '$bg'}>
                Selected
              </Paragraph>
            </XStack>
          )}
        </XStack>

        <Paragraph fontSize="$2" color={isSelected ? '$color2' : '$textMuted'} opacity={0.8}>
          Credential: {formatCredentialId(credential.credentialId)}
        </Paragraph>
      </YStack>
    </Card>
  );
}

export { PasskeyCredentialCard as UIPasskeyCredentialCard };
export type { PasskeyCredential };
