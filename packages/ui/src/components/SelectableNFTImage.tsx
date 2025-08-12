import { CheckCircle, CheckCircleFill } from '@onflow/frw-icons';
import React from 'react';
import { YStack, Image, Button } from 'tamagui';

export interface SelectableNFTImageProps {
  src: string;
  selected?: boolean;
  selectable?: boolean;
  onToggleSelection?: () => void;
  onImagePress?: () => void;
  aspectRatio?: number;
  borderRadius?: number | string;
  size?: 'small' | 'medium' | 'large' | 'full';
}

export function SelectableNFTImage({
  src,
  selected = false,
  selectable = false,
  onToggleSelection,
  onImagePress,
  aspectRatio = 1,
  borderRadius = '$4',
  size = 'full',
}: SelectableNFTImageProps) {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: 120, height: 120 };
      case 'medium':
        return { width: 200, height: 200 };
      case 'large':
        return { width: 300, height: 300 };
      default:
        return { width: '100%', aspectRatio };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <YStack
      {...sizeStyles}
      bg="$bg3"
      borderRadius={borderRadius}
      overflow="hidden"
      pos="relative"
      pressStyle={{ opacity: 0.9 }}
      onPress={onImagePress}
    >
      <Image
        src={src}
        width="100%"
        height="100%"
        resizeMode="cover"
        fallback={
          <YStack flex={1} items="center" justify="center" bg="$bg3">
            <YStack
              width={40}
              height={40}
              borderRadius="$2"
              bg="$bg4"
              items="center"
              justify="center"
            >
              <YStack width={16} height={16} borderRadius="$1" bg="$textTertiary" />
            </YStack>
          </YStack>
        }
      />

      {/* Selection Button */}
      {selectable && (
        <Button
          pos="absolute"
          top="$3"
          right="$3"
          bg={selected ? '$primary' : 'rgba(0,0,0,0.3)'}
          borderRadius="$6"
          p="$2"
          onPress={(e) => {
            e.stopPropagation();
            onToggleSelection?.();
          }}
          pressStyle={{ opacity: 0.8 }}
        >
          {selected ? (
            <CheckCircleFill size={20} color="white" />
          ) : (
            <CheckCircle size={20} color="white" />
          )}
        </Button>
      )}

      {/* Selection Overlay */}
      {selected && (
        <YStack
          pos="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(99, 102, 241, 0.1)"
          borderWidth={2}
          borderColor="$primary"
          borderRadius={borderRadius}
        />
      )}
    </YStack>
  );
}
