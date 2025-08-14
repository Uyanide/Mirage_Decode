import styles from './loading.module.css';

import Backdrop from '@mui/material/Backdrop';

export const LoadingProgress = () => {
  return <div className={styles.loader}></div>;
};

export const LoadingOverlay = ({ open = true }: { open?: boolean }) => (
  <Backdrop
    sx={{
      zIndex: (theme) => theme.zIndex.drawer + 1,
    }}
    open={open}
  >
    <LoadingProgress />
  </Backdrop>
);
