import * as React from 'react';
import Svg, { type SvgProps, Path } from 'react-native-svg';
const ArrowRightLeft = ({
  color = 'currentColor',
  size = 24,
  width,
  height,
  ...props
}: SvgProps & { size?: number }) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={width ?? size}
    height={height ?? size}
    fill="none"
    viewBox="0 0 20 20"
    {...props}
  >
    <Path
      fill={color}
      fillRule="evenodd"
      d="M5.79 7.5h10.877a.833.833 0 0 1 0 1.667H3.333a.833.833 0 0 1-.449-1.536.9.9 0 0 1 .196-.23l4.595-3.855a.909.909 0 1 1 1.168 1.392zM14.21 12.5H3.333a.833.833 0 0 1 0-1.667h13.334a.833.833 0 0 1 .449 1.536.9.9 0 0 1-.196.23l-4.595 3.855a.909.909 0 1 1-1.168-1.392z"
      clipRule="evenodd"
    />
  </Svg>
);
export default ArrowRightLeft;
