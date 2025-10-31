import * as React from 'react';
import Svg, {
  type SvgProps,
  Circle,
  ClipPath,
  Defs,
  ForeignObject,
  G,
  Path,
  Rect,
} from 'react-native-svg';
/* SVGR has dropped some elements not supported by react-native-svg: div */
const RecoveryPhraseBackup = ({
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
    viewBox="0 0 79 57"
    {...props}
  >
    <ForeignObject width={158.944} height={170.218} x={-57.245} y={-57.002}></ForeignObject>
    <G data-figma-bg-blur-radius={57.732}>
      <Path
        fill="#fff"
        fillOpacity={0.05}
        d="m28.524 1.357-23.77 5.54C2.128 7.509.5 10.152 1.118 12.8l8.941 38.367c.618 2.649 3.247 4.3 5.872 3.688l23.77-5.54c2.626-.611 4.254-3.255 3.636-5.903L34.396 5.045c-.618-2.648-3.247-4.3-5.872-3.688"
      />
      <Path
        stroke="#fff"
        strokeOpacity={0.5}
        d="m25.58 42.495.024-.006M4.754 6.897l23.77-5.54c2.625-.612 5.254 1.04 5.872 3.688l8.941 38.368c.617 2.648-1.01 5.292-3.636 5.904l-23.77 5.54c-2.625.611-5.254-1.04-5.872-3.689L1.118 12.801C.5 10.152 2.128 7.509 4.754 6.897Z"
      />
    </G>
    <Rect width={36.948} height={36.948} x={31} y={19.301} fill="#00EF8B" rx={18.474} />
    <Path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M45.626 37.005v-3.08a3.849 3.849 0 0 1 7.698 0v3.08m-9.238 0h10.777c.85 0 1.54.69 1.54 1.54v5.388c0 .85-.69 1.54-1.54 1.54H44.086c-.85 0-1.54-.69-1.54-1.54v-5.389c0-.85.69-1.539 1.54-1.539"
    />
    <Circle cx={25.5} cy={41.75} r={1.5} fill="#fff" />
    <Defs>
      <ClipPath id="recovery-phrase-backup_svg__a" transform="translate(57.245 57.002)">
        <Path d="m28.524 1.357-23.77 5.54C2.128 7.509.5 10.152 1.118 12.8l8.941 38.367c.618 2.649 3.247 4.3 5.872 3.688l23.77-5.54c2.626-.611 4.254-3.255 3.636-5.903L34.396 5.045c-.618-2.648-3.247-4.3-5.872-3.688" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default RecoveryPhraseBackup;
