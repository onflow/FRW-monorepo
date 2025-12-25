import * as React from 'react';
import Svg, { type SvgProps, Path } from 'react-native-svg';
const Shield = ({
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
    viewBox="0 0 28 27"
    {...props}
  >
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.653}
      d="M13.875 24.555s8.843-4.422 8.843-11.054V5.763l-8.843-3.316-8.843 3.316v7.738c0 6.632 8.843 11.054 8.843 11.054"
    />
  </Svg>
);
export default Shield;
