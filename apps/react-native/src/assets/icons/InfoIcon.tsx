import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
const SvgInfoIcon = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 15 14"
    {...props}
  >
    <Path
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity={0.4}
      strokeWidth={1.167}
      d="M7.75 9.569v-2.5m0-2.5h.006M14 7.069a6.25 6.25 0 1 1-12.5 0 6.25 6.25 0 0 1 12.5 0"
    />
  </Svg>
);
export default SvgInfoIcon;
