import { Alert, Snackbar, type SnackbarCloseReason, type SnackbarOrigin } from '@mui/material';
import { useSnackbarStore } from '../providers/snackbar';
import { zIndex } from '../constants/layout';

const autoHideDuration = 5000;
const ancorOrigin: SnackbarOrigin = {
  vertical: 'bottom',
  horizontal: 'center',
};

export function GlobalSnackbar() {
  const { open, message, setOpen, servirity } = useSnackbarStore();

  const handleClose = (_?: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <Snackbar
      autoHideDuration={autoHideDuration}
      anchorOrigin={ancorOrigin}
      open={open}
      onClose={handleClose}
      sx={{
        zIndex: zIndex.snackbar,
      }}
    >
      <Alert
        onClose={handleClose}
        severity={servirity}
        variant="standard"
        sx={{
          width: '100%',
          fontSize: 'medium',
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
