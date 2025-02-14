import { CardMedia } from '@mui/material';
import React from 'react';

import clockIcon from '@/ui/FRWAssets/svg/clockIcon.svg';

const IconActivity = (props) => (
  <CardMedia
    sx={{
      width: '20px',
      height: '20px',
      color: '#FFFFFF',
      ...props.sx,
    }}
    image={clockIcon}
    {...props}
  />
);

export default IconActivity;
