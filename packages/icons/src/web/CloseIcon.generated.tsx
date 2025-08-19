import { IconWrapper, type IconWrapperProps } from '../IconWrapper';

const CloseIcon = (props: IconWrapperProps) => (
  <IconWrapper viewBox="0 0 11 10" {...props}>
    <path
      d="M9.5 1L1.5 9M1.5 1L9.5 9"
      stroke="white"
      strokeOpacity="0.8"
      strokeWidth="1.33333"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconWrapper>
);

export default CloseIcon;
