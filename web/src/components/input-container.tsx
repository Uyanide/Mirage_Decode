import { Box } from '@mui/material';

interface InputContainerProps {
  children: React.ReactNode;
}

export function InputContainer({ children }: InputContainerProps) {
  return (
    <Box
      sx={{
        width: '100%',
        border: '1.5px solid',
        borderColor: 'text.secondary',
        borderRadius: '8px',
        backgroundColor: 'background.paper',
        py: 2,
        px: 1,
      }}
    >
      {children}
    </Box>
  );
}
