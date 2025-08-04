import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';
const SvgCheckCircleFill = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 25 25"
    {...props}
  >
    <Path
      fill="#00EF8B"
      d="M12.944 2.75a9.75 9.75 0 1 0 9.75 9.75 9.76 9.76 0 0 0-9.75-9.75m4.281 8.03-5.25 5.25a.75.75 0 0 1-1.061 0l-2.25-2.25a.75.75 0 1 1 1.061-1.06l1.72 1.72 4.719-4.72a.75.75 0 0 1 1.061 1.06"
    />
  </Svg>
);
export default SvgCheckCircleFill;
