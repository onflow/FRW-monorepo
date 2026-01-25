import * as React from 'react';
import Svg, { type SvgProps, Path } from 'react-native-svg';
const ArrowRight = ({
  color = '#000',
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
    viewBox="0 0 24 24"
    {...props}
  >
    <Path
      d="m12 5 7 7-7 7M5 12h14"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default ArrowRight;
