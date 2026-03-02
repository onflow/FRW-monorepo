import * as React from 'react';
import Svg, { type SvgProps, Path, Rect } from 'react-native-svg';
const SeedPhrase = ({
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
    <Rect width={32} height={32} fill={color} fillOpacity={0.1} rx={16} />
    <Path
      fill={color}
      fillOpacity={0.3}
      fillRule="evenodd"
      d="M12.111 9.6c-.859 0-1.555.716-1.555 1.6v9.6c0 .884.696 1.6 1.555 1.6h7.778c.859 0 1.555-.716 1.555-1.6v-6.4H19.89c-1.718 0-3.111-1.433-3.111-3.2V9.6zm6.222.346V11.2c0 .884.697 1.6 1.556 1.6h1.219a2 2 0 0 0-.12-.137l-2.521-2.594a2 2 0 0 0-.134-.123M9 11.2C9 9.433 10.393 8 12.111 8h5.256c.825 0 1.616.337 2.2.937l2.522 2.594c.583.6.911 1.414.911 2.263V20.8c0 1.767-1.393 3.2-3.111 3.2H12.11C10.393 24 9 22.567 9 20.8zm6.222 2.4H12.89V12h2.333zm3.89 3.2h-6.223v-1.6h6.222zm0 3.2h-6.223v-1.6h6.222z"
      clipRule="evenodd"
    />
  </Svg>
);
export default SeedPhrase;
