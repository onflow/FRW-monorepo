import * as React from 'react';
import Svg, { type SvgProps, ClipPath, Defs, ForeignObject, Path } from 'react-native-svg';
/* SVGR has dropped some elements not supported by react-native-svg: div */
const SendConfirmation = ({
  color = 'currentColor',
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
    <ForeignObject width={189.777} height={211.022} x={-36.355} y={-8.175}></ForeignObject>
    <Path
      fill={color}
      fillOpacity={0.05}
      stroke={color}
      strokeWidth={0.499}
      d="M14.288 79.556a13.475 13.475 0 0 1 7.168-15.74L64.27 43.308c7.569-3.625 16.574.476 18.809 8.565l19.698 71.31c1.982 7.173-2.227 14.595-9.4 16.576l-45.043 12.442c-7.173 1.982-14.595-2.227-16.576-9.4z"
      data-figma-bg-blur-radius={49.905}
    />
    <Path
      fill={color}
      d="M97.8 69.017c13.908-7.507 19.097-24.868 11.59-38.776S84.522 11.143 70.614 18.65s-19.098 24.867-11.59 38.775C66.53 71.336 83.89 76.524 97.8 69.017"
    />
    <Path fill={color} d="m93.486 33.567-7.778 4.198 4.198 7.779 7.779-4.199z" />
    <Path
      fill={color}
      d="M83.706 52.654a3.318 3.318 0 1 1-4.496-1.344l2.92-1.576-4.195-7.773-2.92 1.576C69.11 46.724 66.906 54.096 70.094 60s10.559 8.108 16.464 4.921 8.108-10.559 4.921-16.464l-1.576-2.92-7.773 4.196zM86.528 32.3l8.747-4.722-4.198-7.778-8.748 4.722c-5.9 3.192-8.101 10.558-4.921 16.464l.527.975 7.773-4.196-.527-.975a3.32 3.32 0 0 1 1.347-4.49"
    />
    <Path fill={color} d="m82.13 49.734 7.773-4.196-4.195-7.773-7.773 4.196z" />
    <ForeignObject width={226.485} height={204.119} x={-33.6} y={-1.293}></ForeignObject>
    <Path
      fill={color}
      fillOpacity={0.05}
      stroke={color}
      strokeWidth={0.499}
      d="M17.045 89.251c-1.982-7.173 2.227-14.594 9.4-16.575l84.434-23.324c7.173-1.981 14.594 2.227 16.575 9.4l14.787 53.531c1.982 7.173-2.227 14.594-9.4 16.576l-84.434 23.323c-7.172 1.982-14.594-2.227-16.575-9.4z"
      data-figma-bg-blur-radius={49.905}
    />
    <ForeignObject width={52.186} height={48.558} x={98.429} y={62.701}></ForeignObject>
    <Path
      stroke={color}
      strokeWidth={0.499}
      d="M112.473 87.121a4.99 4.99 0 0 1 3.529-6.112l16.34-4.378 4.343 16.205-16.341 4.378a4.99 4.99 0 0 1-6.112-3.528z"
      data-figma-bg-blur-radius={13.624}
    />
    <Defs>
      <ClipPath id="send-confirmation_svg__a" transform="translate(36.355 8.175)">
        <Path d="M14.288 79.556a13.475 13.475 0 0 1 7.168-15.74L64.27 43.308c7.569-3.625 16.574.476 18.809 8.565l19.698 71.31c1.982 7.173-2.227 14.595-9.4 16.576l-45.043 12.442c-7.173 1.982-14.595-2.227-16.576-9.4z" />
      </ClipPath>
      <ClipPath id="send-confirmation_svg__b" transform="translate(33.6 1.293)">
        <Path d="M17.045 89.251c-1.982-7.173 2.227-14.594 9.4-16.575l84.434-23.324c7.173-1.981 14.594 2.227 16.575 9.4l14.787 53.531c1.982 7.173-2.227 14.594-9.4 16.576l-84.434 23.323c-7.172 1.982-14.594-2.227-16.575-9.4z" />
      </ClipPath>
      <ClipPath id="send-confirmation_svg__c" transform="translate(-98.429 -62.701)">
        <Path d="M112.473 87.121a4.99 4.99 0 0 1 3.529-6.112l16.34-4.378 4.343 16.205-16.341 4.378a4.99 4.99 0 0 1-6.112-3.528z" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default SendConfirmation;
