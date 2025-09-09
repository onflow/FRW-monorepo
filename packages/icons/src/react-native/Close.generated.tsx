import * as React from "react"
import Svg, { type SvgProps, Path } from "react-native-svg"
const Close = ({ color = "currentColor", size = 24, width, height, ...props }: SvgProps & { size?: number }) => (
  <Svg xmlns="http://www.w3.org/2000/svg" width={width ?? size} height={height ?? size} fill="none" viewBox="0 0 17 15" {...props}>
    <Path
      fill={color}
      d="M15.844 13.719A.75.75 0 0 1 15.31 15a.76.76 0 0 1-.535-.22L8.5 8.56l-6.274 6.22a.76.76 0 0 1-1.07 0 .747.747 0 0 1 0-1.061l6.275-6.22L1.156 1.28a.747.747 0 0 1 0-1.061.76.76 0 0 1 1.07 0L8.5 6.439 14.774.22a.76.76 0 0 1 1.07 0 .747.747 0 0 1 0 1.061L9.57 7.5z"
    />
  </Svg>
);
export default Close
