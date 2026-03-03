import { Close } from '@onflow/frw-icons';
import React from 'react';
import Markdown from 'react-markdown';
import { Linking, Modal, useWindowDimensions } from 'react-native';
import {
  H1,
  H2,
  H3,
  Paragraph,
  ScrollView,
  Stack,
  Text,
  Text as TamaguiText,
  XStack,
  YStack,
  getTokens,
} from 'tamagui';

/**
 * Rehype plugin: strip whitespace-only text nodes and wrap any remaining bare
 * text in `<span>` so the component overrides can render them inside `<Text>`.
 *
 * react-markdown v10 renders the hast root as a React Fragment.  Newline text
 * nodes between block elements (`\n`) dissolve into the parent View and crash
 * React Native with "Text strings must be rendered within a <Text> component".
 */
const rehypeSanitizeTextForRN = () => (tree: any) => {
  // View-like elements whose children must not contain bare strings
  const viewTags = new Set([
    'div',
    'section',
    'article',
    'nav',
    'aside',
    'figure',
    'figcaption',
    'details',
    'table',
    'thead',
    'tbody',
    'tr',
  ]);

  const process = (node: any) => {
    if (!Array.isArray(node.children)) return;

    for (const child of node.children) {
      if (child.type === 'element' || child.type === 'root') process(child);
    }

    const needsSanitize =
      node.type === 'root' || (node.type === 'element' && viewTags.has(node.tagName));

    if (!needsSanitize) return;

    node.children = node.children
      .map((child: any) => {
        if (child.type !== 'text') return child;
        if (child.value.trim() === '') return null;
        // Wrap non-empty text in <span> → our span override renders <Text>
        return {
          type: 'element',
          tagName: 'span',
          properties: {},
          children: [child],
        };
      })
      .filter(Boolean);
  };

  process(tree);
};

export interface WhatsNewAction {
  text: string;
  url?: string;
  type: 'external' | 'internal' | 'deeplink';
  style?: Record<string, unknown>;
}

export interface UpdateDialogProps {
  visible: boolean;
  title: string;
  children?: React.ReactNode;
  updateContent?: string;
  actions: WhatsNewAction[];
  buttonText: string;
  onButtonClick?: () => void;
  onClose: () => void;
}

