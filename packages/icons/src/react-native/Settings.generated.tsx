import * as React from 'react';
import Svg, { type SvgProps, ClipPath, Defs, G, Path } from 'react-native-svg';
const Settings = ({
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
    <G
      stroke="#00EF8B"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.667}
      clipPath="url(#settings_svg__a)"
    >
      <Path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5" />
      <Path d="M16.166 12.5a1.375 1.375 0 0 0 .275 1.517l.05.05a1.667 1.667 0 1 1-2.358 2.358l-.05-.05a1.38 1.38 0 0 0-1.517-.275 1.38 1.38 0 0 0-.833 1.258v.142a1.667 1.667 0 1 1-3.333 0v-.075a1.375 1.375 0 0 0-.9-1.258 1.375 1.375 0 0 0-1.517.275l-.05.05a1.667 1.667 0 1 1-2.358-2.359l.05-.05a1.375 1.375 0 0 0 .275-1.516 1.37 1.37 0 0 0-1.259-.834H2.5a1.667 1.667 0 1 1 0-3.333h.075a1.375 1.375 0 0 0 1.258-.9 1.375 1.375 0 0 0-.275-1.517l-.05-.05a1.667 1.667 0 1 1 2.358-2.358l.05.05a1.375 1.375 0 0 0 1.517.275H7.5a1.38 1.38 0 0 0 .833-1.258V2.5a1.667 1.667 0 1 1 3.333 0v.075a1.38 1.38 0 0 0 .834 1.258 1.375 1.375 0 0 0 1.516-.275l.05-.05a1.666 1.666 0 0 1 2.72 1.818 1.7 1.7 0 0 1-.361.54l-.05.05a1.375 1.375 0 0 0-.275 1.517V7.5a1.38 1.38 0 0 0 1.258.833h.142a1.667 1.667 0 0 1 0 3.334h-.075a1.38 1.38 0 0 0-1.259.833" />
    </G>
    <Defs>
      <ClipPath id="settings_svg__a">
        <Path fill="#fff" d="M0 0h20v20H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default Settings;
