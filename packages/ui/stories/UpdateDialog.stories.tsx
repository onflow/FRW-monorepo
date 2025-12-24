import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { View } from 'react-native';
import { YStack } from 'tamagui';

import { UpdateDialog, type WhatsNewResponse } from '../src/components/UpdateDialog';

const meta: Meta<typeof UpdateDialog> = {
  title: 'Components/UpdateDialog',
  component: UpdateDialog,
  decorators: [
    (Story): React.JSX.Element => (
      <YStack width={400} padding="$4">
        <Story />
      </YStack>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof UpdateDialog>;

// Mock data for different scenarios
const basicUpdateData: WhatsNewResponse = {
  version: '2.1.0',
  platform: 'ios',
  language: 'en',
  title: 'Welcome to Flow Reference Wallet 2.1',
  content: `
    <h3>🎉 New Features</h3>
    <ul>
      <li>Enhanced transaction signing with biometric authentication</li>
      <li>Improved NFT gallery with better image loading</li>
      <li>Added support for Flow EVM cross-chain transfers</li>
    </ul>

    <h3>🔧 Improvements</h3>
    <ul>
      <li>Faster wallet loading times</li>
      <li>Better error handling and user feedback</li>
      <li>Updated UI components with modern design</li>
    </ul>

    <p>Thank you for using Flow Reference Wallet! We're constantly working to improve your experience.</p>
  `,
  actions: [
    {
      text: 'Learn More',
      url: 'https://developers.flow.com',
      type: 'external',
      style: {
        backgroundColor: '#2563eb',
        color: '#ffffff',
      },
    },
    {
      text: 'Got it',
      type: 'internal',
      style: {
        backgroundColor: '#f3f4f6',
        color: '#374151',
      },
    },
  ],
};

const securityUpdateData: WhatsNewResponse = {
  version: '1.9.5',
  platform: 'android',
  language: 'en',
  title: 'Important Security Update',
  content: `
    <h3>🔒 Security Enhancement</h3>
    <p>This update includes important security improvements to protect your wallet:</p>
    <ul>
      <li>Enhanced encryption for private keys</li>
      <li>Improved transaction validation</li>
      <li>Stronger protection against phishing attacks</li>
    </ul>
    <p><em>We strongly recommend updating immediately to ensure the security of your funds.</em></p>
  `,
  actions: [
    {
      text: 'Update Now',
      type: 'internal',
      style: {
        backgroundColor: '#059669',
        color: '#ffffff',
      },
    },
  ],
};

const featureUpdateData: WhatsNewResponse = {
  version: '2.2.0',
  platform: 'web',
  language: 'en',
  title: 'Major Update Available',
  content: `
    <h2>🚀 Big Changes Are Here!</h2>
    <p>We've completely redesigned the wallet experience with:</p>
    <ul>
      <li><strong>New Dashboard:</strong> See all your assets at a glance</li>
      <li><strong>Advanced Security:</strong> Multi-layer protection for your funds</li>
      <li><strong>Cross-Chain Support:</strong> Seamlessly move assets between networks</li>
    </ul>
    <p>This update includes breaking changes. Please backup your recovery phrase before updating.</p>
  `,
  actions: [
    {
      text: 'Backup & Update',
      type: 'internal',
      style: {
        backgroundColor: '#dc2626',
        color: '#ffffff',
      },
    },
    {
      text: 'Read Full Changelog',
      url: 'https://github.com/onflow/FRW-monorepo/releases',
      type: 'external',
      style: {
        backgroundColor: '#f3f4f6',
        color: '#374151',
      },
    },
    {
      text: 'Remind Me Later',
      type: 'internal',
      style: {
        backgroundColor: 'transparent',
        color: '#6b7280',
        borderColor: '#d1d5db',
      },
    },
  ],
};

const UpdateDialogDemo: React.FC<{ data: WhatsNewResponse }> = ({ data }): JSX.Element => {
  const [visible, setVisible] = useState(true);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
      }}
    >
      <button
        onClick={() => setVisible(true)}
        style={{
          padding: '12px 24px',
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '600',
        }}
      >
        Show Update Dialog
      </button>

      <UpdateDialog
        visible={visible}
        data={data}
        onClose={() => setVisible(false)}
        onDismiss={() => {
          console.log('Dialog dismissed');
          setVisible(false);
        }}
        onActionPress={(action) => {
          console.log('Action pressed:', action);
          if (action.type === 'internal') {
            setVisible(false);
          }
        }}
      />
    </View>
  );
};

