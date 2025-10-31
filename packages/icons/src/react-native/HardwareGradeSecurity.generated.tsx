import * as React from 'react';
import Svg, { type SvgProps, Path } from 'react-native-svg';
const HardwareGradeSecurity = ({
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
    viewBox="0 0 18 20"
    {...props}
  >
    <Path
      stroke={color}
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M7.339 8.78V7.527a1.67 1.67 0 0 1 3.341 0V8.78m-2.297 4.594h1.253c.98 0 1.47 0 1.807-.259q.131-.1.231-.231c.26-.338.26-.828.26-1.807 0-.98 0-1.47-.26-1.807a1.3 1.3 0 0 0-.231-.231c-.337-.26-.827-.26-1.807-.26H8.383c-.98 0-1.47 0-1.807.26a1.3 1.3 0 0 0-.231.23c-.26.338-.26.828-.26 1.808s0 1.47.26 1.807q.1.13.231.231c.338.259.827.259 1.807.259Z"
    />
    <Path
      stroke={color}
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M1.897 4.185c2.516 0 4.229-2.506 7.113-2.506s4.597 2.506 7.113 2.506c1.677 8.354-2.076 13.017-7.113 14.2-5.037-1.183-8.79-5.846-7.113-14.2Z"
    />
  </Svg>
);
export default HardwareGradeSecurity;
