import * as React from 'react';
import Svg, { type SvgProps, Path } from 'react-native-svg';
const RevealPhrase = ({
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
    viewBox="0 0 21 21"
    {...props}
  >
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity={0.5}
      strokeWidth={1.667}
      d="M6.294 9.935V6.6a4.167 4.167 0 0 1 8.334 0v3.334m-10 0h11.666c.92 0 1.667.746 1.667 1.666v5.834c0 .92-.746 1.666-1.667 1.666H4.628c-.92 0-1.667-.746-1.667-1.666V11.6c0-.92.746-1.666 1.667-1.666"
    />
  </Svg>
);
export default RevealPhrase;
