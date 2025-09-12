import * as React from "react"
import Svg, { type SvgProps, Path } from "react-native-svg"
const ChevronRight = ({ color = "currentColor", size = 24, width, height, ...props }: SvgProps & { size?: number }) => (
  <Svg xmlns="http://www.w3.org/2000/svg" width={width ?? size} height={height ?? size} fill="none" viewBox="0 0 25 25" {...props}>
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity={0.502}
      strokeWidth={1.62}
      d="m9.875 18.444 6-6-6-6"
    />
  </Svg>
);
export default ChevronRight
