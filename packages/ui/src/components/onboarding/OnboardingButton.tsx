import React from 'react';
import { Button, Text, type ButtonProps } from 'tamagui';

interface OnboardingButtonProps extends Omit<ButtonProps, 'size' | 'variant'> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onPress?: () => void;
}

export function OnboardingButton({
  variant = 'primary',
  children,
  onPress,
  disabled,
  ...props
}: OnboardingButtonProps): React.ReactElement {
  const isPrimary = variant === 'primary';

  return (
    <Button
      h={56}
      rounded="$4"
      bg={isPrimary ? '$text' : 'transparent'}
      borderWidth={isPrimary ? 0 : 1}
      borderColor={isPrimary ? 'transparent' : '$primary'}
      opacity={disabled ? 0.5 : 1}
      animation="quick"
      pressStyle={{
        opacity: 0.8,
        scale: 0.98,
      }}
      hoverStyle={{
        opacity: 0.9,
      }}
      onPress={onPress}
      disabled={disabled}
      {...props}
    >
      <Text
        fontSize="$4"
        fontWeight="600"
        color={isPrimary ? '$background' : '$text'}
      >
        {children}
      </Text>
    </Button>
  );
}