import * as React from 'react';
import Svg, { type SvgProps, Path } from 'react-native-svg';
const CloseIcon = ({
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
    viewBox="0 0 11 10"
    {...props}
  >
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity={0.8}
      strokeWidth={1.333}
      d="m9.5 1-8 8m0-8 8 8"
    />
  </Svg>
);
export default CloseIcon;
