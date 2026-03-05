import * as React from 'react';
import Svg, { type SvgProps, Path } from 'react-native-svg';
const ArrowDownWideNarrow = ({
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
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity={0.5}
      strokeWidth={2}
      d="m3 16 4 4m0 0 4-4m-4 4V4m4 0h10M11 8h7m-7 4h4"
    />
  </Svg>
);
export default ArrowDownWideNarrow;
