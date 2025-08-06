import React from 'react';
import { Text, type TextProps } from 'react-native';

interface AddressTextProps extends TextProps {
  value: string;
  className?: string;
  size?: string;
  truncate?: boolean; // Whether to truncate the address (default: true)
  isEVM?: boolean; // Explicitly specify if this is an EVM address
}

const AddressText: React.FC<AddressTextProps> = ({ value, className = 'text-fg-2', ...rest }) => {
  // Merge className and size
  const mergedClassName = `${className}`.trim();
  return (
    <Text
      numberOfLines={1}
      ellipsizeMode="middle"
      className={`font-inter font-normal text-xs leading-relaxed text-fg-2 ${mergedClassName}`}
      {...rest}
    >
      {value}
    </Text>
  );
};

export default AddressText;
