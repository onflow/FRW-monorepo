import { Typography, Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';

import empty_status from '../../FRWAssets/image/empty_status.svg';

const useStyles = makeStyles(() => ({
  emptyBox: {
    margin: '24px auto 32px auto',
    height: '249px',
    justifyContent: 'center',
    alignContent: 'center',
    textAlign: 'center',
    color: '#777E90',
  },
  emptyImg: {
    margin: '0 auto auto auto',
  },
  title: {
    fontSize: '16px',
    lineHeight: '24px',
    fontWeight: 600,
    marginTop: '16px',
    marginBottom: '4px',
    width: '100%',
  },
  subtitle: {
    fontSize: '14px',
    lineHeight: '20px',
    width: '100%',
  },
}));

function EmptyStatus() {
  const classes = useStyles();

  return (
    <>
      <Box className={classes.emptyBox}>
        <img className={classes.emptyImg} src={empty_status} height="167px" />
        <Typography className={classes.title}>
          {chrome.i18n.getMessage('We__did__not__find__anything__here')}
        </Typography>
        <Typography className={classes.subtitle}>
          {chrome.i18n.getMessage('Looking__forward__to__your__new__discovery')}
        </Typography>
      </Box>
    </>
  );
}

export default EmptyStatus;
