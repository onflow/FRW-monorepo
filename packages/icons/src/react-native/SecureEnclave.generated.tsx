import * as React from 'react';
import Svg, { type SvgProps, Path } from 'react-native-svg';
const SecureEnclave = ({
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
    viewBox="0 0 18 22"
    {...props}
  >
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeWidth={1.5}
      d="M13.173 8.002v-.835c0-2.757 0-4.135-.856-4.991-.857-.857-2.235-.857-4.991-.857-2.757 0-4.135 0-4.991.857-.856.856-.856 2.234-.856 4.99v5.013c0 2.756 0 4.134.856 4.99.856.857 2.234.857 4.99.857l.836-.001"
    />
    <Path
      stroke={color}
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M11.92 15.937v-1.253a1.67 1.67 0 0 1 3.341 0v1.253m-2.297 4.595h1.253c.98 0 1.47 0 1.807-.26q.131-.1.231-.23c.26-.338.26-.828.26-1.808s0-1.469-.26-1.807a1.3 1.3 0 0 0-.23-.23c-.338-.26-.828-.26-1.808-.26h-1.253c-.98 0-1.47 0-1.807.26a1.3 1.3 0 0 0-.231.23c-.259.338-.259.828-.259 1.808s0 1.469.259 1.806q.1.131.231.232c.338.259.828.259 1.807.259Z"
    />
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7.326 15.516v.009"
    />
  </Svg>
);
export default SecureEnclave;
