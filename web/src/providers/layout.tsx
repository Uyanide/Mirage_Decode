import { useMediaQuery, useTheme } from '@mui/material';
import { useEffect } from 'react';
import { create } from 'zustand';

type LayoutState = {
  isDesktopMode: boolean;
  setDesktopMode: (is: boolean) => void;
  isSmallScreen: boolean;
  setSmallScreen: (is: boolean) => void;
  screenWidth: number;
  setScreenWidth: (width: number) => void;
};

export const useLayoutStore = create<LayoutState>((set) => ({
  isDesktopMode: false,
  setDesktopMode: (isDesktop) => {
    set({ isDesktopMode: isDesktop });
  },
  isSmallScreen: false,
  setSmallScreen: (isSmall) => {
    set({ isSmallScreen: isSmall });
  },
  screenWidth: window.innerWidth,
  setScreenWidth: (width) => {
    set({ screenWidth: width });
  },
}));

export const useDesktopModeInitializer = () => {
  const theme = useTheme();
  const isDesktopMode = useMediaQuery(theme.breakpoints.up('lg'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const setDesktopMode = useLayoutStore((state) => state.setDesktopMode);
  const setSmallScreen = useLayoutStore((state) => state.setSmallScreen);
  const setScreenWidth = useLayoutStore((state) => state.setScreenWidth);

  useEffect(() => {
    setDesktopMode(isDesktopMode);
  }, [isDesktopMode, setDesktopMode]);

  useEffect(() => {
    setSmallScreen(isSmallScreen);
  }, [isSmallScreen, setSmallScreen]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenWidth(width);
      setDesktopMode(width >= theme.breakpoints.values.lg);
      setSmallScreen(width < theme.breakpoints.values.sm);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [setDesktopMode, setScreenWidth, setSmallScreen, theme.breakpoints.values.lg, theme.breakpoints.values.sm]);
};

export const useDesktopMode = () => {
  return useLayoutStore((state) => state.isDesktopMode);
};

export const useScreenWidth = () => {
  return useLayoutStore((state) => state.screenWidth);
};

export const useSmallScreen = () => {
  return useLayoutStore((state) => state.isSmallScreen);
};
