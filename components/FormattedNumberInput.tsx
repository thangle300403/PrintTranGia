import React, { useState, useEffect, useRef } from 'react';

interface FormattedNumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number | '';
  onChange: (value: number) => void;
}

const formatNumber = (num: number | ''): string => {
  if (num === '' || num === null || isNaN(Number(num))) {
    return '';
  }
  return Number(num).toLocaleString('vi-VN');
};

const FormattedNumberInput: React.FC<FormattedNumberInputProps> = ({ value, onChange, ...props }) => {
  const [currentValue, setCurrentValue] = useState(formatNumber(value));
  const inputRef = useRef<HTMLInputElement>(null);

  // When the external value prop changes, update the internal display value.
  // This is important if the value is changed programmatically from outside.
  useEffect(() => {
    // Only update if the parsed value is different, to avoid interrupting user input.
    const numericInternalValue = parseInt(currentValue.replace(/\D/g, ''), 10) || 0;
    if (numericInternalValue !== value) {
        setCurrentValue(formatNumber(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value: rawValue, selectionStart } = e.target;
    const input = inputRef.current;
    if (!input) return;

    // Store the number of digits before the cursor in the raw input
    const digitsBeforeCursor = (rawValue.substring(0, selectionStart ?? 0).match(/\d/g) || []).length;
    
    // Get the pure numeric string and value
    const numericString = rawValue.replace(/[^0-9]/g, '');
    const numericValue = numericString === '' ? 0 : parseInt(numericString, 10);
    
    // Call the parent onChange with the numeric value
    onChange(numericValue);

    // Format the number for display
    const formattedValue = formatNumber(numericValue);
    setCurrentValue(formattedValue);
    
    // Defer cursor update to after the re-render, which is caused by setCurrentValue
    setTimeout(() => {
        if (!input) return;
        
        // Calculate the new cursor position by finding where the Nth digit is
        let newCursorPos = 0;
        let digitsCounted = 0;

        // Find the position right after the Nth digit
        while (digitsCounted < digitsBeforeCursor && newCursorPos < formattedValue.length) {
            if (/\d/.test(formattedValue[newCursorPos])) {
                digitsCounted++;
            }
            newCursorPos++;
        }
        
        // If cursor was after the last digit, keep it there
        if (digitsBeforeCursor === numericString.length) {
            newCursorPos = formattedValue.length;
        } else {
            // Skip over any non-digit characters (separators) at the new position
            // to land right before the next digit.
            while(newCursorPos < formattedValue.length && !/\d/.test(formattedValue[newCursorPos])) {
                newCursorPos++;
            }
        }
        
        input.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };
  
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
    if(props.onFocus) {
        props.onFocus(e);
    }
  }

  return (
    <input
      ref={inputRef}
      {...props}
      type="text"
      value={currentValue}
      onFocus={handleFocus}
      onChange={handleChange}
      inputMode="numeric"
    />
  );
};

export default FormattedNumberInput;
