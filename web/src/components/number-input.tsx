import { TextField } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
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

type NumberInputControlledProps = {
  realValue: number;
  onSubmit: (value: number) => void;
  min?: number;
  max?: number;
  debounce?: number;
  [rest: string]: unknown;
};

export function NumberInputControlled({ min, max, onSubmit, realValue, debounce = 200, ...rest }: NumberInputControlledProps) {
  const [isValid, setIsValid] = useState(true);
  const [value, setValue] = useState(realValue.toString());
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setValue(realValue.toString());
    setIsValid(true);
  }, [realValue]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        const parsedValue = parseFloat(newValue);
        if (!isNaN(parsedValue) && (min === undefined || parsedValue >= min) && (max === undefined || parsedValue <= max)) {
          setIsValid(true);
          onSubmit(parsedValue);
        } else {
          setIsValid(false);
        }
      }, debounce);
    },
    [min, max, onSubmit, debounce]
  );

  return <TextField value={value} error={!isValid} onChange={handleChange} {...rest} />;
}
