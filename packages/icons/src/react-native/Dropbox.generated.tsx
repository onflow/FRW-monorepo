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
    viewBox="0 0 30 29"
    {...props}
  >
    <Path
      fill={color}
      fillRule="evenodd"
      d="M30 5.885 21.175 0 15 5.265l8.898 5.61zM15.018 17.62l-6.193 5.25-2.65-1.768v1.981l8.843 5.417 8.843-5.417v-1.981l-2.65 1.768zM8.825 0 0 5.885l6.102 4.99L15 5.266zM15 16.488l-6.175 5.264L0 15.867l6.102-4.99zl8.898-5.611L30 15.867l-8.825 5.885z"
      clipRule="evenodd"
    />
  </Svg>
);
export default Dropbox;
