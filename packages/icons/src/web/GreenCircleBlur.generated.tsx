import { IconWrapper, type IconWrapperProps } from '../IconWrapper';

const GreenCircleBlur = (props: IconWrapperProps) => (
  <IconWrapper viewBox="0 0 376 603" {...props}>
    <g filter="url(#filter0_f_8987_15035)">
      <circle
        cx="59.0238"
        cy="277.253"
        r="125"
        transform="rotate(-15 59.0238 277.253)"
        fill="#35E97E"
        fillOpacity="0.4"
      />
    </g>
    <defs>
      <filter
        id="filter0_f_8987_15035"
        x="-266.007"
        y="-47.7783"
        width="650.062"
        height="650.062"
        filterUnits="userSpaceOnUse"
        color-interpolation-filters="sRGB"
      >
        <feFlood flood-opacity="0" result="BackgroundImageFix" />
        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feGaussianBlur stdDeviation="100" result="effect1_foregroundBlur_8987_15035" />
      </filter>
    </defs>
  </IconWrapper>
);

export default GreenCircleBlur;
