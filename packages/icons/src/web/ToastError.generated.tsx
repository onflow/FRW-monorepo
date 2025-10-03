import { IconWrapper, type IconWrapperProps } from '../IconWrapper';

const ToastError = (props: IconWrapperProps) => (
  <IconWrapper viewBox="0 0 24 24" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </IconWrapper>
);

export default ToastError;
