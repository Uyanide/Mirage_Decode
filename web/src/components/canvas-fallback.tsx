import { Box, Button, Typography } from '@mui/material';

interface CanvasFallbackProps {
  text: string;
  action?: string;
  aspectRatio?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function CanvasFallback({ text, action, aspectRatio, onClick, disabled }: CanvasFallbackProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        aspectRatio: aspectRatio ?? '16/9',
        backgroundColor: 'background.paper',
        border: '1px dashed',
        borderColor: 'text.secondary',
        borderRadius: 2,
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
