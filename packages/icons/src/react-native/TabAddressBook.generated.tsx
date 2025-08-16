import * as React from 'react';
import Svg, { type SvgProps, Path } from 'react-native-svg';
const TabAddressBook = ({
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
      strokeOpacity={0.502}
      strokeWidth={2}
      d="M4.5 9h16m-16 6h16m-10-12-2 18m8-18-2 18"
    />
  </Svg>
);
export default TabAddressBook;
