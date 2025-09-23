import * as React from "react"
import Svg, { type SvgProps, ClipPath, Defs, G, Path } from "react-native-svg"
const FlowLogo = ({ color = "#00EF8B", size = 24, width, height, theme = "outline", ...props }: SvgProps & { size?: number, theme?: "outline" | "filled" | "dual-tone" | "multicolor" }) => {
  // Handle different themes
  const getColors = () => {
    if (theme === "multicolor") {
      return {
        background: "#00EF8B", // Flow green
        foreground: "#FFFFFF", // White
        accent: "#00EF8B", // Flow green
      };
    }
    return {
      background: color,
      foreground: color,
      accent: color,
    };
  };

  const colors = getColors();

  return (
    <Svg xmlns="http://www.w3.org/2000/svg" width={width ?? size} height={height ?? size} fill="none" viewBox="0 0 36 36" {...props}>
      <G clipPath="url(#flow-logo_svg__a)">
        {/* Main circle background - Flow green */}
        <Path
          fill={colors.background}
          d="M18.1 35.2c9.72 0 17.6-7.88 17.6-17.6S27.82 0 18.1 0 .5 7.88.5 17.6s7.88 17.6 17.6 17.6"
        />
        {/* Left curve - White on multicolor, same as background otherwise */}
        <Path
          fill={theme === "multicolor" ? colors.foreground : colors.background}
          d="M14.8 29.837c0 .413-.33.646-.715.523C8.75 28.655 4.9 23.677 4.9 17.778c0-5.885 3.85-10.876 9.185-12.58.4-.125.715.11.715.522v1.03c0 .276-.206.592-.467.688-4.221 1.554-7.233 5.61-7.233 10.34 0 4.744 3.012 8.787 7.233 10.327.261.096.467.412.467.687z"
        />
        {/* Dollar sign - White on multicolor */}
        <Path
          fill={theme === "multicolor" ? colors.foreground : colors.background}
          d="M19.2 26.028c0 .303-.248.55-.55.55h-1.1a.55.55 0 0 1-.55-.55v-1.732c-2.407-.33-3.575-1.664-3.892-3.507a.507.507 0 0 1 .509-.59h1.251c.261 0 .482.192.537.44.233 1.085.866 1.924 2.79 1.924 1.417 0 2.435-.797 2.435-1.98s-.592-1.636-2.682-1.98c-3.08-.412-4.537-1.347-4.537-3.754 0-1.856 1.416-3.313 3.589-3.616V9.528c0-.302.247-.55.55-.55h1.1c.302 0 .55.248.55.55v1.746c1.773.317 2.9 1.32 3.272 2.998a.505.505 0 0 1-.509.605h-1.155a.544.544 0 0 1-.522-.399c-.317-1.059-1.073-1.526-2.393-1.526-1.457 0-2.213.701-2.213 1.691 0 1.045.426 1.568 2.667 1.884 3.025.412 4.592 1.279 4.592 3.85 0 1.952-1.457 3.534-3.726 3.891v1.76z"
        />
        {/* Right curve - White on multicolor */}
        <Path
          fill={theme === "multicolor" ? colors.foreground : colors.background}
          d="M22.115 30.36c-.398.124-.715-.11-.715-.522v-1.031c0-.303.18-.592.468-.688 4.207-1.54 7.232-5.596 7.232-10.326 0-4.744-3.01-8.786-7.232-10.326-.261-.097-.468-.413-.468-.688V5.748c0-.413.33-.646.715-.523A13.15 13.15 0 0 1 31.3 17.78c0 5.899-3.85 10.876-9.185 12.581"
        />
        {/* Flow logo elements - White on multicolor */}
        <Path fill={theme === "multicolor" ? colors.foreground : colors.background} d="M25.824 14.847h-4.97v4.97h4.97z" />
        <Path
          fill={theme === "multicolor" ? colors.foreground : colors.background}
          d="M15.887 21.68a1.866 1.866 0 1 1-1.865-1.866h1.865v-4.967h-1.865a6.833 6.833 0 1 0 6.832 6.832v-1.865h-4.967z"
        />
        <Path
          fill={theme === "multicolor" ? colors.foreground : colors.background}
          d="M22.718 12.362h5.59v-4.97h-5.59a6.84 6.84 0 0 0-6.832 6.833v.623h4.967v-.623a1.866 1.866 0 0 1 1.865-1.863"
        />
        <Path fill={theme === "multicolor" ? colors.foreground : colors.background} d="M15.886 19.814h4.967v-4.967h-4.967z" />
      </G>
      <Defs>
        <ClipPath id="flow-logo_svg__a">
          <Path fill="white" d="M.5 0h35.2v35.2H.5z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};
export default FlowLogo
