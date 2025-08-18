import * as React from 'react';
import Svg, { type SvgProps, Path } from 'react-native-svg';
const ArrowDown = ({
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
    viewBox="0 0 25 25"
    {...props}
  >
    <Path
      fill={color}
      fillOpacity={0.8}
      d="M11.895 5.338v11.336L6.75 11.72a1.093 1.093 0 0 0-1.497 0 .984.984 0 0 0 0 1.431L12.2 19.84a1.08 1.08 0 0 0 1.487 0l6.948-6.688a.984.984 0 0 0 0-1.43 1.08 1.08 0 0 0-1.487 0l-5.145 4.952V5.338c0-.558-.474-1.015-1.054-1.015s-1.055.457-1.055 1.015"
    />
  </Svg>
);
export default ArrowDown;
