import * as React from 'react';
import Svg, { type SvgProps, Path } from 'react-native-svg';
const Key = ({
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
    viewBox="0 0 28 28"
    {...props}
  >
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="m18.084 8.75 4.083-4.083M24.5 2.334l-2.333 2.333zM13.29 13.546a6.416 6.416 0 1 1-9.075 9.074 6.417 6.417 0 0 1 9.074-9.073zm0 0 4.795-4.795zm4.795-4.795 3.5 3.5 4.083-4.084-3.5-3.5z"
    />
  </Svg>
);
export default Key;
