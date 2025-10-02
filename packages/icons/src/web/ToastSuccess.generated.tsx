import { IconWrapper, type IconWrapperProps } from '../IconWrapper';

const ToastSuccess = (props: IconWrapperProps) => (
  <IconWrapper viewBox="0 0 24 24" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </IconWrapper>
);

export default ToastSuccess;
