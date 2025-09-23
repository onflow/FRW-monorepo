import * as React from "react"
import Svg, { type SvgProps, Circle, Path } from "react-native-svg"
const UserRoundPlus = ({ color = "currentColor", size = 24, width, height, ...props }: SvgProps & { size?: number }) => (
  <Svg xmlns="http://www.w3.org/2000/svg" width={width ?? size} height={height ?? size} fill="none" viewBox="0 0 24 24" {...props}>
    <Path d="M2 21a8 8 0 0 1 13.292-6" />
    <Circle cx={10} cy={8} r={5} />
    <Path d="M19 16v6M22 19h-6" />
  </Svg>
);
export default UserRoundPlus
