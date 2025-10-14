import { IconWrapper, type IconWrapperProps } from '../IconWrapper';

const ToastInfo = (props: IconWrapperProps) => (
  <IconWrapper viewBox="0 0 24 24" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </IconWrapper>
);

export default ToastInfo;
