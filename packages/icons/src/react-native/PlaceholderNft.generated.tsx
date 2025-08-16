import * as React from 'react';
import Svg, { type SvgProps, Path, Rect } from 'react-native-svg';
const PlaceholderNft = ({
  color = 'currentColor',
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
    viewBox="0 0 48 48"
    {...props}
  >
    <Rect width={48} height={48} fill={color} rx={24} />
    <Path
      fill={color}
      d="M34.823 18.731h-7.154v7.154h7.154zM20.52 28.566a2.685 2.685 0 1 1-2.686-2.686h2.686v-7.149h-2.686C12.403 18.731 8 23.134 8 28.566c0 5.431 4.403 9.834 9.834 9.834 5.432 0 9.835-4.403 9.835-9.834V25.88h-7.15zM30.354 15.154H38.4V8h-8.046c-5.429.006-9.829 4.405-9.834 9.834v.897h7.149v-.897a2.685 2.685 0 0 1 2.685-2.68"
    />
    <Path fill={color} d="M20.52 25.88h7.149v-7.149h-7.15z" />
  </Svg>
);
export default PlaceholderNft;
