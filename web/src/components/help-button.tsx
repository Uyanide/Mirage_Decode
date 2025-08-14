import InfoIcon from '@mui/icons-material/Info';
import { IconButton } from '@mui/material';
import { showInfoSnackbar } from '../providers/snackbar';

interface HelpButtonProps {
  message: string;
}

export function HelpButton({ message }: HelpButtonProps) {
  return (
    <IconButton
      size="small"
      color="primary"
      onClick={() => {
        showInfoSnackbar(message);
      }}
    >
      <InfoIcon fontSize="small" />
    </IconButton>
  );
}
