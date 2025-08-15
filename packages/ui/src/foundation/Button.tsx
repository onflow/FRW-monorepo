import React from 'react';
import { Spinner, Button as TamaguiButton, Text, XStack } from 'tamagui';

interface UIButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive' | 'success';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  onPress?: () => void;
}

export function Button({
  variant = 'primary',
  size = 'medium',
  loading = false,
  loadingText,
  fullWidth = false,
  children,
  disabled,
  onPress,
  ...props
}: UIButtonProps): React.ReactElement {
  let buttonSize, buttonStyles;

  // Map size
  switch (size) {
    case 'small':
      buttonSize = '$3';
      break;
    case 'large':
      buttonSize = '$5';
      break;
    default:
      buttonSize = '$4';
  }

  // Map variant to Flow theme styles
  switch (variant) {
    case 'secondary':
      buttonStyles = { bg: '$bg2', color: '$text', borderColor: '$border', borderWidth: 1 };
      break;
    case 'destructive':
      buttonStyles = { bg: '$error', color: '$white' };
      break;
    case 'success':
      buttonStyles = { bg: '$success', color: '$white' };
      break;
    case 'outline':
      buttonStyles = { bg: 'transparent', color: '$text', borderColor: '$border', borderWidth: 1 };
      break;
    case 'ghost':
      buttonStyles = { bg: 'transparent', color: '$text' };
      break;
    default:
      buttonStyles = { bg: '$primary', color: '$black' };
  }

  return (
    <TamaguiButton
      size={buttonSize}
      disabled={disabled || loading}
      opacity={disabled && !loading ? 0.5 : 1}
      width={fullWidth ? '100%' : undefined}
      onPress={onPress}
      {...buttonStyles}
      {...props}
    >
      {loading ? (
        <XStack items="center" gap="$2">
          <Spinner size="small" color="currentColor" />
          {loadingText && <Text>{loadingText}</Text>}
        </XStack>
      ) : (
        children
      )}
    </TamaguiButton>
  );
}

export { Button as UIButton };
