import { Box, Button } from '@mui/material';
import { PrismImage } from '../models/image';
import { ImageLoaderDialog } from './image-loader';
import { DropArea } from './drop-area';
import { useCallback, useState } from 'react';
import { LoadImageFileData } from '../services/image-loader';
import { LoadingOverlay } from './loading';
import { showSuccessSnackbar, showWarningSnackbar } from '../providers/snackbar';

type ImageLoaderMultiProps = {
  onLoad: (images: PrismImage[]) => void;
  children?: React.ReactNode;
  defaultImage?: string;
  disabled?: boolean;
};

export function ImageLoaderMulti({ onLoad, children, defaultImage, disabled }: ImageLoaderMultiProps) {
  const [loading, setLoading] = useState(false);

  const wrapImageLoad = useCallback(
    (getFileData: () => Promise<Uint8Array[]>) => {
      (async () => {
        setLoading(true);
        const datas = await getFileData();
        if (datas.length === 0) {
          showWarningSnackbar('没有图片被加载');
          return;
        }
        const promises = datas.map((buffer) => {
          return new Promise<PrismImage | null>((resolve) => {
            PrismImage.fromFileData(buffer)
              .then((image) => {
                resolve(image);
              })
              .catch((error: unknown) => {
                console.error('加载图片失败:', error);
                resolve(null);
              });
          });
        });
        const images = await Promise.all(promises);
        const filtered = images.filter((i) => i !== null);
        if (filtered.length === 0) {
          return;
        }
        showSuccessSnackbar(`成功加载 ${filtered.length.toString()} 张图片`);
        onLoad(filtered);
      })()
        .catch((error: unknown) => {
          console.error('加载图片失败:', error);
          showWarningSnackbar('加载图片失败');
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [onLoad]
  );

  const handelFileSelect = () => {
    return LoadImageFileData.fromFileSelect(true);
  };

  const handleDrop = (items: DataTransferItemList) => {
    return LoadImageFileData.fromDropItems(items, true);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        width: '100%',
      }}
    >
      {loading && <LoadingOverlay />}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          width: '100%',
        }}
      >
        <Box sx={{ flex: 1 }}>
          <ImageLoaderDialog
            onconfirm={(i) => {
              onLoad([i]);
            }}
            label="加载单张"
            disabled={loading || disabled}
            defaultImage={defaultImage}
          />
        </Box>

        <Box sx={{ flex: 1 }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              wrapImageLoad(handelFileSelect);
            }}
            fullWidth
            disabled={loading || disabled}
          >
            加载多张
          </Button>
        </Box>
      </Box>
      <DropArea
        onDrop={(i) => {
          wrapImageLoad(() => handleDrop(i));
        }}
        disabled={loading || disabled}
      >
        {children}
      </DropArea>
    </Box>
  );
}
