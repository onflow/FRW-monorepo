import { IconWrapper, type IconWrapperProps } from '../IconWrapper';

const Plus = (props: IconWrapperProps) => (
  <IconWrapper viewBox="0 0 25 24" {...props}>
    <path
      d="M12.125 5V19M5.125 12H19.125"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconWrapper>
);

export default Plus;
