import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
const SvgLink = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 14 13"
    {...props}
  >
    <G clipPath="url(#link_svg__a)">
      <Path
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity={0.502}
        strokeWidth={1.6}
        d="M5.833 7.033a2.667 2.667 0 0 0 4.022.288l1.6-1.6a2.667 2.667 0 0 0-3.771-3.77l-.917.912m1.2 3.104a2.667 2.667 0 0 0-4.022-.288l-1.6 1.6a2.667 2.667 0 0 0 3.77 3.77l.913-.912"
      />
    </G>
    <Defs>
      <ClipPath id="link_svg__a">
        <Path fill="#fff" d="M.5.1h12.8v12.8H.5z" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default SvgLink;
