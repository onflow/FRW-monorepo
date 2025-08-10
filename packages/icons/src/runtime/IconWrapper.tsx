import React, { type SVGProps } from 'react';

export interface IconWrapperProps extends SVGProps<SVGSVGElement> {
  children?: React.ReactNode;
  size?: number | string;
  color?: string;
  theme?: 'outline' | 'filled' | 'dual-tone';
}

/**
 * Universal Icon wrapper that handles color theming at runtime
 * Based on IconPark's approach but simplified for our use case
 */
export const IconWrapper: React.FC<IconWrapperProps> = ({
  children,
  size = 24,
  color = 'currentColor',
  theme,
  width,
  height,
  style,
  ...props
}) => {
  // Use provided width/height or fall back to size
  const finalWidth = width ?? size;
  const finalHeight = height ?? size;

  // Auto-detect icon type if theme is not provided
  const detectTheme = (): 'outline' | 'filled' | 'dual-tone' | 'multicolor' => {
    if (theme) return theme as 'outline' | 'filled' | 'dual-tone';

    // Check children to detect if it's outline, filled, or multicolor
    let hasStroke = false;
    let hasFill = false;
    const colorCount = new Set<string>();

    const checkColors = (element: React.ReactElement): { hasSpecialEffects: boolean } => {
      let hasSpecialEffects = false;

      if (element.props.stroke && element.props.stroke !== 'none') {
        hasStroke = true;
        colorCount.add(element.props.stroke);
      }
      if (element.props.fill && element.props.fill !== 'none') {
        hasFill = true;
        colorCount.add(element.props.fill);
        // Check for special effects
        if (element.props.fill.startsWith('url(')) {
          hasSpecialEffects = true; // Gradients, patterns
        }
      }

      // Check for opacity effects
      if (element.props.opacity && parseFloat(element.props.opacity) < 1) {
        hasSpecialEffects = true;
      }

      // Recursively check nested elements
      React.Children.forEach(element.props.children, (child) => {
        if (React.isValidElement(child)) {
          const nested = checkColors(child);
          if (nested.hasSpecialEffects) {
            hasSpecialEffects = true;
          }
        }
      });

      return { hasSpecialEffects };
    };

    let hasAnySpecialEffects = false;

    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child)) {
        const result = checkColors(child);
        if (result.hasSpecialEffects) {
          hasAnySpecialEffects = true;
        }
      }
    });

    // If it has special effects (gradients, opacity), preserve original colors
    if (hasAnySpecialEffects) return 'multicolor';
    // If it has multiple colors (3 or more), it's multicolor - preserve original colors
    if (colorCount.size >= 3) return 'multicolor';
    // If it has both stroke and fill, it's dual-tone
    if (hasStroke && hasFill) return 'dual-tone';
    // If it only has stroke, it's outline
    if (hasStroke && !hasFill) return 'outline';
    // If it only has fill, it's filled
    if (hasFill && !hasStroke) return 'filled';

    // Default to outline for safety
    return 'outline';
  };

  const finalTheme = detectTheme();

  // Process children to replace colors based on theme
  const processedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      // Clone the child and modify its props based on theme
      const newProps = { ...child.props } as React.SVGProps<SVGElement>;

      // Apply color theming
      switch (finalTheme) {
        case 'outline':
          // For outline icons, always set stroke to color and fill to none
          newProps.stroke = color;
          newProps.fill = 'none';
          break;

        case 'filled':
          // For filled icons, always set fill to color and remove stroke
          newProps.fill = color;
          newProps.stroke = 'none';
          break;

        case 'dual-tone':
          // For dual-tone, keep original colors but allow override for stroke
          if (child.props.stroke) {
            newProps.stroke = color;
          }
          // Keep original fill colors for dual-tone effect
          break;

        case 'multicolor':
          // For multicolor icons (like logos), preserve original colors completely
          // Don't modify any colors to maintain the original design
          break;
      }

      // Remove opacity attributes that might interfere with color control
      delete newProps.strokeOpacity;
      delete newProps.fillOpacity;
      delete newProps.opacity;

      // Recursively process nested children
      if (newProps.children) {
        newProps.children = React.Children.map(newProps.children, (nestedChild) => {
          if (React.isValidElement(nestedChild)) {
            const nestedProps = { ...nestedChild.props } as React.SVGProps<SVGElement>;

            // Apply the same color theming to nested elements
            switch (finalTheme) {
              case 'outline':
                nestedProps.stroke = color;
                nestedProps.fill = 'none';
                break;
              case 'filled':
                nestedProps.fill = color;
                nestedProps.stroke = 'none';
                break;
              case 'dual-tone':
                if (nestedChild.props.stroke) {
                  nestedProps.stroke = color;
                }
                break;
              case 'multicolor':
                // Preserve original colors for multicolor icons
                break;
            }

            // Remove opacity attributes
            delete nestedProps.strokeOpacity;
            delete nestedProps.fillOpacity;
            delete nestedProps.opacity;

            return React.cloneElement(nestedChild, nestedProps);
          }
          return nestedChild;
        });
      }

      return React.cloneElement(child, newProps);
    }
    return child;
  });

  return (
    <svg
      width={finalWidth}
      height={finalHeight}
      fill="none"
      style={{
        ...style,
        color,
      }}
      {...props}
    >
      {processedChildren}
    </svg>
  );
};
