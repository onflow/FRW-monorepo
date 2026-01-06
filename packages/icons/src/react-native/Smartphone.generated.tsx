import * as React from 'react';
import Svg, { type SvgProps, Path } from 'react-native-svg';
const Smartphone = ({
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
    viewBox="0 0 28 28"
    {...props}
  >
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M14 21h.011M8.166 2.335h11.667a2.333 2.333 0 0 1 2.333 2.333v18.667a2.333 2.333 0 0 1-2.333 2.333H8.166a2.333 2.333 0 0 1-2.333-2.333V4.667a2.333 2.333 0 0 1 2.333-2.333"
    />
  </Svg>
);
export default Smartphone;
