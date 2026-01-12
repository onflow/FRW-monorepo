import * as React from 'react';
import Svg, { type SvgProps, ClipPath, Defs, G, Path } from 'react-native-svg';
const UploadCloud = ({
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
    viewBox="0 0 28 28"
    {...props}
  >
    <G clipPath="url(#upload-cloud_svg__a)">
      <Path
        stroke="#00EF8B"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M18.666 18.666 14 13.999m0 0-4.667 4.667M14 13.999v10.5m9.788-3.045A5.834 5.834 0 0 0 21 10.5h-1.47A9.332 9.332 0 1 0 3.5 19.016"
      />
    </G>
    <Defs>
      <ClipPath id="upload-cloud_svg__a">
        <Path fill="#fff" d="M0 0h28v28H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default UploadCloud;
