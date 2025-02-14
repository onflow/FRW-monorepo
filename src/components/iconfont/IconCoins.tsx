import { CardMedia } from '@mui/material';
import React from 'react';

import coinsIcon from '@/ui/FRWAssets/svg/coinsIcon.svg';

const IconCoins = (props) => (
  <CardMedia
    sx={{
      width: '20px',
      height: '20px',
      color: '#FFFFFF',
      ...props.sx,
    }}
    image={coinsIcon}
    {...props}
  />
);

export default IconCoins;
