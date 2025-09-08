import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Animated, type LayoutChangeEvent } from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { Text } from 'ui';

interface SlidingTabsProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const SlidingTabs: React.FC<SlidingTabsProps> = ({ tabs, activeTab, onTabChange }) => {
  const { isDark } = useTheme();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const tabPositions = useRef<{ x: number; width: number }[]>([]).current;

  const activeIndex = tabs.indexOf(activeTab);

  useEffect(() => {
    if (tabPositions.length === tabs.length && activeIndex >= 0) {
      const activeTab = tabPositions[activeIndex];
      if (activeTab) {
        Animated.timing(slideAnim, {
          toValue: activeTab.x,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    }
  }, [activeIndex, tabPositions, slideAnim]);

  const handleTabLayout = (index: number, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    tabPositions[index] = { x, width };
  };

  const getActiveTabWidth = () => {
    return activeIndex >= 0 && tabPositions[activeIndex] ? tabPositions[activeIndex].width : 0;
  };

  return (
    <View
      className="flex-row items-center justify-between rounded-full"
      style={{
        borderColor: isDark ? '#292929' : '#E5E5E5',
        borderWidth: 2, // Explicit 2px border as per Figma
        backgroundColor: 'transparent', // No background specified in Figma
        borderRadius: 200, // Fully rounded from Figma
        paddingHorizontal: 6, // 6px horizontal padding from Figma
        paddingVertical: 5, // 5px vertical padding from Figma
      }}
    >
      {/* Sliding background indicator */}
      <Animated.View
        className="absolute rounded-3xl"
        style={{
          left: 8, // Account for border (2px) + padding (6px)
          top: 7, // Account for border (2px) + padding (5px)
          height: 33, // From Figma spec
          width: getActiveTabWidth(),
          backgroundColor: isDark ? '#242424' : '#FFFFFF',
          borderRadius: 24, // From Figma spec
          transform: [{ translateX: slideAnim }],
          shadowColor: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 1,
          shadowRadius: 2,
          elevation: 2,
        }}
      />

      {/* Tab buttons */}
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab;

        return (
          <TouchableOpacity
            key={tab}
            className="items-center justify-center px-1.5 py-1"
            style={{
              height: 33, // From Figma spec
              minWidth: 64, // Ensure minimum width
              zIndex: 1, // Ensure tabs are above the sliding background
            }}
            onPress={() => onTabChange(tab)}
            onLayout={event => handleTabLayout(index, event)}
          >
            <Text
              className="font-semibold"
              style={{
                fontSize: 16, // Updated to match Figma spec
                lineHeight: 24, // 1.5 * 16 = 24
                letterSpacing: -0.096, // -0.6% of 16px
                color: isActive
                  ? isDark
                    ? 'rgba(255, 255, 255, 0.8)'
                    : '#000000' // Active tab color from Figma
                  : isDark
                    ? '#FFFFFF'
                    : 'rgba(0, 0, 0, 0.6)', // Inactive tab color
                textAlign: 'center',
                fontWeight: '600',
              }}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
