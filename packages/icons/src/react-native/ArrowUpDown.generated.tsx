import * as React from 'react';
import Svg, { type SvgProps, Path } from 'react-native-svg';
const ArrowUpDown = ({
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
      d="M14.407 15.833h-9.23a.84.84 0 0 1-.84-.84v-9.23a.84.84 0 1 1 1.68 0v7.201l8.381-8.38a.84.84 0 0 1 1.189 1.188l-8.38 8.38h7.2a.84.84 0 1 1 0 1.681"
      clipRule="evenodd"
    />
  </Svg>
);
export default ArrowUpDown;
