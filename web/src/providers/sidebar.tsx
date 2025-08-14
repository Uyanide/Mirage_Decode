import { create } from 'zustand';

interface SidebarState {
  show: boolean;
  setShow: (show: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  show: false,
  setShow: (show) => {
    set({ show });
  },
}));
