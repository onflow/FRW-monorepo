import {
  Avatar,
  Box,
  CardMedia,
  CircularProgress,
  circularProgressClasses,
  ListItemText,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Typography,
} from '@mui/material';
import React from 'react';

import { type UserInfoResponse } from '@/shared/types/network-types';
import { useUserInfo } from '@/ui/hooks/use-account-hooks';
import iconCheck from 'ui/FRWAssets/svg/iconCheck.svg';

export const ProfileItem = ({
  profileId,
  selectedProfileId,
  switchAccount,
  switchLoading,
  loadingId,
  setLoadingId,
}: {
  profileId: string; // The profile id of this item
  selectedProfileId: string; // The profile id of the currently selected profile
  switchAccount: (profileId: string) => void;
  switchLoading: boolean;
  loadingId: string | null;
  setLoadingId: (profileId: string) => void;
}) => {
  const userInfo: UserInfoResponse | undefined = useUserInfo(profileId);
  return (
    <ListItem
      disablePadding
      key={profileId}
      data-testid={`profile-item-nickname-${userInfo?.nickname}`}
      onClick={() => {
        if (profileId !== selectedProfileId) {
          setLoadingId(profileId); // Set the loading index
          switchAccount(profileId);
        }
      }}
    >
      <ListItemButton sx={{ padding: '0 20px' }}>
        <ListItemIcon>
          <Avatar
            component="span"
            src={userInfo?.avatar}
            sx={{ width: '32px', height: '32px' }}
            alt="avatar"
          />
        </ListItemIcon>
        <ListItemText>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="body1" component="div" display="inline" color="text.primary">
              {userInfo?.nickname}
            </Typography>
            <Typography
              variant="body1"
              component="div"
              display="inline"
              color="text.secondary"
              sx={{ fontSize: '12px' }}
            >
              {userInfo?.username}
            </Typography>
          </Box>
        </ListItemText>
        {profileId === selectedProfileId && (
          <CardMedia component="img" sx={{ width: '16px', height: '16px' }} image={iconCheck} />
        )}
        {switchLoading && profileId === loadingId && (
          <CircularProgress
            variant="indeterminate"
            // disableShrink
            sx={{
              color: 'primary.main',
              animationDuration: '2000ms',
              [`& .${circularProgressClasses.circle}`]: {
                strokeLinecap: 'round',
              },
            }}
            size={'16px'}
            thickness={5}
            value={10}
          />
        )}
      </ListItemButton>
    </ListItem>
  );
};
