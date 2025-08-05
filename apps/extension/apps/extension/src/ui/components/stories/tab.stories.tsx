import { Box, Typography } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import React, { useState } from 'react';

import { COLOR_DARK_GRAY_333333, COLOR_CHARCOAL_GRAY_4C4C4C } from '@/ui/style/color';

import { Tab } from '../tab';

const meta: Meta<typeof Tab> = {
  title: 'Components/Tab',
  component: Tab,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
    docs: {
      description: {
        component: 'A sliding tab switch component for toggling between two options.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: '400px',
          backgroundColor: '#181818',
          borderRadius: '16px',
          padding: '16px',
          color: 'white',
        }}
      >
        <Story />
      </div>
    ),
  ],
  argTypes: {
    value: {
      control: 'text',
      description: 'Current selected value',
    },
    onChange: {
      action: 'changed',
      description: 'Change handler function',
    },
    leftLabel: {
      control: 'text',
      description: 'Label for the left option',
    },
    rightLabel: {
      control: 'text',
      description: 'Label for the right option',
    },
    leftValue: {
      control: 'text',
      description: 'Value for the left option',
    },
    rightValue: {
      control: 'text',
      description: 'Value for the right option',
    },
    sx: {
      control: 'object',
      description: 'Custom styles to apply to the tab component',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tab>;

// Interactive wrapper component for stories
const TabWrapper: React.FC<{
  leftLabel?: string;
  rightLabel?: string;
  leftValue?: string;
  rightValue?: string;
  sx?: any;
}> = ({
  leftLabel = 'Collections',
  rightLabel = 'Coins',
  leftValue = 'one',
  rightValue = 'two',
  sx,
}) => {
  const [value, setValue] = useState(leftValue);

  return (
    <Box sx={{ width: '100%' }}>
      <Tab
        value={value}
        onChange={setValue}
        leftLabel={leftLabel}
        rightLabel={rightLabel}
        leftValue={leftValue}
        rightValue={rightValue}
        sx={sx}
      />

      <Box sx={{ mt: 2, p: 2, backgroundColor: '#282828', borderRadius: '8px' }}>
        <Typography>
          {value === leftValue ? `${leftLabel} content` : `${rightLabel} content`}
        </Typography>
      </Box>
    </Box>
  );
};

export const Default: Story = {
  render: () => <TabWrapper />,
  parameters: {
    docs: {
      description: {
        story: 'Default tab switch with collections and coins options.',
      },
    },
  },
};

export const CustomLabels: Story = {
  render: () => <TabWrapper leftLabel="ON" rightLabel="OFF" leftValue="on" rightValue="off" />,
  parameters: {
    docs: {
      description: {
        story: 'Tab switch with custom ON/OFF labels.',
      },
    },
  },
};

export const LongLabels: Story = {
  render: () => (
    <TabWrapper
      leftLabel="Very Long Left Label"
      rightLabel="Very Long Right Label"
      leftValue="option1"
      rightValue="option2"
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tab switch with long labels to test text wrapping.',
      },
    },
  },
};

export const CustomStyling: Story = {
  render: () => (
    <TabWrapper
      sx={{
        background: COLOR_DARK_GRAY_333333,
        borderRadius: '16px',
        height: 48,
        border: `1px solid ${COLOR_CHARCOAL_GRAY_4C4C4C}`,
        '& .MuiBox-root': {
          fontSize: '16px',
          fontWeight: 600,
        },
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tab switch with custom dark theme styling.',
      },
    },
  },
};

export const MultipleSwitches: Story = {
  render: () => {
    const [viewMode, setViewMode] = useState('grid');
    const [filterMode, setFilterMode] = useState('all');

    return (
      <Box sx={{ width: '100%' }}>
        <Tab
          value={viewMode}
          onChange={setViewMode}
          leftLabel="Grid"
          rightLabel="List"
          leftValue="grid"
          rightValue="list"
        />

        <Box sx={{ mt: 2 }}>
          <Tab
            value={filterMode}
            onChange={setFilterMode}
            leftLabel="All"
            rightLabel="Favorites"
            leftValue="all"
            rightValue="favorites"
            sx={{ height: 36, fontSize: '12px' }}
          />
        </Box>

        <Box sx={{ mt: 2, p: 2, backgroundColor: '#282828', borderRadius: '8px' }}>
          <Typography>
            View: {viewMode}, Filter: {filterMode}
          </Typography>
        </Box>
      </Box>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Multiple tab switches showing different use cases with custom styling.',
      },
    },
  },
};
