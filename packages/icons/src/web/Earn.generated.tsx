import { IconWrapper, type IconWrapperProps } from '../IconWrapper';

const Earn = (props: IconWrapperProps) => (
  <IconWrapper viewBox="0 0 36 36" {...props}>
    <circle cx="18" cy="18" r="18" transform="rotate(-180 18 18)" fill="#00EF8B" />
    <path
      d="M26.2188 11.6829L18.251 19.767L15.2822 16.7983L9.2666 22.6975"
      stroke="black"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M26.2188 19.3943V11.6829H18.5073"
      stroke="black"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconWrapper>
);

export default Earn;
