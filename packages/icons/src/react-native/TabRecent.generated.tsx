import * as React from 'react';
import Svg, { type SvgProps, Path } from 'react-native-svg';
const TabRecent = ({
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
    viewBox="0 0 22 23"
    {...props}
  >
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity={0.502}
      strokeWidth={2}
      d="M11 5.5v6l4 2m6-2c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10 10 4.477 10 10"
    />
  </Svg>
);
export default TabRecent;
