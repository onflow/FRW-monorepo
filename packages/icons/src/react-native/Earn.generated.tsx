import * as React from 'react';
import Svg, { type SvgProps, Circle, Path } from 'react-native-svg';
const Earn = ({
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
    viewBox="0 0 36 36"
    {...props}
  >
    <Circle cx={18} cy={18} r={18} fill="#00EF8B" transform="rotate(-180 18 18)" />
    <Path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="m26.219 11.683-7.968 8.084-2.969-2.969-6.015 5.9"
    />
    <Path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M26.219 19.394v-7.711h-7.712"
    />
  </Svg>
);
export default Earn;
