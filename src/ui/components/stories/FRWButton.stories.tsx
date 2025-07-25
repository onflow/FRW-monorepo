import { Stack, Typography } from '@mui/material';
import { type Meta, type StoryObj } from '@storybook/react-webpack5';
import React from 'react';

import { FRWButton } from '../FRWButton';

const meta: Meta<typeof FRWButton> = {
  title: 'Components/FRWButton',
  component: FRWButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: { type: 'boolean' },
    },
    loading: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const States: Story = {
  render: () => (
    <Stack spacing={3} sx={{ minWidth: '400px' }}>
      <Typography variant="h6">Button States</Typography>
      <Stack spacing={2}>
        <FRWButton sx={{ backgroundColor: 'white', color: 'black' }}>Normal Button</FRWButton>
        <FRWButton sx={{ backgroundColor: 'white', color: 'black' }} disabled>
          Disabled Button
        </FRWButton>
        <FRWButton sx={{ backgroundColor: 'white', color: 'black' }} loading>
          Loading Button
        </FRWButton>
      </Stack>
    </Stack>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Stack spacing={3} sx={{ minWidth: '400px' }}>
      <Typography variant="h6">Interactive Examples</Typography>
      <Stack spacing={2}>
        <FRWButton
          sx={{ backgroundColor: 'white', color: 'black' }}
          onClick={() => alert('Button clicked!')}
        >
          Click Me
        </FRWButton>
        <FRWButton
          sx={{ backgroundColor: 'success.main', color: 'white' }}
          onClick={() => alert('Success button clicked!')}
        >
          Success Action
        </FRWButton>
        <FRWButton
          sx={{ backgroundColor: 'warning.main', color: 'white' }}
          onClick={() => alert('Warning button clicked!')}
        >
          Warning Action
        </FRWButton>
      </Stack>
    </Stack>
  ),
};

export const StandardStyling: Story = {
  render: () => (
    <Stack spacing={3} sx={{ minWidth: '400px' }}>
      <Typography variant="h6">Standard Button Styling (100% width, 16px 20px padding)</Typography>
      <Stack spacing={2}>
        <FRWButton sx={{ backgroundColor: 'white', color: 'black' }}>Default Button</FRWButton>
        <FRWButton sx={{ backgroundColor: 'success.main', color: 'white' }}>
          Success Button
        </FRWButton>
        <FRWButton sx={{ backgroundColor: 'error.main', color: 'white' }}>Error Button</FRWButton>
        <FRWButton sx={{ backgroundColor: 'warning.main', color: 'white' }}>
          Warning Button
        </FRWButton>
      </Stack>
    </Stack>
  ),
};

export const CustomStyling: Story = {
  render: () => (
    <Stack spacing={3} sx={{ minWidth: '400px' }}>
      <Typography variant="h6">Custom Styling Examples (overriding standard dimensions)</Typography>
      <Stack spacing={2}>
        <FRWButton
          sx={{
            width: '200px',
            height: '60px',
            backgroundColor: 'error.main',
            color: 'white',
          }}
        >
          Custom Width & Height
        </FRWButton>
        <FRWButton
          sx={{
            width: '300px',
            padding: '12px 24px',
            backgroundColor: 'warning.main',
            color: 'white',
          }}
        >
          Custom Width & Padding
        </FRWButton>
        <FRWButton
          sx={{
            width: '100%',
            backgroundColor: 'primary.main',
            color: 'white',
          }}
        >
          Full Width Button
        </FRWButton>
        <FRWButton
          sx={{
            width: '250px',
            backgroundColor: 'info3.main',
            color: 'white',
          }}
        >
          Custom Width Only
        </FRWButton>
      </Stack>
    </Stack>
  ),
};
