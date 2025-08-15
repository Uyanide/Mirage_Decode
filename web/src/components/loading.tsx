import { zIndex } from '../constants/layout';
import styles from './loading.module.css';

import Backdrop from '@mui/material/Backdrop';

export const LoadingProgress = () => {
  return <div className={styles.loader}></div>;
};

export const LoadingOverlay = ({ open = true }: { open?: boolean }) => (
  <Backdrop
    sx={{
      zIndex: zIndex.backdrop,
    }}
    open={open}
  >
    <LoadingProgress />
  </Backdrop>
);
