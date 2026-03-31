import { Close } from '@onflow/frw-icons';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Markdown from 'react-markdown';
import {
  Anchor,
  H1,
  H2,
  H3,
  Paragraph,
  Text,
  YStack,
  XStack,
  Stack,
  ScrollView,
  useTheme,
  getTokens,
  Text as TamaguiText,
} from 'tamagui';

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
   * Content to display in the dialog. Can be React nodes or markdown string.
   * If updateContent is provided, it will be rendered as markdown.
   * Otherwise, children will be rendered normally.
   */
  children?: React.ReactNode;
  updateContent?: string;
  actions: WhatsNewAction[];
  /**
   * Button text to show at bottom of dialog (required)
   */
  buttonText: string;
  /**
   * Callback when bottom button is clicked
   */
  onButtonClick?: () => void;
  onActionPress?: (action: WhatsNewAction) => void;
  /**
   * Callback when dialog is closed
   */
  onClose: () => void;
}

export const UpdateDialog: React.FC<UpdateDialogProps> = ({
  visible,
  title,
  children,
  updateContent,
  actions,
  buttonText,
  onButtonClick,
  onActionPress,
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
    onActionPress?.(action);

    if (action.type === 'external') {
      if (action.url && typeof window !== 'undefined') {
        window.open(action.url, '_blank', 'noopener,noreferrer');
      }
    } else if (action.type === 'internal') {
      // todo for inner url
      onButtonClick?.();
      onClose();
    } else if (action.type === 'deeplink') {
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
          data-testid="popup-close-button"
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
        <YStack {...({ items: 'center', mb: 24, mt: 8 } as any)}>
          <TamaguiText
            {...({
              id: 'update-dialog-title',
              fontSize: 20,
              fontWeight: '900',
              color: '#00EF8B',
              ta: 'center',
            } as any)}
          >
            {title}
          </TamaguiText>
        </YStack>

        {/* Content area */}
        <ScrollView
          {...({
            maxHeight: '60vh',
            mb: 12,
            px: 20,
            showsVerticalScrollIndicator: true,
          } as any)}
        >
          {updateContent ? (
            <YStack gap="$3">
              <Markdown
                components={{
                  h1: ({ children }) => (
                    <H1 size="$9" mt="$2" mb="$1">
                      {children}
                    </H1>
                  ),
                  h2: ({ children }) => (
                    <H2 size="$8" mt="$2" mb="$1">
                      {children}
                    </H2>
                  ),
                  h3: ({ children }) => (
                    <H3 size="$7" mt="$2" mb="$1">
                      {children}
                    </H3>
                  ),

                  p: ({ children }) => (
                    <Paragraph size="$4" lineHeight={22}>
                      {children}
                    </Paragraph>
                  ),

                  strong: ({ children }) => <Text fontWeight="800">{children}</Text>,
                  em: ({ children }) => <Text fontStyle="italic">{children}</Text>,

                  a: ({ children, href }) => (
                    <Anchor
                      href={href}
                      color="$color10"
                      textDecorationLine="underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {children}
                    </Anchor>
                  ),

                  blockquote: ({ children }) => (
                    <YStack borderLeftWidth={3} borderLeftColor="$color6" pl="$3" opacity={0.9}>
                      {children}
                    </YStack>
                  ),

                  ul: ({ children }) => <YStack gap="$2">{children}</YStack>,
                  ol: ({ children }) => <YStack gap="$2">{children}</YStack>,

                  li: ({ children }) => (
                    <XStack gap="$2" alignItems="flex-start">
                      <Text mt={2} opacity={0.7}>
                        •
                      </Text>
                      <Paragraph size="$4" lineHeight={22} flex={1}>
                        {children}
                      </Paragraph>
                    </XStack>
                  ),

                  hr: () => <YStack height={1} backgroundColor="$color5" opacity={0.6} my="$2" />,
                }}
              >
                {updateContent}
              </Markdown>
            </YStack>
          ) : (
            children
          )}
        </ScrollView>

        {actions.map((action, index) => {
          return (
            <YStack
              key={`${action.type}-${index}`}
              width="100%"
              justify={'center'}
              items={'center'}
              pressStyle={{ opacity: 0.8 }}
              onPress={() => handleActions(action)}
              cursor="pointer"
            >
              <TamaguiText
                fontSize="$3"
                fontWeight="600"
                color="#00EF8B"
                textAlign="center"
                textDecorationLine="underline"
              >
                {action.text}
              </TamaguiText>
            </YStack>
          );
        })}
      </YStack>
    </Stack>
  );

  // Use portal to render at document body level (only in browser)
  if (typeof document !== 'undefined') {
    return createPortal(dialogContent, document.body);
  }

  return null;
};
