import * as React from 'react';
import Svg, { type SvgProps, Path } from 'react-native-svg';
const VerifiedToken = ({
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
    viewBox="0 0 11 11"
    {...props}
  >
    <Path
      fill={color}
      d="M5.053.6a1.6 1.6 0 0 1 1.056.398l.077.073.35.349a.6.6 0 0 0 .354.17l.068.005h.5a1.6 1.6 0 0 1 1.598 1.509l.002.09v.5a.6.6 0 0 0 .13.372l.044.05.349.35a1.6 1.6 0 0 1 .073 2.19l-.072.078-.35.349a.6.6 0 0 0-.17.355l-.004.067v.5A1.6 1.6 0 0 1 7.55 9.603l-.091.003h-.5a.6.6 0 0 0-.372.129l-.05.045-.349.348a1.6 1.6 0 0 1-2.19.074l-.078-.073-.349-.349a.6.6 0 0 0-.355-.17l-.068-.004h-.5a1.6 1.6 0 0 1-1.597-1.51l-.003-.09v-.5a.6.6 0 0 0-.129-.372l-.045-.05-.348-.35a1.6 1.6 0 0 1-.074-2.19l.073-.078.349-.349a.6.6 0 0 0 .17-.355l.004-.067v-.5l.003-.091a1.6 1.6 0 0 1 1.506-1.507l.091-.002h.5a.6.6 0 0 0 .372-.13l.05-.044.35-.349A1.6 1.6 0 0 1 5.052.6M6.9 4.24a.5.5 0 0 0-.707 0L4.548 5.888 3.9 5.242 3.854 5.2a.5.5 0 0 0-.66.749l1 1 .047.041a.5.5 0 0 0 .66-.041l2-2 .042-.048a.5.5 0 0 0-.042-.66"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default VerifiedToken;
