import { MenuItem, Select } from '@mui/material';
import { useAvailableFormatsStore } from '../providers/format';
import type { ImageEncodeFormat } from '../services/image-encoder';

interface FormatSelectorProps {
  format: ImageEncodeFormat;
  onChange: (format: ImageEncodeFormat) => void;
  disabled?: boolean;
}

export function FormatSelector({ format, onChange, disabled }: FormatSelectorProps) {
  const availableFormats = useAvailableFormatsStore((state) => state.availableFormats);

  const value = availableFormats.includes(format) ? format : availableFormats.length > 0 ? availableFormats[0] : null;

  if (value && value !== format) {
    onChange(value);
    return null;
  }

  return (
    <Select
      value={value}
      variant="standard"
      onChange={(e) => {
        if (e.target.value) onChange(e.target.value as ImageEncodeFormat);
      }}
      sx={{ minWidth: 80 }}
      disabled={disabled}
    >
      {availableFormats.map((fmt) => (
        <MenuItem key={fmt} value={fmt}>
          {fmt}
        </MenuItem>
      ))}
    </Select>
  );
}
