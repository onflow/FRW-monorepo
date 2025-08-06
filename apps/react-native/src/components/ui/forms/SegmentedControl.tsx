import React from 'react';
import { Pressable, View } from 'react-native';

import { Text } from 'ui';

interface SegmentedControlProps {
  segments: string[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  segmentClassName?: string;
  textClassName?: string;
  activeSegmentClassName?: string;
  activeTextClassName?: string;
  fullWidth?: boolean;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({
  segments,
  value,
  onChange,
  className = '',
  segmentClassName = '',
  textClassName = '',
  activeSegmentClassName = '',
  activeTextClassName = '',
  fullWidth = false,
}) => {
  return (
    <View className={`${fullWidth ? 'w-full' : 'self-start max-w-full'} ${className}`}>
      <View className="flex-row rounded-full border-2 border-input-bg dark:border-input-bg-dark p-1">
        {segments.map((segment, _idx) => {
          const isActive = value === segment;

          const pressableClasses = [
            `rounded-full px-4 py-2 items-center justify-center min-h-8${
              fullWidth ? ' flex-1' : ''
            }`,
            segmentClassName,
            isActive ? 'bg-white/10' : '',
            isActive ? activeSegmentClassName : '',
          ]
            .filter(Boolean)
            .join(' ');

          const textClasses = [
            'text-base font-medium text-center',
            textClassName,
            'text-fg-1',
            isActive ? activeTextClassName : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <Pressable
              key={segment}
              className={pressableClasses}
              onPress={() => onChange(segment)}
              android_ripple={undefined}
            >
              <Text
                className={textClasses}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
                minimumFontScale={0.8}
              >
                {segment}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default SegmentedControl;
