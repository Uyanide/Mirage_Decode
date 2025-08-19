import type { AlertColor } from '@mui/material';
import { create } from 'zustand';

type SnackbarState = {
  open: boolean;
  message: string;
  servirity: AlertColor;
  setOpen: (open: boolean) => void;
  setMessage: (message: string) => void;
  setServirity: (servirity: AlertColor) => void;
};

export const useSnackbarStore = create<SnackbarState>((set) => ({
  open: false,
  message: '',
  servirity: 'warning',
  setOpen: (open) => {
    set({ open });
  },
  setMessage: (message) => {
    set({ message });
  },
  setServirity: (servirity) => {
    set({ servirity });
  },
}));

export function showSnackBar(message: string, severity: AlertColor = 'warning') {
  const { open, setOpen, setMessage, setServirity } = useSnackbarStore.getState();

  if (open) {
    setOpen(false);
    setTimeout(() => {
      setMessage(message);
      setServirity(severity);
      setOpen(true);
    }, 100);
  } else {
    setServirity(severity);
    setMessage(message);
    setOpen(true);
  }
}

export function showWarningSnackbar(message: string) {
  showSnackBar(message, 'warning');
}

export function showErrorSnackbar(message: string) {
  showSnackBar(message, 'error');
}

export function showSuccessSnackbar(message: string) {
  showSnackBar(message, 'success');
}

export function showInfoSnackbar(message: string) {
  showSnackBar(message, 'info');
}
