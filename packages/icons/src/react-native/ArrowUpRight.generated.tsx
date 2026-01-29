import * as React from 'react';
import Svg, { type SvgProps, Path } from 'react-native-svg';
const ArrowUpRight = ({
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
      strokeWidth={1.167}
      d="m7.012 12.787 5.775-5.775m0 0H7.012m5.775 0v5.775"
    />
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity={0.2}
      strokeWidth={1.167}
      d="m7.012 12.787 5.775-5.775m0 0H7.012m5.775 0v5.775M7.012 12.787l5.775-5.775m0 0H7.012m5.775 0v5.775M7.012 12.787l5.775-5.775m0 0H7.012m5.775 0v5.775M7.012 12.787l5.775-5.775m0 0H7.012m5.775 0v5.775M7.012 12.787l5.775-5.775m0 0H7.012m5.775 0v5.775"
    />
  </Svg>
);
export default ArrowUpRight;
