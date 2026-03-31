import * as React from 'react';
import Svg, { type SvgProps, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
const BackupLoadingGlow = ({
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
    viewBox="0 0 500 500"
    {...props}
  >
    <Defs>
      <RadialGradient
        id="backup-loading-glow_svg__a"
        cx={0}
        cy={0}
        r={1}
        gradientTransform="matrix(250 0 0 250 250 250)"
        gradientUnits="userSpaceOnUse"
      >
        <Stop offset={0} stopColor="#00EF8B" stopOpacity={0.25} />
        <Stop offset={1} stopColor="#00EF8B" stopOpacity={0} />
      </RadialGradient>
    </Defs>
    <Circle cx={250} cy={250} r={250} fill="url(#backup-loading-glow_svg__a)" />
  </Svg>
);
export default BackupLoadingGlow;
