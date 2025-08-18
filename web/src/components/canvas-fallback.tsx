import { Box, Button, Typography } from '@mui/material';

interface CanvasFallbackProps {
  text: string;
  action?: string;
  aspectRatio?: string;
  onClick?: () => void;
  disabled?: boolean;
  styles?: React.CSSProperties;
}

export function CanvasFallback({ text, action, aspectRatio, onClick, disabled, styles }: CanvasFallbackProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        aspectRatio: aspectRatio ?? '16/9',
        backgroundColor: 'background.paper',
        border: '1px dashed',
        borderColor: 'text.secondary',
        borderRadius: 2,
        ...styles,
      }}
    >
      <Typography variant="subtitle1" sx={{ mb: 1, color: 'text.secondary' }}>
        {text}
      </Typography>
      {action && (
        <Button variant="contained" onClick={onClick} disabled={!onClick || disabled}>
          {action}
        </Button>
      )}
    </Box>
  );
}
