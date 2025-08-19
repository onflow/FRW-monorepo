import * as React from 'react';
import Svg, { type SvgProps, Path } from 'react-native-svg';
const Download = ({
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
    viewBox="0 0 30 29"
    {...props}
  >
    <Path
      fill={color}
      fillOpacity={0.8}
      d="M5.347 10.09h3.62a3.51 3.51 0 0 0 6.8 0h8.885a.877.877 0 1 0 0-1.754h-8.885a3.51 3.51 0 0 0-6.8 0h-3.62a.877.877 0 1 0 0 1.755m7.02-2.632a1.755 1.755 0 1 1 0 3.511 1.755 1.755 0 0 1 0-3.51m12.285 11.408h-1.864a3.51 3.51 0 0 0-6.801 0H5.347a.877.877 0 1 0 0 1.755h10.64a3.51 3.51 0 0 0 6.8 0h1.865a.878.878 0 1 0 0-1.755m-5.265 2.632a1.755 1.755 0 1 1 0-3.51 1.755 1.755 0 0 1 0 3.51"
    />
  </Svg>
);
export default Download;
