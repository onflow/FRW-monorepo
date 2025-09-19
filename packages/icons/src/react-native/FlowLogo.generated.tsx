import * as React from 'react';
import Svg, { type SvgProps, ClipPath, Defs, G, Path } from 'react-native-svg';
const FlowLogo = ({
  color = 'currentColor',
  size = 24,
  width,
  height,
  theme,
  ...props
}: SvgProps & { size?: number; theme?: 'outline' | 'filled' | 'dual-tone' | 'multicolor' }) => {
  const isMulticolor = theme === 'multicolor';

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={width ?? size}
      height={height ?? size}
      fill="none"
      viewBox="0 0 36 36"
      {...props}
    >
      <G clipPath="url(#flow-logo_svg__a)">
        <Path
          fill={isMulticolor ? '#00EF8B' : color}
          d="M18.1 35.2c9.72 0 17.6-7.88 17.6-17.6S27.82 0 18.1 0 .5 7.88.5 17.6s7.88 17.6 17.6 17.6"
        />
        <Path fill={isMulticolor ? 'white' : color} d="M25.824 14.847h-4.97v4.97h4.97z" />
        <Path
          fill={isMulticolor ? 'white' : color}
          d="M15.887 21.68a1.866 1.866 0 1 1-1.865-1.866h1.865v-4.967h-1.865a6.833 6.833 0 1 0 6.832 6.832v-1.865h-4.967z"
        />
        <Path
          fill={isMulticolor ? 'white' : color}
          d="M22.718 12.362h5.59v-4.97h-5.59a6.84 6.84 0 0 0-6.832 6.833v.623h4.967v-.623a1.866 1.866 0 0 1 1.865-1.863"
        />
        <Path fill={isMulticolor ? '#16FF99' : color} d="M15.886 19.814h4.967v-4.967h-4.967z" />
      </G>
      <Defs>
        <ClipPath id="flow-logo_svg__a">
          <Path fill={isMulticolor ? 'white' : color} d="M.5 0h35.2v35.2H.5z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};
export default FlowLogo;
