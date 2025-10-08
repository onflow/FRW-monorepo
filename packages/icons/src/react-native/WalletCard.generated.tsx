import * as React from 'react';
import Svg, { type SvgProps, ClipPath, Defs, ForeignObject, Path } from 'react-native-svg';
/* SVGR has dropped some elements not supported by react-native-svg: div */
const WalletCard = ({
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
    viewBox="0 0 146 156"
    {...props}
  >
    <ForeignObject width={189.777} height={211.021} x={-36.938} y={-8.176}></ForeignObject>
    <Path
      fill="#fff"
      fillOpacity={0.05}
      stroke="#fff"
      strokeWidth={0.499}
      d="M13.704 79.555a13.474 13.474 0 0 1 7.168-15.74l42.815-20.507c7.569-3.625 16.574.475 18.809 8.565l19.698 71.31c1.982 7.173-2.227 14.594-9.4 16.576L47.75 152.201c-7.173 1.982-14.594-2.227-16.576-9.4z"
      data-figma-bg-blur-radius={49.905}
    />
    <Path
      fill="#00EF8B"
      d="M97.217 69.017c13.908-7.508 19.097-24.868 11.59-38.777-7.507-13.908-24.868-19.097-38.776-11.59S50.933 43.518 58.44 57.426s24.867 19.098 38.776 11.59"
    />
    <Path
      fill="#fff"
      d="m92.903 33.567-7.778 4.198 4.198 7.779 7.779-4.2zM83.123 52.653a3.318 3.318 0 1 1-4.496-1.343l2.92-1.576-4.195-7.773-2.92 1.576C68.527 46.724 66.323 54.095 69.51 60s10.559 8.108 16.464 4.92c5.905-3.187 8.108-10.558 4.921-16.463l-1.576-2.92-7.773 4.196zM85.945 32.3l8.748-4.722-4.199-7.779-8.748 4.722c-5.9 3.193-8.101 10.558-4.921 16.464l.527.976 7.773-4.196-.527-.975a3.32 3.32 0 0 1 1.347-4.49"
    />
    <Path fill="#00EF8B" d="m81.547 49.734 7.773-4.196-4.195-7.773-7.773 4.196z" />
    <ForeignObject width={226.486} height={204.119} x={-34.184} y={-1.293}></ForeignObject>
    <Path
      fill="#fff"
      fillOpacity={0.05}
      stroke="#fff"
      strokeWidth={0.499}
      d="M16.46 89.251c-1.98-7.173 2.228-14.594 9.401-16.576l84.434-23.323c7.173-1.982 14.594 2.227 16.575 9.4l14.787 53.531c1.982 7.173-2.227 14.594-9.4 16.575l-84.434 23.324c-7.172 1.981-14.594-2.227-16.575-9.4z"
      data-figma-bg-blur-radius={49.905}
    />
    <ForeignObject width={52.186} height={48.558} x={97.845} y={62.701}></ForeignObject>
    <Path
      stroke="#fff"
      strokeWidth={0.499}
      d="M111.889 87.121a4.99 4.99 0 0 1 3.529-6.112l16.34-4.378 4.343 16.205-16.341 4.378a4.99 4.99 0 0 1-6.112-3.529z"
      data-figma-bg-blur-radius={13.624}
    />
    <Defs>
      <ClipPath id="wallet-card_svg__a" transform="translate(36.938 8.176)">
        <Path d="M13.704 79.555a13.474 13.474 0 0 1 7.168-15.74l42.815-20.507c7.569-3.625 16.574.475 18.809 8.565l19.698 71.31c1.982 7.173-2.227 14.594-9.4 16.576L47.75 152.201c-7.173 1.982-14.594-2.227-16.576-9.4z" />
      </ClipPath>
      <ClipPath id="wallet-card_svg__b" transform="translate(34.184 1.293)">
        <Path d="M16.46 89.251c-1.98-7.173 2.228-14.594 9.401-16.576l84.434-23.323c7.173-1.982 14.594 2.227 16.575 9.4l14.787 53.531c1.982 7.173-2.227 14.594-9.4 16.575l-84.434 23.324c-7.172 1.981-14.594-2.227-16.575-9.4z" />
      </ClipPath>
      <ClipPath id="wallet-card_svg__c" transform="translate(-97.845 -62.7)">
        <Path d="M111.889 87.121a4.99 4.99 0 0 1 3.529-6.112l16.34-4.378 4.343 16.205-16.341 4.378a4.99 4.99 0 0 1-6.112-3.529z" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default WalletCard;
