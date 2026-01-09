import * as React from 'react';
import Svg, { type SvgProps, Path } from 'react-native-svg';
const WarningOctagonFill = ({
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
    viewBox="0 0 32 32"
    {...props}
  >
    <Path
      fill={color}
      d="M28.414 10.029 21.97 3.586A2.02 2.02 0 0 0 20.556 3h-9.112a2.02 2.02 0 0 0-1.415.586L3.586 10.03A2.02 2.02 0 0 0 3 11.444v9.112c.002.53.212 1.04.586 1.415l6.443 6.443c.376.374.884.584 1.415.586h9.112a2.02 2.02 0 0 0 1.415-.586l6.443-6.443c.374-.376.584-.884.586-1.415v-9.112a2.02 2.02 0 0 0-.586-1.415M15 10a1 1 0 0 1 2 0v7a1 1 0 0 1-2 0zm1 13a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"
    />
  </Svg>
);
export default WarningOctagonFill;
