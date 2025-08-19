import * as React from 'react';
import Svg, { type SvgProps, Path } from 'react-native-svg';
const Send = ({
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
      strokeWidth={1.5}
      d="m10.113 5.906-3.18 3.26a.75.75 0 0 1-.893.134L2.2 7.2a.744.744 0 0 1 .1-1.354L13.173 1.88c.594-.214 1.174.36.96.953l-3.873 10.84a.747.747 0 0 1-1.34.14l-1.447-2.367"
    />
  </Svg>
);
export default Send;
