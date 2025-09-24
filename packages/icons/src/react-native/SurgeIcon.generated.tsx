import * as React from 'react';
import Svg, { type SvgProps, Path } from 'react-native-svg';
const SurgeIcon = ({
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
    viewBox="0 0 22 21"
    {...props}
  >
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 10.5h-4l-3 9-6-18-3 9H1"
    />
  </Svg>
);
export default SurgeIcon;
