import * as React from 'react';
import Svg, { type SvgProps, Path } from 'react-native-svg';
const Zap = ({
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
      d="m10.833 1.667-8.333 10H10l-.833 6.666 8.333-10H10z"
    />
  </Svg>
);
export default Zap;
