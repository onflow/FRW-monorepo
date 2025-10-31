import * as React from 'react';
import Svg, { type SvgProps, ClipPath, Defs, ForeignObject, G, Path, Rect } from 'react-native-svg';
/* SVGR has dropped some elements not supported by react-native-svg: div */
const CloudBackup = ({
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
    <G clipPath="url(#cloud-backup_svg__a)">
      <ForeignObject width={165.206} height={147.351} x={-56.257} y={-34.416}></ForeignObject>
      <Path
        fill="#fff"
        fillOpacity={0.05}
        stroke="#fff"
        strokeOpacity={0.5}
        d="m31.346 53.363 16.87-9.74c3.328-1.921 3.335-6.722.013-8.653l-16.858-9.8a10 10 0 0 0-10.05 0l-16.859 9.8c-3.322 1.93-3.315 6.732.013 8.653l16.87 9.74a10 10 0 0 0 10 0Z"
        data-figma-bg-blur-radius={57.732}
      />
      <ForeignObject width={165.206} height={147.351} x={-56.257} y={-48.416}></ForeignObject>
      <Path
        fill="#fff"
        fillOpacity={0.05}
        stroke="#fff"
        strokeOpacity={0.5}
        d="m31.346 39.363 16.87-9.74c3.328-1.922 3.335-6.722.013-8.653l-16.858-9.8a10 10 0 0 0-10.05 0l-16.859 9.8c-3.322 1.93-3.315 6.732.013 8.653l16.87 9.74a10 10 0 0 0 10 0Z"
        data-figma-bg-blur-radius={57.732}
      />
      <Rect width={36.948} height={36.948} x={33} y={0.25} fill="#00EF8B" rx={18.474} />
      <G clipPath="url(#cloud-backup_svg__d)">
        <Path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m54.553 21.803-3.079-3.08m0 0-3.079 3.08m3.08-3.08v6.929m6.458-2.01a3.849 3.849 0 0 0-1.84-7.227h-.97a6.159 6.159 0 1 0-10.576 5.619"
        />
      </G>
    </G>
    <Defs>
      <ClipPath id="cloud-backup_svg__b" transform="translate(56.257 34.416)">
        <Path d="m31.346 53.363 16.87-9.74c3.328-1.921 3.335-6.722.013-8.653l-16.858-9.8a10 10 0 0 0-10.05 0l-16.859 9.8c-3.322 1.93-3.315 6.732.013 8.653l16.87 9.74a10 10 0 0 0 10 0" />
      </ClipPath>
      <ClipPath id="cloud-backup_svg__c" transform="translate(56.257 48.416)">
        <Path d="m31.346 39.363 16.87-9.74c3.328-1.922 3.335-6.722.013-8.653l-16.858-9.8a10 10 0 0 0-10.05 0l-16.859 9.8c-3.322 1.93-3.315 6.732.013 8.653l16.87 9.74a10 10 0 0 0 10 0" />
      </ClipPath>
      <ClipPath id="cloud-backup_svg__a">
        <Path fill="#fff" d="M0 .25h131v56H0z" />
      </ClipPath>
      <ClipPath id="cloud-backup_svg__d">
        <Path fill="#fff" d="M42.237 9.487h18.474v18.474H42.237z" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default CloudBackup;
