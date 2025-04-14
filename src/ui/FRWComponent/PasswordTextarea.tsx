import { Visibility, VisibilityOff } from '@mui/icons-material';
import { TextField, InputAdornment, IconButton, type TextFieldProps } from '@mui/material';
import React, { useState } from 'react';

// Define the props, extending TextFieldProps but omitting props we manage internally
// Re-adding minRows/maxRows for multi-line
type PasswordTextareaProps = Omit<
  TextFieldProps,
  'type' | 'InputProps' | 'multiline' | 'rows' // Keep these omitted as we add them back below
> & {
  minRows?: number;
  maxRows?: number;
};

const PasswordTextarea = ({
  minRows = 3, // Default minimum rows for multi-line
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

  // No longer needed debug logs
  // const calculatedType = showPassword ? 'text' : 'password';

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // Prevent focus loss on click
  };

  // Adjust default styles to match JsonImport.tsx textarea
  const defaultSx = {
    width: '100%',
    marginBottom: '16px',
    '& .MuiInputBase-root': {
      borderRadius: '16px',
      backgroundColor: '#2C2C2C',
      color: '#fff',
      padding: '0px',
      boxSizing: 'border-box',
      alignItems: 'flex-start',
      border: '1px solid #444444',
    },
    '& .MuiInputBase-input': {
      padding: '20px',
      resize: 'none',
      fontSize: '16px',
      fontFamily: 'Inter',
      fontWeight: 400,
      color: '#fff',
      boxSizing: 'border-box',
      height: 'auto',
      '&::placeholder': {
        color: '#a0a0a0',
        opacity: 1,
      },
      WebkitTextSecurity: showPassword ? 'none' : 'disc',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
    '& .MuiInputAdornment-root': {
      margin: '0',
      paddingTop: '10px',
      alignSelf: 'flex-start',
    },
    '& .MuiInputAdornment-positionEnd': {
      alignItems: 'flex-start',
      paddingRight: '10px',
      marginRight: '0px',
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
      className={className} // Apply external className if provided
      sx={{ ...defaultSx, ...sx }} // Merge default styles with passed sx prop
      fullWidth // Default to fullWidth
      multiline // ADDED back multiline
      rows={minRows} // ADDED back rows (uses minRows for initial size)
      minRows={minRows} // ADDED back minRows
      maxRows={maxRows} // ADDED back maxRows
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
      {...rest} // Apply any remaining props
    />
  );
};

export default PasswordTextarea;
