import * as React from 'react';
import Svg, { type SvgProps, Path } from 'react-native-svg';
const ArrowBack = ({
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
    viewBox="0 0 25 24"
    {...props}
  >
    <Path
      fill={color}
      fillOpacity={0.8}
      d="M19.086 10.95H7.85l4.909-5.144a1.1 1.1 0 0 0 0-1.498.97.97 0 0 0-1.418 0l-6.629 6.949a1.086 1.086 0 0 0 0 1.486l6.629 6.949a.97.97 0 0 0 1.418 0 1.086 1.086 0 0 0 0-1.487L7.85 13.06h11.236c.553 0 1.005-.475 1.005-1.055s-.452-1.054-1.005-1.054"
    />
  </Svg>
);
export default ArrowBack;
