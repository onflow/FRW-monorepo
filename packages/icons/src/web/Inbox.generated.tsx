import { IconWrapper, type IconWrapperProps } from '../IconWrapper';

const Inbox = (props: IconWrapperProps) => (
  <IconWrapper viewBox="0 0 24 24" {...props}>
    <path
      d="M22 12H16L14 15H10L8 12H2M22 12V18C22 18.5304 21.7893 19.0391 21.4142 19.4142C21.0391 19.7893 20.5304 20 20 20H4C3.46957 20 2.96086 19.7893 2.58579 19.4142C2.21071 19.0391 2 18.5304 2 18V12M22 12L18.55 5.11C18.3844 4.77679 18.1292 4.49637 17.813 4.30028C17.4967 4.10419 17.1321 4.0002 16.76 4H7.24C6.86792 4.0002 6.50326 4.10419 6.18704 4.30028C5.87083 4.49637 5.61558 4.77679 5.45 5.11L2 12"
      stroke="#00EF8B"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconWrapper>
);

export default Inbox;
