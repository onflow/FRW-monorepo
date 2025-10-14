import * as React from 'react';
import Svg, { type SvgProps, Path, Rect } from 'react-native-svg';
const SurgeActive = ({
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
    viewBox="0 0 48 48"
    {...props}
  >
    <Rect width={47.752} height={47.752} fill={color} rx={23.876} />
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.653}
      d="M34.93 23.353h-4.422L27.192 33.3 20.56 13.404l-3.316 9.949h-4.422"
    />
  </Svg>
);
export default SurgeActive;
