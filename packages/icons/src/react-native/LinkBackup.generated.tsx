import * as React from 'react';
import Svg, { type SvgProps, Path } from 'react-native-svg';
const LinkBackup = ({
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
    viewBox="0 0 20 20"
    {...props}
  >
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.667}
      d="M8.333 10.833a4.165 4.165 0 0 0 6.283.45l2.5-2.5a4.167 4.167 0 0 0-5.892-5.891L9.791 4.317m1.875 4.85a4.167 4.167 0 0 0-6.283-.45l-2.5 2.5a4.166 4.166 0 0 0 5.891 5.891l1.425-1.425"
    />
  </Svg>
);
export default LinkBackup;
