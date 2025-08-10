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
  const detectTheme = (): 'outline' | 'filled' | 'dual-tone' => {
    if (theme) return theme;

    // Check children to detect if it's outline or filled
    let hasStroke = false;
    let hasFill = false;

    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child)) {
        if (child.props.stroke && child.props.stroke !== 'none') {
          hasStroke = true;
        }
        if (child.props.fill && child.props.fill !== 'none') {
          hasFill = true;
        }
      }
    });

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
          // For outline icons, set stroke to color and fill to transparent
          if (child.props.stroke) {
            newProps.stroke = color;
          }
          if (child.props.fill && child.props.fill !== 'none') {
            newProps.fill = 'none';
          }
          break;

        case 'filled':
          // For filled icons, set fill to color
          if (child.props.fill) {
            newProps.fill = color;
          }
          if (child.props.stroke) {
            newProps.stroke = color;
          }
          break;

        case 'dual-tone':
          // For dual-tone, keep original colors but allow override for stroke
          if (child.props.stroke) {
            newProps.stroke = color;
          }
          // Keep original fill colors for dual-tone effect
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
                if (nestedChild.props.stroke) {
                  nestedProps.stroke = color;
                }
                if (nestedChild.props.fill && nestedChild.props.fill !== 'none') {
                  nestedProps.fill = 'none';
                }
                break;
              case 'filled':
                if (nestedChild.props.fill) {
                  nestedProps.fill = color;
                }
                if (nestedChild.props.stroke) {
                  nestedProps.stroke = color;
                }
                break;
              case 'dual-tone':
                if (nestedChild.props.stroke) {
                  nestedProps.stroke = color;
                }
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
