import React from 'react';
import { View, XStack } from 'tamagui';

export interface LoadingIndicatorProps {
  /** Whether animation is active */
  isAnimating?: boolean;
  /** Width of the indicator */
  width?: number;
  /** Height of the indicator */
  height?: number;
  /** Number of dots */
  count?: number;
  /** Size of each dot */
  dotSize?: number;
  /** Gap between dots */
  gap?: number;
}

/**
 * LoadingIndicator - Animated dots showing loading/progress state
 * Used in ConfirmationDrawer, TransactionConfirmationModal, and MigrationProgressIndicator
 */
export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  isAnimating = false,
  width = 117,
  height = 8,
  count = 6,
  dotSize = 8,
  gap = 17.8,
}) => {
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    if (!isAnimating) {
      setActiveIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % count);
    }, 200);

    return () => clearInterval(interval);
  }, [isAnimating, count]);

  const getDotStyle = (index: number) => {
    if (!isAnimating) {
      const opacities = [0.1, 0.2, 0.3, 1, 1, 1];
      const colors = ['#00EF8B', '#00EF8B', '#00EF8B', '#009154', '#00EF8B', '#00EF8B'];
      return {
        bg: colors[index] || '#00EF8B',
        opacity: opacities[index] || 0.2,
      };
    }

    if (index === activeIndex) {
      return {
        bg: '#00EF8B',
        opacity: 1,
      };
    } else if (index === (activeIndex - 1 + count) % count) {
      return {
        bg: '#00EF8B',
        opacity: 0.6,
      };
    } else {
      return {
        bg: '#00EF8B',
        opacity: 0.2,
      };
    }
  };

  return (
    <View items="center" justify="center">
      <XStack
        width={width}
        height={height}
        flexDirection="row"
        items="center"
        justify="center"
        gap={gap}
      >
        {Array.from({ length: count }, (_, index) => {
          const style = getDotStyle(index);
          return (
            <View
              key={index}
              width={dotSize}
              height={dotSize}
              rounded={dotSize / 2}
              bg={style.bg as any}
              opacity={style.opacity}
            />
          );
        })}
      </XStack>
    </View>
  );
};
