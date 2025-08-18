import { lazy } from 'react';
import { create } from 'zustand';

const DecodePage = lazy(() => import('../pages/decode'));
const EncodePage = lazy(() => import('../pages/encode'));
const AdvancedEncodePage = lazy(() => import('../pages/advanced-encode'));

interface CurrentRouteStore {
  currentRoute: string;
  setCurrentRoute: (route: string) => void;
}

export const useCurrentRouteStore = create<CurrentRouteStore>((set) => ({
  currentRoute: '/decode',
  setCurrentRoute: (route) => {
    if (route === '') route = '/decode';
    set({ currentRoute: route });
  },
}));

export type Page = {
  title: string;
  route: string;
  build: React.ComponentType;
};

export const Pages: Record<string, Page> = {
  '/decode': {
    title: '显形',
    route: '/decode',
    build: () => <DecodePage />,
  },
  '/encode': {
    title: '制作',
    route: '/encode',
    build: () => <EncodePage />,
  },
  '/advanced-encode': {
    title: '高级',
    route: '/advanced-encode',
    build: () => <AdvancedEncodePage />,
  },
};
