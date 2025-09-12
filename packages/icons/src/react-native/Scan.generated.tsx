import * as React from "react"
import Svg, { type SvgProps, Path } from "react-native-svg"
const Scan = ({ color = "currentColor", size = 24, width, height, ...props }: SvgProps & { size?: number }) => (
  <Svg xmlns="http://www.w3.org/2000/svg" width={width ?? size} height={height ?? size} fill="none" viewBox="0 0 25 24" {...props}>
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4.5 7V6a2 2 0 0 1 2-2h2m-4 13v1a2 2 0 0 0 2 2h2m8-16h2a2 2 0 0 1 2 2v1m-4 13h2a2 2 0 0 0 2-2v-1"
    />
    <Path stroke={color} strokeLinecap="round" strokeWidth={2} d="M8.097 11.359h8.559" />
  </Svg>
);
export default Scan
