import { Box, Typography, FormGroup } from '@mui/material';
import React, { useState, useEffect } from 'react';

import CheckCircleIcon from '@/components/iconfont/IconCheckmark';
import CancelIcon from '@/components/iconfont/IconClose';
import { PasswordInput } from '@/ui/FRWComponent/PasswordComponents';
import SlideRelative from '@/ui/FRWComponent/SlideRelative';

interface PasswordFieldConfig {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  showIndicator?: boolean;
  endAdornment?: React.ReactNode;
  sx?: any;
  visibilitySx?: any;
}

interface PasswordFormProps {
  fields: PasswordFieldConfig[];
  onValidationChange?: (validationState: { characters: boolean; match: boolean }) => void;
  className?: string;
  minLength?: number;
  requireMatch?: boolean;
  matchFields?: [number, number];
  autoFocus?: boolean;
}

const PasswordForm: React.FC<PasswordFormProps> = ({
  fields,
  onValidationChange,
  className,
  minLength = 8,
  requireMatch = false,
  matchFields = [0, 1],
  autoFocus = false,
}) => {
  const [visibilityStates, setVisibilityStates] = useState<boolean[]>(
    new Array(fields.length).fill(false)
  );
  const [isCharactersValid, setCharactersValid] = useState(false);
  const [isMatchValid, setMatchValid] = useState(!requireMatch);

  // Toggle visibility for a specific field
  const toggleVisibility = (index: number) => {
    const newStates = [...visibilityStates];
    newStates[index] = !newStates[index];
    setVisibilityStates(newStates);
  };

  // Extract field values for dependency array
  const fieldValues = fields.map((f) => f.value);

  // Validation effects
  useEffect(() => {
    // Length validation for first field
    const primaryField = fields[0];
    const isLengthValid = primaryField?.value?.length >= minLength;
    setCharactersValid(isLengthValid);

    // Check if fields should match
    if (requireMatch && fields.length > Math.max(...matchFields)) {
      const field1 = fields[matchFields[0]].value;
      const field2 = fields[matchFields[1]].value;
      setMatchValid(field1 === field2 && field1.length > 0);
    }

    // Report validation state
    if (onValidationChange) {
      onValidationChange({
        characters: isCharactersValid,
        match: isMatchValid,
      });
    }
  }, [
    fieldValues,
    minLength,
    requireMatch,
    fields,
    matchFields,
    isCharactersValid,
    isMatchValid,
    onValidationChange,
  ]);

  // Helper components for validation feedback
  const successInfo = (message: string) => (
    <Box
      sx={{
        width: '95%',
        backgroundColor: 'success.light',
        mx: 'auto',
        borderRadius: '0 0 12px 12px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <CheckCircleIcon size={24} color={'#41CC5D'} style={{ margin: '8px' }} />
      <Typography variant="body1" color="success.main" sx={{ fontSize: '12px' }}>
        {message}
      </Typography>
    </Box>
  );

  const errorInfo = (message: string) => (
    <Box
      sx={{
        width: '95%',
        backgroundColor: 'error.light',
        mx: 'auto',
        borderRadius: '0 0 12px 12px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <CancelIcon size={24} color={'#E54040'} style={{ margin: '8px' }} />
      <Typography variant="body1" color="error.main" sx={{ fontSize: '12px' }}>
        {message}
      </Typography>
    </Box>
  );

  return (
    <FormGroup sx={{ width: '100%' }}>
      {fields.map((field, index) => (
        <Box
          key={index}
          sx={{
            width: '100%',
            pb: requireMatch && index === matchFields[0] ? '30px' : '0px',
            marginTop: index > 0 ? (fields[index - 1].value ? '0px' : '24px') : '0px',
          }}
        >
          {field.label && (
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: '500',
                marginTop: index > 0 ? '8px' : '0px',
                marginBottom: '4px',
              }}
            >
              {field.label}
            </Typography>
          )}

          <PasswordInput
            value={field.value}
            onChange={field.onChange}
            isVisible={visibilityStates[index]}
            setVisible={() => toggleVisibility(index)}
            className={className}
            autoFocus={index === 0 && autoFocus}
            placeholder={field.placeholder}
            showIndicator={field.showIndicator}
            sx={field.sx}
            visibilitySx={field.visibilitySx}
            endAdornment={field.endAdornment}
          />

          {index === 0 && field.value && (
            <SlideRelative show={!!field.value} direction="down">
              {isCharactersValid
                ? successInfo(chrome.i18n.getMessage('At__least__8__characters'))
                : errorInfo(chrome.i18n.getMessage('At__least__8__characters'))}
            </SlideRelative>
          )}

          {requireMatch && index === matchFields[1] && field.value && (
            <SlideRelative show={!!field.value} direction="down">
              {isMatchValid
                ? successInfo(chrome.i18n.getMessage('Passwords__match'))
                : errorInfo(chrome.i18n.getMessage('Your__passwords__do__not__match'))}
            </SlideRelative>
          )}
        </Box>
      ))}
    </FormGroup>
  );
};

export default PasswordForm;
