import React from 'react';
import { Button as TamaguiButton, type ButtonProps, useTheme } from 'tamagui';

interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: React.ReactElement;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive' | 'success';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onPress?: () => void;
}

export function IconButton({
  icon,
  variant = 'ghost',
  size = 'medium',
  disabled = false,
  onPress,
  ...props
}: IconButtonProps): React.ReactElement {
  const theme = useTheme();
  let buttonSize: any;
  let iconSize: number;
  let dimension: number;
  let padding: number | string;
  let buttonStyles;

  // Map size to Tamagui size and appropriate icon size
  switch (size) {
    case 'small':
      buttonSize = '$3';
      iconSize = 16;
      dimension = 24;
      padding = '$1';
      break;
    case 'large':
      buttonSize = '$5';
      iconSize = 32;
      dimension = 48;
      padding = '$2';
      break;
    case 'medium':
    default:
      buttonSize = '$4';
      iconSize = 24;
      dimension = 40;
      padding = '$1.5';
      break;
  }

  // Map variant to Flow theme styles
  switch (variant) {
    case 'secondary':
      buttonStyles = {
        bg: '$bg2',
        color: '$text',
        borderColor: '$border',
        borderWidth: 1,
        hoverStyle: { bg: '$bg3' },
        pressStyle: { bg: '$bg4' },
      };
      break;
    case 'destructive':
      buttonStyles = {
        bg: '$error',
        color: '$white',
        hoverStyle: { opacity: 0.9 },
        pressStyle: { opacity: 0.8 },
      };
      break;
    case 'success':
      buttonStyles = {
        bg: '$success',
        color: '$white',
        hoverStyle: { opacity: 0.9 },
        pressStyle: { opacity: 0.8 },
      };
      break;
    case 'outline':
      buttonStyles = {
        bg: 'transparent',
        color: '$text',
        borderColor: '$border',
        borderWidth: 1,
        hoverStyle: { bg: '$bg1' },
        pressStyle: {
          bg: '$bg2',
          borderColor: '$border',
          color: '$text',
        },
      };
      break;
    case 'ghost':
      buttonStyles = {
        bg: 'transparent',
        color: '$text',
        borderWidth: 0,
        hoverStyle: { bg: '$bg1' },
        pressStyle: { bg: '$bg2', borderWidth: 0 },
      };
      break;
    case 'primary':
      buttonStyles = {
        bg: '$primary',
        color: '$black',
        hoverStyle: { opacity: 0.9 },
        pressStyle: { opacity: 0.8 },
      };
      break;
    default:
      buttonStyles = {
        bg: 'transparent',
        color: '$text',
        hoverStyle: { bg: '$bg1' },
        pressStyle: { bg: '$bg2' },
      };
  }

  return (
    <TamaguiButton
      size={buttonSize}
      disabled={disabled}
      opacity={disabled ? 0.5 : 1}
      onPress={onPress}
      circular
      padding={padding}
      width={dimension}
      height={dimension}
      items="center"
      justify="center"
      borderWidth={0}
      unstyled={false}
      flexShrink={0}
      // Android touch improvement: Add hit slop for better touch detection
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      // Android touch improvement: Use activeOpacity for visual feedback
      pressStyle={{
        ...buttonStyles.pressStyle,
        opacity: 0.7,
        transform: [{ scale: 0.95 }],
      }}
      {...buttonStyles}
      {...props}
    >
      {React.cloneElement(icon, {
        size: icon.props.size || iconSize,
        color:
          resolveColor(icon.props.color, theme) ??
          resolveColor((buttonStyles as any)?.color, theme) ??
          'currentColor',
      })}
    </TamaguiButton>
  );
}

export { IconButton as UIIconButton };

function resolveColor(
  value: string | undefined,
  theme: ReturnType<typeof useTheme>
): string | undefined {
  if (!value) return undefined;

  if (value.startsWith('$')) {
    const token = value.slice(1);
    const themeValue = (theme as any)?.[token]?.val;
    if (typeof themeValue === 'string') {
      return themeValue;
    }
  }

  return value;
}
