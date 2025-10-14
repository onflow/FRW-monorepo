import { IconWrapper, type IconWrapperProps } from '../IconWrapper';

const Trash = (props: IconWrapperProps) => (
  <IconWrapper viewBox="0 0 25 24" {...props}>
    <path
      d="M3.625 6H5.625M5.625 6H21.625M5.625 6V20C5.625 20.5304 5.83571 21.0391 6.21079 21.4142C6.58586 21.7893 7.09457 22 7.625 22H17.625C18.1554 22 18.6641 21.7893 19.0392 21.4142C19.4143 21.0391 19.625 20.5304 19.625 20V6H5.625ZM8.625 6V4C8.625 3.46957 8.83571 2.96086 9.21079 2.58579C9.58586 2.21071 10.0946 2 10.625 2H14.625C15.1554 2 15.6641 2.21071 16.0392 2.58579C16.4143 2.96086 16.625 3.46957 16.625 4V6M10.625 11V17M14.625 11V17"
      stroke="#767676"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconWrapper>
);

export default Trash;
