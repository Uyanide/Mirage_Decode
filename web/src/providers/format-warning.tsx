import { create } from 'zustand';

export const useFormatWarningStore = create<{
  showWarning: boolean;
  setShowWarning: (show: boolean) => void;
}>((set) => ({
  showWarning: true,
  setShowWarning: (show: boolean) => {
    set({ showWarning: show });
  },
}));
