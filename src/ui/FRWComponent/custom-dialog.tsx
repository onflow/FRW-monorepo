import { Dialog, type DialogProps, styled } from '@mui/material';
import React from 'react';

/*
 '& .MuiPaper-root': {
    width: '640px',
    borderRadius: '24px',
    height: 'auto',
    padding: '40px',
    backgroundColor: '#222222',
    backgroundImage: 'none',
  },
  */

export const CustomDialog = (props: DialogProps) => {
  return (
    <Dialog
      {...props}
      sx={{
        zIndex: 1500,
      }}
      PaperProps={{
        sx: {
          width: '640px',
          borderRadius: '24px',
          height: 'auto',
          padding: '40px',
          backgroundColor: '#222222',
          backgroundImage: 'none',
        },
      }}
    >
      {props.children}
    </Dialog>
  );
};
