import * as React from "react"
import Svg, { type SvgProps, Path } from "react-native-svg"
const Search = ({ color = "currentColor", size = 24, width, height, ...props }: SvgProps & { size?: number }) => (
  <Svg xmlns="http://www.w3.org/2000/svg" width={width ?? size} height={height ?? size} fill="none" viewBox="0 0 25 24" {...props}>
    <Path
      fill={color}
      fillOpacity={0.4}
      fillRule="evenodd"
      d="M11.495 2A8.995 8.995 0 0 0 2.5 10.995a8.995 8.995 0 0 0 8.995 8.995 8.96 8.96 0 0 0 5.634-1.982l3.705 3.706a.976.976 0 0 0 1.38-1.38l-3.706-3.705a8.96 8.96 0 0 0 1.982-5.634A8.995 8.995 0 0 0 11.495 2m-7.044 8.995a7.044 7.044 0 1 1 14.087 0 7.044 7.044 0 0 1-14.087 0"
      clipRule="evenodd"
    />
  </Svg>
);
export default Search
