import * as React from 'react';
import Svg, { type SvgProps, Circle, Defs, G } from 'react-native-svg';
/* SVGR has dropped some elements not supported by react-native-svg: filter */
const TealCircleBlur = ({
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
    viewBox="0 0 376 603"
    {...props}
  >
    <G filter="url(#teal-circle-blur_svg__a)">
      <Circle
        cx={59.024}
        cy={277.253}
        r={125}
        fill="#139E8D"
        fillOpacity={0.4}
        transform="rotate(-15 59.024 277.253)"
      />
    </G>
    <Defs></Defs>
  </Svg>
);
export default TealCircleBlur;
