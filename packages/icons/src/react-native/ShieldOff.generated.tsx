import * as React from 'react';
import Svg, { type SvgProps, ClipPath, Defs, G, Path } from 'react-native-svg';
const ShieldOff = ({
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
    viewBox="0 0 19 19"
    {...props}
  >
    <G clipPath="url(#shield-off_svg__a)">
      <Path
        stroke="#F04438"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15.231 11.008a5.3 5.3 0 0 0 .239-1.54V4.081L9.313 1.773l-2.432.908M3.718 3.873l-.562.208v5.387c0 4.618 6.157 7.696 6.157 7.696 1.63-.86 3.094-2 4.325-3.37M.848 1.002l16.93 16.93"
      />
    </G>
    <Defs>
      <ClipPath id="shield-off_svg__a">
        <Path fill="#fff" d="M.078.233h18.47v18.47H.078z" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default ShieldOff;
