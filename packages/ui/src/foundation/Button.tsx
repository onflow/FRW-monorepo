import React from 'react';
import { Spinner, Button as TamaguiButton, Text, XStack } from 'tamagui';

interface UIButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive' | 'success' | 'inverse';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  icon?: React.ReactElement;
  onPress?: () => void;
}

export function Button({
  variant = 'primary',
  size = 'medium',
  loading = false,
  loadingText,
  fullWidth = false,
  children,
  icon,
  disabled,
  onPress,
  ...props
}: UIButtonProps): React.ReactElement {
  let buttonSize, buttonStyles;
  const press = { opacity: 0.8, scale: 0.98 } as const;
  const baseReset = {
    borderWidth: 0,
    borderColor: 'transparent' as const,
    outlineWidth: 0,
    outlineColor: 'transparent' as const,
    focusStyle: { outlineWidth: 0, outlineColor: 'transparent', borderColor: 'transparent' },
  };

  // Map size
  switch (size) {
    case 'small':
      buttonSize = '$3';
      break;
    case 'large':
      buttonSize = '$14';
      break;
    case 'medium':
      buttonSize = '$6';
      break;
    default:
      buttonSize = '$4';
  }

  // Map variant to Flow theme styles
  switch (variant) {
    case 'secondary':
      buttonStyles = {
        bg: '$bg2',
        color: '$text',
        hoverStyle: { bg: '$bg3' },
        pressStyle: press,
      };
      break;
    case 'inverse':
      buttonStyles = {
        bg: '$text',
        color: '$bg',
        hoverStyle: { opacity: 0.9 },
        pressStyle: press,
      };
      break;
    case 'destructive':
      buttonStyles = {
        bg: '$error',
        color: '$white',
        hoverStyle: { opacity: 0.9 },
        pressStyle: press,
      };
      break;
    case 'success':
      buttonStyles = {
        bg: '$success',
        color: '$white',
        hoverStyle: { opacity: 0.9 },
        pressStyle: press,
      };
      break;
    case 'outline':
      buttonStyles = {
        bg: 'transparent',
        color: '$text',
        borderColor: '$border',
        borderWidth: 1,
        hoverStyle: { bg: '$bg1' },
        pressStyle: press,
      };
      break;
    case 'ghost':
      buttonStyles = {
        bg: 'transparent',
        color: '$text',
        hoverStyle: { bg: '$bg1' },
        pressStyle: press,
      };
      break;
    default:
      buttonStyles = {
        bg: '$primary',
        color: '$black',
        hoverStyle: { opacity: 0.9 },
        pressStyle: press,
      };
  }

  // Ensure press background matches normal background to avoid color flicker
  const finalStyles: any = {
    ...buttonStyles,
    pressStyle: {
      ...(buttonStyles as any)?.pressStyle,
      ...press,
      // keep background consistent on press
      bg: (buttonStyles as any)?.bg,
    },
  };

  return (
    <TamaguiButton
      size={buttonSize}
      disabled={disabled || loading}
      opacity={disabled && !loading ? 0.5 : 1}
      width={fullWidth ? '100%' : undefined}
      onPress={onPress}
      animation="quick"
      animateOnly={['transform', 'opacity']}
      {...baseReset}
      {...finalStyles}
      {...props}
    >
      {loading ? (
        <XStack items="center" gap="$2">
          <Spinner size="small" color="currentColor" />
          {loadingText && <Text color="currentColor">{loadingText}</Text>}
        </XStack>
      ) : (
        <XStack items="center" gap="$2">
          {icon && React.cloneElement(icon, { color: 'currentColor' })}
          {typeof children === 'string' ? <Text color="currentColor">{children}</Text> : children}
        </XStack>
      )}
    </TamaguiButton>
  );
}

export { Button as UIButton };
