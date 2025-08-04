import * as React from 'react';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
const SvgConfirmDialogBg = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 376 729"
    {...props}
  >
    <Circle
      cx={187.696}
      cy={364.089}
      r={364.044}
      fill="url(#confirm_dialog_bg_svg__a)"
      opacity={0.1}
    />
    <Defs>
      <RadialGradient
        id="confirm_dialog_bg_svg__a"
        cx={0}
        cy={0}
        r={1}
        gradientTransform="rotate(90 -88.197 275.893)scale(199.125)"
        gradientUnits="userSpaceOnUse"
      >
        <Stop offset={0.255} stopColor="#00EF8B" />
        <Stop offset={1} stopColor="#00EF8B" stopOpacity={0} />
      </RadialGradient>
    </Defs>
  </Svg>
);
export default SvgConfirmDialogBg;
