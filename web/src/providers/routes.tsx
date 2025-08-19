import { lazy } from 'react';
import { create } from 'zustand';

const DecodePage = lazy(() => import('../pages/decode'));
const EncodePage = lazy(() => import('../pages/encode'));
const AdvancedEncodePage = lazy(() => import('../pages/advanced-encode'));

export const routes = {
  decode: '/decode',
  encode: '/encode',
  advancedEncode: '/advanced-encode',
};

type CurrentRouteStore = {
  currentRoute: string;
  setCurrentRoute: (route: string) => void;
};

export const useCurrentRouteStore = create<CurrentRouteStore>((set) => ({
  currentRoute: routes.decode,
  setCurrentRoute: (route) => {
    if (route === '') route = routes.decode;
    if (!Object.values(routes).includes(route)) route = routes.decode;
    set((state) => {
      if (state.currentRoute === route) return state;
      return { currentRoute: route };
    });
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
    route: routes.decode,
    build: () => <DecodePage />,
  },
  '/encode': {
    title: '制作',
    route: routes.encode,
    build: () => <EncodePage />,
  },
  '/advanced-encode': {
    title: '高级',
    route: routes.advancedEncode,
    build: () => <AdvancedEncodePage />,
  },
};
