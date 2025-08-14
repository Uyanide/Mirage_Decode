import { LoadingProgress } from '../components/loading';

import { Box } from '@mui/material';

export default function Loading() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        backgroundColor: 'background.paper',
        padding: 2,
      }}
      className="transitionBg"
    >
      <LoadingProgress />
    </Box>
  );
}