export const UpdateDialog: React.FC<UpdateDialogProps> = ({
  visible,
  title,
  children,
  updateContent,
  actions,
  onButtonClick,
  onClose,
}) => {
  const normalizeMarkdownViewChildren = (
    nodes: React.ReactNode,
    keyPrefix = 'markdown'
  ): React.ReactNode[] =>
    React.Children.toArray(nodes).flatMap((child, index) => {
      if (typeof child === 'string') {
        if (child.trim().length === 0) return [];

        return [
          <Text key={`${keyPrefix}-text-${index}`} fontSize="$4" lineHeight={22}>
            {child}
          </Text>,
        ];
      }

      return [child];
    });

  const tokens = getTokens();
  const { height: screenHeight } = useWindowDimensions();
  // Pixel-based max height so the dialog container has a measurable bound.
  // ScrollView requires its ancestor to have a bounded height to enable scrolling.
  const dialogMaxHeight = Math.floor(screenHeight * 0.85);

  const handleActions = (action: WhatsNewAction) => {
    if (action.type === 'external') {
      if (action.url) {
        Linking.openURL(action.url).catch(() => {});
      }
    } else if (action.type === 'internal') {
      onButtonClick?.();
      onClose();
    }
  };

  const dialogContent = (
    <Stack
      {...({
        pos: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        z: 9999,
        items: 'center',
        justify: 'center',
        pointerEvents: 'box-none',
        'aria-modal': 'true',
        role: 'dialog',
        'aria-labelledby': 'update-dialog-title',
      } as any)}
    >
      <Stack
        {...({
          pos: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bg: 'rgba(0, 0, 0, 0.5)',
          pressStyle: { opacity: 1 },
          onPress: onClose,
        } as any)}
      />

      <YStack
        {...({
          w: 640,
          minW: '90%',
          maxW: '90%',
          minH: 420,
          maxH: dialogMaxHeight,
          flexShrink: 1,
          overflow: 'hidden',
          z: 1,
          bg: '$bg2',
          rounded: 24,
          shadowColor: '$shadow',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.25,
          shadowRadius: 12,
          elevation: 8,
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
            onPress: onClose,
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
            flex: 1,
            minHeight: 30,
            mb: 8,
            showsVerticalScrollIndicator: true,
            scrollEnabled: true,
            nestedScrollEnabled: true,
            keyboardShouldPersistTaps: 'handled',
            contentContainerStyle: {
              paddingHorizontal: 12,
              paddingBottom: 8,
            },
          } as any)}
        >
          {updateContent ? (
            <YStack gap="$3">
              <Markdown
                rehypePlugins={[rehypeSanitizeTextForRN]}
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

                  // Replace web Anchor with Linking.openURL for React Native
                  a: ({ children, href }) => (
                    <Text
                      color="#00EF8B"
                      textDecorationLine="underline"
                      onPress={() => href && Linking.openURL(href).catch(() => {})}
                    >
                      {children}
                    </Text>
                  ),

                  blockquote: ({ children }) => (
                    <YStack
                      {...({
                        borderLeftWidth: 3,
                        borderLeftColor: '$color6',
                        pl: '$3',
                        opacity: 0.9,
                      } as any)}
                    >
                      {normalizeMarkdownViewChildren(children, 'blockquote')}
                    </YStack>
                  ),

                  ul: ({ children }) => (
                    <YStack gap="$2">{normalizeMarkdownViewChildren(children, 'ul')}</YStack>
                  ),
                  ol: ({ children }) => (
                    <YStack gap="$2">{normalizeMarkdownViewChildren(children, 'ol')}</YStack>
                  ),

                  li: ({ children }) => (
                    <XStack {...({ gap: '$2', alignItems: 'flex-start' } as any)}>
                      <Text mt={2} opacity={0.7}>
                        •
                      </Text>
                      <Paragraph size="$4" lineHeight={22} flex={1}>
                        {normalizeMarkdownViewChildren(children, 'li')}
                      </Paragraph>
                    </XStack>
                  ),

                  hr: () => (
                    <YStack
                      {...({
                        height: 1,
                        backgroundColor: '$color5',
                        opacity: 0.6,
                        my: '$2',
                      } as any)}
                    />
                  ),

                  // Code blocks
                  pre: ({ children }) => (
                    <YStack
                      {...({
                        bg: 'rgba(255,255,255,0.05)',
                        p: '$3',
                        rounded: 8,
                        overflow: 'hidden',
                      } as any)}
                    >
                      {normalizeMarkdownViewChildren(children, 'pre')}
                    </YStack>
                  ),

                  // Inline code
                  code: ({ children }) => (
                    <Text fontSize={13} backgroundColor="rgba(255,255,255,0.1)">
                      {children}
                    </Text>
                  ),

                  // Line break
                  br: () => <Text>{'\n'}</Text>,

                  // Catch-all for stray HTML containers the rehype plugin
                  // may leave or that raw markdown HTML can produce.
                  div: ({ children }) => (
                    <YStack>{normalizeMarkdownViewChildren(children, 'div')}</YStack>
                  ),
                  span: ({ children }) => <Text>{children}</Text>,
                }}
              >
                {updateContent}
              </Markdown>
            </YStack>
          ) : typeof children === 'string' ? (
            <Paragraph size="$4" lineHeight={22}>
              {children}
            </Paragraph>
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
                {...({
                  fontSize: '$3',
                  fontWeight: '600',
                  color: '#00EF8B',
                  textAlign: 'center',
                  textDecorationLine: 'underline',
                } as any)}
              >
                {action.text}
              </TamaguiText>
            </YStack>
          );
        })}
      </YStack>
    </Stack>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      {dialogContent}
    </Modal>
  );
};
