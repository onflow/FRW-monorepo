import * as React from 'react';
import Svg, { type SvgProps, Path } from 'react-native-svg';
const WifiOff = ({
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
    viewBox="0 0 32 32"
    {...props}
  >
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.667}
      d="M16 26.667h.013m-4.68-4.762a6.667 6.667 0 0 1 9.334 0m-14-4.76a13.33 13.33 0 0 1 6.893-3.586m11.773 3.586a13.3 13.3 0 0 0-2.676-2.03M2.667 11.76a20 20 0 0 1 5.569-3.524m21.097 3.524a20 20 0 0 0-15.05-5.019M2.667 2.667l26.666 26.666"
    />
  </Svg>
);
export default WifiOff;
