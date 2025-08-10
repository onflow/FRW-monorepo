import * as Icons from '@onflow/frw-icons';
import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';

import { Input, Text, View, XStack, YStack } from '../src';

const meta = {
  title: 'Foundation/Icons',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Complete collection of Flow Reference Wallet icons. All icons are universal React SVG components that work in Web, React Native, and Extensions.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Get all icon components and their names
const iconEntries = Object.entries(Icons).filter(
  ([name, Component]) => typeof Component === 'function' && name !== 'default'
);

// Group icons by category (based on exported names from different directories)
const categorizeIcons = (): Record<string, Array<[string, React.ComponentType]>> => {
  const categories: Record<string, Array<[string, React.ComponentType]>> = {
    General: [],
    Send: [],
    Tokens: [],
  };

  iconEntries.forEach(([name, Component]) => {
    if (name.startsWith('Tab') || name.includes('Confirm')) {
      categories['Send'].push([name, Component as React.ComponentType]);
    } else if (name.includes('Token') || name.includes('Flow')) {
      categories['Tokens'].push([name, Component as React.ComponentType]);
    } else {
      categories['General'].push([name, Component as React.ComponentType]);
    }
  });

  return categories;
};

const IconShowcase = (): React.ReactElement => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [iconSize, setIconSize] = useState(24);

  const categories = categorizeIcons();

  // Filter icons based on search term
  const filteredCategories = Object.entries(categories).reduce(
    (acc, [category, icons]) => {
      const filteredIcons = icons.filter(([name]) =>
        name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filteredIcons.length > 0) {
        acc[category] = filteredIcons;
      }
      return acc;
    },
    {} as Record<string, Array<[string, React.ComponentType]>>
  );

  return (
    <YStack gap="$4" p="$4">
      {/* Header */}
      <YStack gap="$3">
        <Text variant="heading">Flow Reference Wallet Icons</Text>
        <Text variant="body" color="$gray11">
          {iconEntries.length} universal SVG icons that work across Web, React Native, and
          Extensions.
        </Text>
      </YStack>

      {/* Controls */}
      <XStack gap="$3" items="flex-end">
        <YStack flex={1}>
          <Text variant="label" color="$gray11" mb="$2">
            Search Icons
          </Text>
          <Input
            placeholder="Search by icon name..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </YStack>

        <YStack minW={120}>
          <Text variant="label" color="$gray11" mb="$2">
            Size: {iconSize}px
          </Text>
          <Input
            type="range"
            min="16"
            max="64"
            step="4"
            value={iconSize.toString()}
            onChangeText={(value) => setIconSize(parseInt(value) || 24)}
          />
        </YStack>
      </XStack>

      {/* Selected Icon Details */}
      {selectedIcon && (
        <View bg="$gray2" p="$4" rounded="$4" borderWidth={1} borderColor="$gray5">
          <XStack items="center" gap="$3">
            <View p="$2">
              {((): React.ReactNode => {
                const IconComponent = iconEntries.find(([name]) => name === selectedIcon)?.[1];
                return IconComponent ? <IconComponent size={32} color="#3b82f6" /> : null;
              })()}
            </View>
            <YStack>
              <Text variant="label" fontWeight="600">
                {selectedIcon}
              </Text>
              <Text variant="caption" color="$gray10">
                Import: {`import { ${selectedIcon} } from '@onflow/frw-icons'`}
              </Text>
              <Text variant="caption" color="$gray10">
                Usage: {`<${selectedIcon} size={${iconSize}} color="#374151" />`}
              </Text>
            </YStack>
          </XStack>
        </View>
      )}

      {/* Icon Categories */}
      {Object.entries(filteredCategories).map(([category, icons]) => (
        <YStack key={category} gap="$3">
          <Text variant="heading" fontSize={20}>
            {category} ({icons.length})
          </Text>

          <View bg="$background" rounded="$4" borderWidth={1} borderColor="$gray5" p="$4">
            <View
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '12px',
              }}
            >
              {icons.map(([iconName, IconComponent]) => (
                <YStack
                  key={iconName}
                  p="$4"
                  rounded="$3"
                  bg={selectedIcon === iconName ? '$blue3' : '$gray1'}
                  borderWidth={selectedIcon === iconName ? 1 : 0}
                  borderColor={selectedIcon === iconName ? '$blue7' : 'transparent'}
                  hoverStyle={{
                    bg: selectedIcon === iconName ? '$blue4' : '$gray2',
                  }}
                  pressStyle={{
                    bg: selectedIcon === iconName ? '$blue5' : '$gray3',
                  }}
                  style={{ cursor: 'pointer' }}
                  onPress={() => setSelectedIcon(iconName)}
                  minH={90}
                  items="center"
                  justify="center"
                  gap="$3"
                >
                  <View
                    items="center"
                    justify="center"
                    minH={Math.max(iconSize + 8, 32)}
                    minW={Math.max(iconSize + 8, 32)}
                  >
                    <IconComponent
                      size={iconSize}
                      color={selectedIcon === iconName ? '#3b82f6' : '#374151'}
                    />
                  </View>
                  <Text
                    variant="caption"
                    fontSize={10}
                    text="center"
                    color={selectedIcon === iconName ? '$blue11' : '$gray11'}
                    maxW={120}
                    numberOfLines={2}
                  >
                    {iconName}
                  </Text>
                </YStack>
              ))}
            </View>
          </View>
        </YStack>
      ))}

      {/* Usage Examples */}
      <YStack gap="$3">
        <Text variant="heading" fontSize={20}>
          Usage Examples
        </Text>

        <View bg="$gray1" rounded="$4" p="$4" borderWidth={1} borderColor="$gray5">
          <YStack gap="$3">
            <Text variant="label">Basic Usage</Text>
            <XStack gap="$2" items="center">
              <Icons.ArrowRight size={20} color="#374151" />
              <Text variant="body" fontSize={14}>
                {`<ArrowRight size={20} color="#374151" />`}
              </Text>
            </XStack>

            <Text variant="label">With Custom Color</Text>
            <XStack gap="$2" items="center">
              <Icons.CheckCircle size={20} color="#10b981" />
              <Text variant="body" fontSize={14}>
                {`<CheckCircle size={20} color="#10b981" />`}
              </Text>
            </XStack>

            <Text variant="label">With Click Handler</Text>
            <XStack gap="$2" items="center">
              <Icons.Copy size={20} color="#3b82f6" />
              <Text variant="body" fontSize={14}>
                {`<Copy size={20} color="#3b82f6" onClick={handleCopy} />`}
              </Text>
            </XStack>
          </YStack>
        </View>
      </YStack>
    </YStack>
  );
};

