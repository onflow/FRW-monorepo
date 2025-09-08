import * as React from 'react';
import Svg, { type SvgProps, Path } from 'react-native-svg';
const Trash = ({
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
    viewBox="0 0 25 24"
    {...props}
  >
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3.625 6h2m0 0h16m-16 0v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6zm3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m-6 5v6m4-6v6"
    />
  </Svg>
);
export default Trash;
