import * as React from 'react';
import Svg, { type SvgProps, Path } from 'react-native-svg';
const Warning = ({
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
    viewBox="0 0 24 25"
    {...props}
  >
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity={0.5}
      strokeWidth={1.6}
      d="M12 8.75v4m0 4h.01M10.29 3.61 1.82 17.75a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.61a2 2 0 0 0-3.42 0"
    />
  </Svg>
);
export default Warning;
