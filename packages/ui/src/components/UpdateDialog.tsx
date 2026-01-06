import { Close } from '@onflow/frw-icons';
import DOMPurify from 'dompurify';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { YStack, Stack, useTheme, getTokens, Text as TamaguiText } from 'tamagui';

import HtmlView from './HtmlView';

export interface WhatsNewAction {
  text: string;
  url?: string;
  type: 'external' | 'internal' | 'deeplink';
  style?: Record<string, unknown>;
}

export interface UpdateDialogProps {
  visible: boolean;
  title: string;
  /**
   * Content to display in the dialog. Can be React nodes or HTML string.
   * If htmlContent is provided, it will be rendered using dangerouslySetInnerHTML.
   * Otherwise, children will be rendered normally.
   */
  children?: React.ReactNode;
  htmlContent?: string;
  actions: WhatsNewAction[];
  /**
   * Button text to show at bottom of dialog (required)
   */
  buttonText: string;
  /**
   * Callback when bottom button is clicked
   */
  onButtonClick?: () => void;
  /**
   * Callback when dialog is closed
   */
  onClose: () => void;
}

export const UpdateDialog: React.FC<UpdateDialogProps> = ({
  visible,
  title,
  children,
  htmlContent,
  actions,
  buttonText,
  onButtonClick,
  onClose,
}) => {
  const theme = useTheme();
  const tokens = getTokens();

  // Handle escape key press and body scroll prevention
  useEffect(() => {
    // Only run in browser environment
    if (typeof document === 'undefined') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && visible) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when dialog is open
      if (document.body) {
        document.body.style.overflow = 'hidden';
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (document.body) {
        document.body.style.overflow = 'unset';
      }
    };
  }, [visible, onClose]);

  if (!visible) return null;

  const handleButtonClick = () => {
    onButtonClick?.();
    onClose();
  };

  const handleActions = (action: WhatsNewAction) => {
    if (action.type === 'external') {
      if (action.url && typeof window !== 'undefined') {
        window.open(action.url, '_blank', 'noopener,noreferrer');
      }
    } else if (action.type === 'internal') {
      // todo for inner url
      onButtonClick?.();
      onClose();
    }
  };

  const dialogContent = (
    <Stack
      {...({
        pos: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: 'rgba(0, 0, 0, 0.5)',
        z: 9999,
        items: 'center',
        justify: 'center',
        pressStyle: { opacity: 1 },
        onPress: onClose,
        'aria-modal': 'true',
        role: 'dialog',
        'aria-labelledby': 'update-dialog-title',
      } as any)}
    >
      <YStack
        {...({
          w: 640,
          minW: 300,
          maxW: '90%',
          minH: 200,
          maxH: '90%',
          bg: '$bg2',
          rounded: 24,
          shadowColor: '$shadow',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.25,
          shadowRadius: 12,
          elevation: 8,
          pressStyle: { opacity: 1 },
          onPress: (e: any) => e.stopPropagation(),
          p: 16,
          pos: 'relative',
        } as any)}
      >
        {/* Close button */}
        <YStack
          {...({
            pos: 'absolute',
            top: 8,
            right: 8,
            w: 24,
            h: 24,
            zIndex: 10,
            items: 'center',
            justify: 'center',
            bg: 'transparent',
            rounded: 12,
            hoverStyle: { bg: 'rgba(255, 255, 255, 0.1)' },
            pressStyle: { opacity: 0.7 },
            onPress: (e: any) => {
              e.stopPropagation();
              onClose();
            },
            cursor: 'pointer',
            'aria-label': 'Close dialog',
          } as any)}
        >
          <Close
            size={24}
            color={tokens.color.light80.val}
            style={{ alignSelf: 'center', pointerEvents: 'none' }}
          />
        </YStack>

        {/* Title */}
        <YStack {...({ items: 'center', mb: 12 } as any)}>
          <TamaguiText
            {...({
              id: 'update-dialog-title',
              fontSize: 18,
              fontWeight: '700',
              color: '#00EF8B',
              ta: 'center',
            } as any)}
          >
            {title}
          </TamaguiText>
        </YStack>

        {/* Content area */}
        <YStack {...({ gap: 10, mb: 12, px: 20 } as any)}>
          {htmlContent ? <HtmlView htmlContent={DOMPurify.sanitize(htmlContent)} /> : children}
        </YStack>

        {actions.map((action, index) => {
          const buttonStyle = action.style || {};

          return (
            <YStack
              key={`${action.type}-${index}`}
              width="100%"
              height="$12"
              justify={'center'}
              items={'center'}
              backgroundColor={buttonStyle.backgroundColor || '$bg'}
              borderRadius="$3"
              pressStyle={{ opacity: 0.8, scale: 0.98 }}
              onPress={() => handleActions(action)}
              cursor="pointer"
              borderWidth={1}
              {...buttonStyle}
            >
              <TamaguiText
                fontSize="$4"
                fontWeight="600"
                color={buttonStyle.color || '$text'}
                textAlign="center"
                lineHeight="$12"
              >
                {action.text}
              </TamaguiText>
            </YStack>
          );
        })}

        {/* Bottom button */}
        <YStack mt="16px">
          <YStack
            {...({
              height: 50,
              minHeight: 50,
              maxHeight: 50,
              w: '100%',
              bg: '#FFFFFF',
              rounded: 12,
              items: 'center',
              justify: 'center',
              hoverStyle: { opacity: 0.9, bg: '#F5F5F5' },
              pressStyle: { opacity: 0.8 },
              onPress: handleButtonClick,
              cursor: 'pointer',
            } as any)}
          >
            <TamaguiText
              {...({
                fontSize: 14,
                fontWeight: '700',
                color: '#000000',
              } as any)}
            >
              {buttonText}
            </TamaguiText>
          </YStack>
        </YStack>
      </YStack>
    </Stack>
  );

  // Use portal to render at document body level (only in browser)
  if (typeof document !== 'undefined') {
    return createPortal(dialogContent, document.body);
  }

  return null;
};
