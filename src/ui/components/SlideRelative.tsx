import { Box, Collapse, Slide } from '@mui/material';
import React, { useRef } from 'react';

const SlideRelative = React.forwardRef(
  (
    {
      show,
      direction,
      children,
    }: { show: boolean; direction: 'up' | 'down' | 'left' | 'right'; children: React.ReactElement },
    ref
  ) => {
    const containerRef = useRef<HTMLElement>(null);
    return (
      <>
        <Box position="relative" ref={containerRef} />
        <Collapse in={!!show} orientation="vertical">
          <Box ref={ref}>{children}</Box>
        </Collapse>
      </>
    );
  }
);

export default SlideRelative;
