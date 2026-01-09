import * as React from 'react';
import Svg, {
  type SvgProps,
  Defs,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';
const Icloud = ({
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
    viewBox="0 0 40 27"
    {...props}
  >
    <Path
      fill="url(#icloud_svg__a)"
      d="M34.162 11.129q.005-.146.005-.296C34.167 4.86 29.307 0 23.333 0a10.86 10.86 0 0 0-9.466 5.579A6.2 6.2 0 0 0 11.25 5c-3.226 0-5.89 2.458-6.208 5.71C2.005 12.019 0 15.016 0 18.333c0 4.595 3.739 8.334 8.333 8.334h23.75c4.366 0 7.917-3.552 7.917-7.917a7.88 7.88 0 0 0-5.838-7.621"
    />
    <Path
      fill="url(#icloud_svg__b)"
      d="M34.162 11.129q.005-.146.005-.296C34.167 4.86 29.307 0 23.333 0a10.86 10.86 0 0 0-9.466 5.579A6.2 6.2 0 0 0 11.25 5c-3.226 0-5.89 2.458-6.208 5.71C2.005 12.019 0 15.016 0 18.333c0 4.595 3.739 8.334 8.333 8.334h23.75c4.366 0 7.917-3.552 7.917-7.917a7.88 7.88 0 0 0-5.838-7.621"
    />
    <Path
      fill="url(#icloud_svg__c)"
      d="M32.084 26.667a7.917 7.917 0 1 0 0-15.833 7.917 7.917 0 0 0 0 15.833"
    />
    <Path
      fill="url(#icloud_svg__d)"
      d="M8.333 26.667a8.333 8.333 0 1 0 0-16.667 8.333 8.333 0 0 0 0 16.667"
    />
    <Path
      fill="#56C7DA"
      d="M11.25 17.5a6.25 6.25 0 1 0 0-12.5 6.25 6.25 0 0 0 0 12.5"
      opacity={0.2}
    />
    <Path
      fill="url(#icloud_svg__e)"
      d="M23.333 21.667c5.983 0 10.834-4.85 10.834-10.834C34.167 4.85 29.317 0 23.333 0 17.35 0 12.5 4.85 12.5 10.833s4.85 10.834 10.833 10.834"
    />
    <Path
      fill="url(#icloud_svg__f)"
      d="M34.162 11.129q.005-.146.005-.296C34.167 4.86 29.307 0 23.333 0a10.86 10.86 0 0 0-9.466 5.579A6.2 6.2 0 0 0 11.25 5c-3.226 0-5.89 2.458-6.208 5.71C2.005 12.019 0 15.016 0 18.333c0 4.595 3.739 8.334 8.333 8.334h23.75c4.366 0 7.917-3.552 7.917-7.917a7.88 7.88 0 0 0-5.838-7.621"
    />
    <Defs>
      <LinearGradient
        id="icloud_svg__a"
        x1={0}
        x2={40}
        y1={13.333}
        y2={13.333}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#95DCF6" />
        <Stop offset={1} stopColor="#507EFF" />
      </LinearGradient>
      <LinearGradient
        id="icloud_svg__c"
        x1={24.907}
        x2={39.26}
        y1={15.404}
        y2={22.097}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#fff" stopOpacity={0.06} />
        <Stop offset={1} stopColor="#fff" stopOpacity={0} />
      </LinearGradient>
      <LinearGradient
        id="icloud_svg__d"
        x1={14.322}
        x2={2.239}
        y1={14.272}
        y2={22.466}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#fff" stopOpacity={0} />
        <Stop offset={1} stopColor="#fff" stopOpacity={0.06} />
      </LinearGradient>
      <LinearGradient
        id="icloud_svg__e"
        x1={23.333}
        x2={23.333}
        y1={0}
        y2={21.667}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#00ACCD" stopOpacity={0.2} />
        <Stop offset={0.127} stopColor="#1AB4D2" stopOpacity={0.175} />
        <Stop offset={0.4} stopColor="#5CCADF" stopOpacity={0.12} />
        <Stop offset={0.793} stopColor="#C5ECF4" stopOpacity={0.041} />
        <Stop offset={1} stopColor="#fff" stopOpacity={0} />
      </LinearGradient>
      <LinearGradient
        id="icloud_svg__f"
        x1={4.095}
        x2={38.48}
        y1={7.731}
        y2={23.764}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#fff" stopOpacity={0.1} />
        <Stop offset={1} stopColor="#fff" stopOpacity={0} />
      </LinearGradient>
      <RadialGradient
        id="icloud_svg__b"
        cx={0}
        cy={0}
        r={1}
        gradientTransform="translate(20.556 26.25)scale(16.9967)"
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#009ADA" />
        <Stop offset={1} stopColor="#1E88E5" stopOpacity={0} />
      </RadialGradient>
    </Defs>
  </Svg>
);
export default Icloud;
