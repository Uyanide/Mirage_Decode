import { Box, Typography } from '@mui/material';
import { useCurrentRouteStore, type Page, Pages } from '../providers/routes';
import { useThemeStore } from '../providers/theme';
import Loading from './loading';
import { Suspense } from 'react';

export function MainContent() {
  const currentRouteStore = useCurrentRouteStore();
  const currentRoute = currentRouteStore.currentRoute;
  const setCurrentRoute = currentRouteStore.setCurrentRoute;

  const palette = useThemeStore((state) => state.palette);

  const CurrentPage = Pages[currentRoute].build;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 'lg',
        width: '100%',
        mx: 'auto',
      }}
    >
      <TabNavigation currentRoute={currentRoute} setCurrentRoute={setCurrentRoute} pages={Pages} />
      <Box
        sx={{
          px: 4,
          py: 3,
          backgroundColor: palette.SecondaryBackground,
          borderRadius: '0 0 16px 16px',
          width: '100%',
        }}
      >
        <Suspense fallback={<Loading />}>
          <CurrentPage />
        </Suspense>
      </Box>
    </Box>
  );
}

function TabNavigation({
  currentRoute,
  setCurrentRoute,
  pages,
}: {
  currentRoute: string;
  setCurrentRoute: (route: string) => void;
  pages: Record<string, Page>;
}) {
  const palette = useThemeStore((state) => state.palette);

  const selectedColor = palette.SecondaryBackground;
  const unselectedColor = palette.SecondaryNotselectedBackground;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        gap: 0.5,
      }}
    >
      {Object.entries(pages).map(([route, page]) => (
        <Box
          key={route}
          sx={{
            flex: 1,
            p: 2,
            cursor: 'pointer',
            backgroundColor: currentRoute === route ? selectedColor : unselectedColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '16px 16px 0 0',
          }}
          onClick={() => {
            setCurrentRoute(route);
          }}
        >
          <Typography variant="body1" fontWeight={'bold'}>
            {page.title}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