export const AllIcons: Story = {
  render: IconShowcase,
};

export const IconGrid: Story = {
  render: (): React.ReactElement => (
    <YStack gap="$4" p="$4">
      <Text variant="heading">All Icons (24px)</Text>
      <View
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '12px',
          padding: '8px',
        }}
      >
        {iconEntries.map(([iconName, IconComponent]) => (
          <YStack
            key={iconName}
            items="center"
            justify="center"
            gap="$2"
            p="$4"
            minH={80}
            bg="$gray1"
            rounded="$3"
            hoverStyle={{ bg: '$gray2' }}
          >
            <View items="center" justify="center" minH={32} minW={32}>
              <IconComponent size={24} color="#374151" />
            </View>
            <Text variant="caption" fontSize={9} text="center" numberOfLines={2} maxW={100}>
              {iconName}
            </Text>
          </YStack>
        ))}
      </View>
    </YStack>
  ),
};

export const IconSizes: Story = {
  render: (): React.ReactElement => {
    const sizes = [16, 20, 24, 32, 48, 64];
    return (
      <YStack gap="$4" p="$4">
        <Text variant="heading">Icon Sizes</Text>
        {sizes.map((size) => (
          <XStack key={size} items="center" gap="$4">
            <Text variant="body" minW={60}>
              {size}px:
            </Text>
            <XStack gap="$3" items="center">
              <Icons.ArrowRight size={size} color="#374151" />
              <Icons.CheckCircle size={size} color="#374151" />
              <Icons.Copy size={size} color="#374151" />
              <Icons.Edit size={size} color="#374151" />
              <Icons.Search size={size} color="#374151" />
            </XStack>
          </XStack>
        ))}
      </YStack>
    );
  },
};

export const IconThemes: Story = {
  render: (): React.ReactElement => {
    const colors = ['#374151', '#3b82f6', '#10b981', '#ef4444', '#f59e0b'];

    return (
      <YStack gap="$4" p="$4">
        <Text variant="heading">Icon Themes & Colors</Text>

        <YStack gap="$3">
          <Text variant="label" fontSize={16}>
            Theme
          </Text>
          <XStack gap="$4" items="center">
            {colors.map((color) => (
              <YStack key={color} items="center" gap="$2">
                <Icons.CheckCircle size={32} color={color} />
                <Text variant="caption" fontSize={8} text="center">
                  {color}
                </Text>
              </YStack>
            ))}
          </XStack>
        </YStack>

        <YStack gap="$3" mt="$4">
          <Text variant="label" fontSize={16}>
            Different Icons with Same Theme
          </Text>
          <XStack gap="$4" items="center">
            <Icons.ArrowRight size={32} color="#3b82f6" theme="outline" />
            <Icons.CheckCircle size={32} color="#10b981" theme="filled" />
            <Icons.Copy size={32} color="#f59e0b" theme="outline" />
            <Icons.Edit size={32} color="#ef4444" theme="outline" />
            <Icons.Search size={32} color="#8b5cf6" theme="outline" />
          </XStack>
        </YStack>
      </YStack>
    );
  },
};