export const Basic: Story = {
  render: () => <UpdateDialogDemo data={basicUpdateData} />,
  parameters: {
    docs: {
      description: {
        story:
          'Basic update dialog with text content and action buttons using the simplified action interface.',
      },
    },
  },
};

export const SecurityUpdate: Story = {
  render: () => <UpdateDialogDemo data={securityUpdateData} />,
  parameters: {
    docs: {
      description: {
        story:
          'Security-focused update dialog with high priority styling and single action button.',
      },
    },
  },
};

export const FeatureUpdate: Story = {
  render: () => <UpdateDialogDemo data={featureUpdateData} />,
  parameters: {
    docs: {
      description: {
        story:
          'Feature update dialog with multiple action buttons showcasing different styles and types.',
      },
    },
  },
};

export const CustomStyles: Story = {
  render: () => {
    const customData: WhatsNewResponse = {
      ...basicUpdateData,
      actions: [
        {
          text: 'Get Started',
          type: 'external',
          url: 'https://developers.flow.com/build/getting-started',
          style: {
            backgroundColor: '#7c3aed',
            color: '#ffffff',
            borderRadius: 8,
            fontWeight: '700',
          },
        },
        {
          text: 'View Tutorial',
          type: 'external',
          url: 'https://academy.onflow.org/',
          style: {
            backgroundColor: '#f59e0b',
            color: '#ffffff',
            borderRadius: 8,
          },
        },
        {
          text: 'Skip for Now',
          type: 'internal',
          style: {
            backgroundColor: 'transparent',
            color: '#6b7280',
            borderWidth: 1,
            borderColor: '#d1d5db',
          },
        },
      ],
    };

    return <UpdateDialogDemo data={customData} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Update dialog with custom-styled action buttons using the flexible style property.',
      },
    },
  },
};

export const NoActions: Story = {
  render: () => {
    const noActionsData: WhatsNewResponse = {
      ...basicUpdateData,
      actions: [],
    };

    return <UpdateDialogDemo data={noActionsData} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Update dialog with no action buttons - shows default "Got it" button.',
      },
    },
  },
};

export const MultiPlatform: Story = {
  render: () => {
    const [currentPlatform, setCurrentPlatform] = useState<'ios' | 'android' | 'web'>('ios');

    const platformData: Record<string, WhatsNewResponse> = {
      ios: {
        version: '2.1.0',
        platform: 'ios',
        language: 'en',
        title: 'iOS Update Available',
        content:
          '<h3>📱 iOS-Specific Features</h3><ul><li>Face ID integration</li><li>iOS 17 compatibility</li><li>App Store review prompts</li></ul>',
        actions: [
          {
            text: 'Update on App Store',
            url: 'https://apps.apple.com/app/flow-wallet',
            type: 'external',
            style: { backgroundColor: '#007AFF', color: '#ffffff' },
          },
        ],
      },
      android: {
        version: '2.1.0',
        platform: 'android',
        language: 'en',
        title: 'Android Update Available',
        content:
          '<h3>🤖 Android-Specific Features</h3><ul><li>Fingerprint authentication</li><li>Android 14 support</li><li>Material Design 3</li></ul>',
        actions: [
          {
            text: 'Update on Play Store',
            url: 'https://play.google.com/store/apps/details?id=com.flowwallet',
            type: 'external',
            style: { backgroundColor: '#34A853', color: '#ffffff' },
          },
        ],
      },
      web: {
        version: '2.1.0',
        platform: 'web',
        language: 'en',
        title: 'Web Extension Update',
        content:
          '<h3>🌐 Web Extension Features</h3><ul><li>Chrome extension improvements</li><li>Firefox support</li><li>Enhanced dApp integration</li></ul>',
        actions: [
          {
            text: 'Refresh Extension',
            type: 'internal',
            style: { backgroundColor: '#4285F4', color: '#ffffff' },
          },
        ],
      },
    };

    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f9fafb',
        }}
      >
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          {(['ios', 'android', 'web'] as const).map((platform) => (
            <button
              key={platform}
              onClick={() => setCurrentPlatform(platform)}
              style={{
                padding: '8px 16px',
                backgroundColor: currentPlatform === platform ? '#2563eb' : '#f3f4f6',
                color: currentPlatform === platform ? 'white' : '#374151',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {platform}
            </button>
          ))}
        </View>
        <UpdateDialogDemo data={platformData[currentPlatform]} />
      </View>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates platform-specific update dialogs with different content and styling based on the platform field.',
      },
    },
  },
};
