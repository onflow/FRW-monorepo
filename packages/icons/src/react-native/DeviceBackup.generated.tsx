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
const DeviceBackup = ({
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
    viewBox="0 0 131 57"
    {...props}
  >
    <ForeignObject width={218.781} height={184.781} x={-82.391} y={-76.141}></ForeignObject>
    <G data-figma-bg-blur-radius={83.391}>
      <Rect width={52} height={18} x={1} y={7.25} fill="#fff" fillOpacity={0.05} rx={5.778} />
      <Rect width={51} height={17} x={1.5} y={7.75} stroke="#fff" strokeOpacity={0.5} rx={5.278} />
      <Circle cx={12} cy={16.25} r={3} fill="#fff" fillOpacity={0.5} />
      <Circle cx={22} cy={16.25} r={3} fill="#fff" fillOpacity={0.5} />
      <Circle cx={32} cy={16.25} r={3} fill="#fff" fillOpacity={0.5} />
      <Circle cx={42} cy={16.25} r={3} fill="#fff" fillOpacity={0.5} />
    </G>
    <Rect width={36.948} height={36.948} x={38} y={12.25} fill="#00EF8B" rx={18.474} />
    <Path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M58.014 23.026h-6.158a1.54 1.54 0 0 0-1.54 1.54v12.316a1.54 1.54 0 0 0 1.54 1.54h9.237a1.54 1.54 0 0 0 1.54-1.54v-9.237m-4.619-4.619 4.618 4.619m-4.618-4.619v4.619h4.618m-3.078 3.849h-6.159m6.158 3.079h-6.158m1.54-6.158h-1.54"
    />
    <Defs>
      <ClipPath id="device-backup_svg__a" transform="translate(82.39 76.14)">
        <Rect width={52} height={18} x={1} y={7.25} rx={5.778} />
      </ClipPath>
    </Defs>
  </Svg>
);
export default DeviceBackup;
