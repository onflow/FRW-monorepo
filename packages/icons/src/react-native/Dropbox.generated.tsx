import * as React from 'react';
import Svg, { type SvgProps, Path } from 'react-native-svg';
const Dropbox = ({
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
    viewBox="0 0 32 32"
    {...props}
  >
    <Path
      fill={color}
      d="M9.437 1.12 0 7.2l6.533 5.263L16 6.626m-16 11 9.437 6.2L16 18.321l-9.467-5.868M16 18.321l6.594 5.505L32 17.686l-6.503-5.233M32 7.25l-9.406-6.14L16 6.615l9.497 5.838M16.03 19.5l-6.594 5.474-2.843-1.845v2.087l9.437 5.656 9.437-5.656v-2.087l-2.843 1.845"
    />
  </Svg>
);
export default Dropbox;
