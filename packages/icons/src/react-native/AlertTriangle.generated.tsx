import * as React from 'react';
import Svg, { type SvgProps, Path } from 'react-native-svg';
const AlertTriangle = ({
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
    viewBox="0 0 32 32"
    {...props}
  >
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 10.667V16m0 5.333h.013M13.72 3.813 2.426 22.667a2.667 2.667 0 0 0 2.28 4h22.587a2.667 2.667 0 0 0 2.28-4L18.28 3.813a2.666 2.666 0 0 0-4.56 0"
    />
  </Svg>
);
export default AlertTriangle;
