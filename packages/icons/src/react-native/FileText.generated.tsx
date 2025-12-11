import * as React from 'react';
import Svg, { type SvgProps, Path } from 'react-native-svg';
const FileText = ({
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
      d="M16.334 2.334H7a2.333 2.333 0 0 0-2.333 2.333v18.667A2.333 2.333 0 0 0 7 25.667h14a2.333 2.333 0 0 0 2.334-2.333v-14m-7-7 7 7m-7-7v7h7m-4.667 5.833H9.334m9.333 4.667H9.334m2.333-9.333H9.334"
    />
  </Svg>
);
export default FileText;
