import * as React from 'react';
import Svg, { type SvgProps, Path } from 'react-native-svg';
const ChevronDown = ({
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
    viewBox="0 0 15 15"
    {...props}
  >
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={0.972}
      d="m3.944 5.88 3.5 3.5 3.5-3.5"
    />
  </Svg>
);
export default ChevronDown;
