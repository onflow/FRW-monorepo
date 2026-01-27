import * as React from 'react';
import Svg, { type SvgProps, Path } from 'react-native-svg';
const Lock = ({
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
    viewBox="0 0 20 20"
    {...props}
  >
    <Circle cx={22.848} cy={22.773} r={22.218} fill="#00EF8B" />
    <Path
      fill="#fff"
      fillRule="evenodd"
      d="M23.012 11.986a7.256 7.256 0 0 1 7.13 7.264 3 3 0 0 1 2.772 2.99v8.322a3 3 0 0 1-2.998 2.998H15.779a3 3 0 0 1-2.999-2.998v-8.323a3 3 0 0 1 2.851-2.994 7.253 7.253 0 0 1 7.381-7.259m-.032 1.875a5.38 5.38 0 0 0-5.474 5.38h10.762a5.38 5.38 0 0 0-5.288-5.38"
      clipRule="evenodd"
    />
  </Svg>
);
export default Lock;
