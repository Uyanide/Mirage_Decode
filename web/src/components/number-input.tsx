import { TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useDebounce } from '../utils/hooks/debounce';

type NumberInputProps = {
  initValue: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  debounce?: number;
  [rest: string]: unknown;
};

export function NumberInput({ initValue, onChange, debounce = 200, min, max, ...rest }: NumberInputProps) {
  const [value, setValue] = useState(initValue.toString());
  const [isValid, setIsValid] = useState(true);
  const debouncedValue = useDebounce(value, debounce);

  useEffect(() => {
    const parsedValue = parseFloat(debouncedValue);
    if (!isNaN(parsedValue) && (min === undefined || parsedValue >= min) && (max === undefined || parsedValue <= max)) {
      setIsValid(true);
      onChange(parsedValue);
    } else {
      setIsValid(false);
    }
  }, [debouncedValue, onChange, min, max]);

  return (
    <TextField
      value={value}
      error={!isValid}
      onChange={(e) => {
        setValue(e.target.value);
      }}
      {...rest}
    />
  );
}
