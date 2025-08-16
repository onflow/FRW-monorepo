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
    viewBox="0 0 16 15"
    {...props}
  >
    <Path
      fill={color}
      d="M15.133 13.719a.75.75 0 1 1-1.061 1.061l-6.22-6.22-6.219 6.22A.75.75 0 0 1 .572 13.72l6.22-6.22L.572 1.28A.75.75 0 0 1 1.633.22l6.22 6.22L14.071.22a.75.75 0 0 1 1.061 1.061L8.913 7.5z"
    />
  </Svg>
);
export default CloseIcon;
