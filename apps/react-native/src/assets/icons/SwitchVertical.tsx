import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
const SvgSwitchVertical = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 12 12"
    {...props}
  >
    <Path
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity={0.4}
      strokeWidth={0.947}
      d="M3.576 9.518V1.942m0 0L5.47 3.836M3.576 1.942 1.682 3.836m6.63-1.894v7.576m0 0 1.893-1.894M8.311 9.518 6.417 7.624"
    />
  </Svg>
);
export default SvgSwitchVertical;
