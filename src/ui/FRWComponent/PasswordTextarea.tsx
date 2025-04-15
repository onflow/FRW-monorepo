import { Visibility, VisibilityOff } from '@mui/icons-material';
import { TextField, InputAdornment, IconButton, type TextFieldProps } from '@mui/material';
import React, { useState } from 'react';

type PasswordTextareaProps = Omit<
  TextFieldProps,
  'type' | 'InputProps' | 'multiline' | 'rows' // Keep these omitted as we add them back below
> & {
  minRows?: number;
  maxRows?: number;
};

const PasswordTextarea = ({
  minRows = 6, // Increased default row count to match screenshot
  maxRows,
  label,
  placeholder,
  value,
  onChange,
  required,
  className, // Keep className prop for potential non-sx styling
  sx, // Allow sx prop for styling
  ...rest // Pass through any other TextFieldProps
}: PasswordTextareaProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // Prevent focus loss on click
  };

  // Restyled to match the HTML structure in the screenshot
  const defaultSx = {
    width: '100%',
    padding: '0px',
    border: '1px solid #444444',
    // Root TextField container styling
    '& .MuiFormControl-root': {
      width: '100%',
      marginBottom: '16px',
    },
    // Main input container styling (the first div)
    '& .MuiInputBase-root': {
      width: '100%',
      borderRadius: '16px',
      backgroundColor: '#2C2C2C',
      color: '#fff',
      fontFamily: 'Inter',
      fontSize: '16px',
      fontWeight: 400,
      overflow: 'hidden',
    },
    // The actual textarea styling
    '& .MuiInputBase-input': {
      padding: '0px',
      resize: 'none',
      fontSize: '16px',
      fontFamily: 'Inter',
      fontWeight: 400,
      color: '#fff',
      boxSizing: 'border-box',
      WebkitTextSecurity: showPassword ? 'none' : 'disc',
      '&::placeholder': {
        color: '#a0a0a0',
        opacity: 1,
      },
      height: '138px', // Match the height from the screenshot
    },
    // Remove default outlined border
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
    '& .MuiInputAdornment-root': {
      margin: '0',
      height: 'auto',
    },
    '& .MuiInputAdornment-positionEnd': {
      paddingRight: '10px',
    },
    '& .MuiIconButton-root': {
      color: '#a0a0a0',
      padding: '8px',
    },
  };

  return (
    <TextField
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className={className}
      sx={{ ...defaultSx, ...sx }}
      fullWidth
      multiline
      rows={minRows}
      minRows={minRows}
      maxRows={maxRows}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={handleClickShowPassword}
              onMouseDown={handleMouseDownPassword}
              edge="end"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
      {...rest}
    />
  );
};

export default PasswordTextarea;
