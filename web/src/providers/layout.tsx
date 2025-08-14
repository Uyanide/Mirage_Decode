import { useMediaQuery, useTheme } from '@mui/material';
import { useEffect } from 'react';
import { create } from 'zustand';

interface LayoutState {
  isDesktopMode: boolean;
  setDesktopMode: (isDesktop: boolean) => void;
  isLargeScreen: boolean;
  setLargeScreen: (isLarge: boolean) => void;
  screenWidth: number;
  setScreenWidth: (width: number) => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  isDesktopMode: false,
  setDesktopMode: (isDesktop) => {
    set({ isDesktopMode: isDesktop });
  },
  isLargeScreen: false,
  setLargeScreen: (isLarge) => {
    set({ isLargeScreen: isLarge });
  },
  screenWidth: window.innerWidth,
  setScreenWidth: (width) => {
    set({ screenWidth: width });
  },
}));

export const useDesktopModeInitializer = () => {
  const theme = useTheme();
  const isDesktopMode = useMediaQuery(theme.breakpoints.up('sm'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  const setDesktopMode = useLayoutStore((state) => state.setDesktopMode);
  const setLargeScreen = useLayoutStore((state) => state.setLargeScreen);
  const setScreenWidth = useLayoutStore((state) => state.setScreenWidth);

  useEffect(() => {
    setDesktopMode(isDesktopMode);
  }, [isDesktopMode, setDesktopMode]);

  useEffect(() => {
    setLargeScreen(isLargeScreen);
  }, [isLargeScreen, setLargeScreen]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenWidth(width);
      setDesktopMode(width >= theme.breakpoints.values.sm);
      setLargeScreen(width >= theme.breakpoints.values.lg);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [setDesktopMode, setScreenWidth, setLargeScreen, theme.breakpoints.values.sm, theme.breakpoints.values.lg]);
};

export const useDesktopMode = () => {
  return useLayoutStore((state) => state.isDesktopMode);
};

export const useScreenWidth = () => {
  return useLayoutStore((state) => state.screenWidth);
};

export const useLargeScreen = () => {
  return useLayoutStore((state) => state.isLargeScreen);
};
