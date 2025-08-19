import * as React from 'react';
import Svg, { type SvgProps, Path } from 'react-native-svg';
const Coins = ({
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
    viewBox="0 0 16 16"
    {...props}
  >
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity={0.4}
      strokeWidth={1.333}
      d="M6 9.333c0 1.105 1.79 2 4 2s4-.895 4-2m-8 0c0-1.104 1.79-2 4-2s4 .896 4 2m-8 0V12c0 1.104 1.79 2 4 2s4-.896 4-2V9.333M2 4c0 .715.763 1.375 2 1.732s2.763.357 4 0S10 4.715 10 4s-.763-1.375-2-1.732-2.763-.357-4 0S2 3.285 2 4m0 0v6.667c0 .592.515.966 1.333 1.333M2 7.333c0 .592.515.967 1.333 1.334"
    />
  </Svg>
);
export default Coins;
