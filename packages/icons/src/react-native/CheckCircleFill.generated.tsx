import * as React from 'react';
import Svg, { type SvgProps, Path } from 'react-native-svg';
const CheckCircleFill = ({
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
    viewBox="0 0 25 25"
    {...props}
  >
    <Path
      fill={color}
      d="M12.944 2.75a9.75 9.75 0 1 0 9.75 9.75 9.76 9.76 0 0 0-9.75-9.75m4.281 8.03-5.25 5.25a.75.75 0 0 1-1.061 0l-2.25-2.25a.75.75 0 1 1 1.061-1.06l1.72 1.72 4.719-4.72a.75.75 0 0 1 1.061 1.06"
    />
  </Svg>
);
export default CheckCircleFill;
