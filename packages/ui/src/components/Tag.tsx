import { styled, YStack } from 'tamagui';

import { Text } from '../foundation/Text';

interface TagProps {
  children: React.ReactNode;
}

const TagContainer = styled(YStack, {
  bg: '$error10',
  rounded: '$4',
  px: '$2',
  self: 'flex-start',
  shrink: 1,
  py: '$1',
  items: 'center',
  justify: 'center',
  minH: 20,
});

export function Tag({ children }: TagProps): React.ReactElement | null {
  return (
    <TagContainer>
      <Text color="$error" fontSize={8} lineHeight={8}>
        {children}
      </Text>
    </TagContainer>
  );
}
