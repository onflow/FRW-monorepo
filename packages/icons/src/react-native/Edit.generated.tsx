import * as React from 'react';
import Svg, { type SvgProps, Path } from 'react-native-svg';
const Edit = ({
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
    viewBox="0 0 25 25"
    {...props}
  >
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12.444 20.23h9m-4.5-16.5a2.121 2.121 0 0 1 3 3l-12.5 12.5-4 1 1-4z"
    />
  </Svg>
);
export default Edit;
