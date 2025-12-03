import * as React from 'react';
import Svg, { type SvgProps, Path } from 'react-native-svg';
const Pocket = ({
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
      d="M9.333 11.667 14 16.333l4.666-4.666m-14-8.167h18.667a2.333 2.333 0 0 1 2.333 2.333v7a11.667 11.667 0 1 1-23.333 0v-7A2.333 2.333 0 0 1 4.666 3.5"
    />
  </Svg>
);
export default Pocket;
