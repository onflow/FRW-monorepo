import { IconWrapper, type IconWrapperProps } from '../IconWrapper';

const BackupLoadingGlow = (props: IconWrapperProps) => (
  <IconWrapper viewBox="0 0 500 500" {...props}>
    <defs>
      <radialGradient
        id="paint0_radial_backup_loading_glow"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(250 250) scale(250)"
      >
        <stop offset="0" stop-color="#00EF8B" stop-opacity="0.25" />
        <stop offset="1" stop-color="#00EF8B" stop-opacity="0" />
      </radialGradient>
    </defs>
    <circle cx="250" cy="250" r="250" fill="url(#paint0_radial_backup_loading_glow)" />
  </IconWrapper>
);

export default BackupLoadingGlow;
