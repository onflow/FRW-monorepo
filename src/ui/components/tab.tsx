import { Box, type SxProps, type Theme } from '@mui/material';
import React from 'react';

import { COLOR_WHITE_FFFFFF, COLOR_MUTED_BLUE_GRAY_777E90 } from '@/ui/style/color';

interface TabProps {
  value: string;
  onChange: (val: string) => void;
  leftLabel?: string;
  rightLabel?: string;
  leftValue?: string;
  rightValue?: string;
  className?: string;
  sx?: SxProps<Theme>;
}

export const Tab: React.FC<TabProps> = ({
  value,
  onChange,
  leftLabel = 'Collections',
  rightLabel = 'Coins',
  leftValue = 'one',
  rightValue = 'two',
  className,
  sx,
}) => {
  return (
    <Box
      className={className}
      sx={{
        display: 'flex',
        background: '#232323',
        borderRadius: '20px',
        p: '3px',
        width: '100%',
        position: 'relative',
        height: 40,
        mb: 2,
        ...sx,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 3,
          left: value === leftValue ? 3 : 'calc(50% + 3px)',
          width: 'calc(50% - 6px)',
          height: 34,
          background: '#444',
          borderRadius: '17px',
          transition: 'left 0.2s',
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Box
          sx={{
            flex: 1,
            textAlign: 'center',
            cursor: 'pointer',
            color: value === leftValue ? COLOR_WHITE_FFFFFF : COLOR_MUTED_BLUE_GRAY_777E90,
            fontWeight: 600,
            lineHeight: '34px',
            fontSize: '14px',
            userSelect: 'none',
            transition: 'color 0.2s ease',
            '&:hover': {
              color: value === leftValue ? COLOR_WHITE_FFFFFF : COLOR_WHITE_FFFFFF,
            },
          }}
          onClick={() => onChange(leftValue)}
        >
          {leftLabel}
        </Box>
        <Box
          sx={{
            flex: 1,
            textAlign: 'center',
            cursor: 'pointer',
            color: value === rightValue ? COLOR_WHITE_FFFFFF : COLOR_MUTED_BLUE_GRAY_777E90,
            fontWeight: 600,
            lineHeight: '34px',
            fontSize: '14px',
            userSelect: 'none',
            transition: 'color 0.2s ease',
            '&:hover': {
              color: value === rightValue ? COLOR_WHITE_FFFFFF : COLOR_WHITE_FFFFFF,
            },
          }}
          onClick={() => onChange(rightValue)}
        >
          {rightLabel}
        </Box>
      </Box>
    </Box>
  );
};

// Export as default for backward compatibility
export default Tab;
