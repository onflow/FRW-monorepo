import * as React from 'react';
import Svg, { type SvgProps, Path } from 'react-native-svg';
const ArrowDownLeft = ({
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
      d="m12.787 7.012-5.775 5.775m0 0h5.775m-5.775 0V7.012"
    />
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity={0.2}
      strokeWidth={1.167}
      d="m12.787 7.012-5.775 5.775m0 0h5.775m-5.775 0V7.012M12.787 7.012l-5.775 5.775m0 0h5.775m-5.775 0V7.012M12.787 7.012l-5.775 5.775m0 0h5.775m-5.775 0V7.012M12.787 7.012l-5.775 5.775m0 0h5.775m-5.775 0V7.012M12.787 7.012l-5.775 5.775m0 0h5.775m-5.775 0V7.012"
    />
  </Svg>
);
export default ArrowDownLeft;
