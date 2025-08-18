import { Box, Button, Dialog, TextField } from '@mui/material';
import { PrismImage } from '../models/image';
import { Check } from '@mui/icons-material';
import { itemHeight, zIndex } from '../constants/layout';
import { useCallback, useState } from 'react';
import { ImageDisplay } from './image-display';
import { DropArea } from './drop-area';
import { LoadImageFileData } from '../services/image-loader';
import { LoadingProgress } from './loading';
import { showErrorSnackbar, showSuccessSnackbar, showWarningSnackbar } from '../providers/snackbar';

interface ImageLoaderProps {
  onconfirm: (image: PrismImage) => void;
  oncancel: () => void;
  defaultImage?: string;
}

interface ImageLoaderDialogProps {
  onconfirm: (image: PrismImage) => void;
  label?: string;
  disabled?: boolean;
  defaultImage?: string;
}

export function ImageLoader({ onconfirm, oncancel, defaultImage }: ImageLoaderProps) {
  const [image, setImage] = useState<PrismImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState<string>('');

  const wrapImageLoad = useCallback((getFileData: () => Promise<Uint8Array[]>) => {
    (async () => {
      setLoading(true);
      const data = await getFileData();
      if (data.length === 0) {
        showWarningSnackbar('没有图片被成功加载');
        return;
      }
      const selectedImage = await PrismImage.fromFileData(data[0]);
      showSuccessSnackbar('成功加载 1 张图片');
      setImage(selectedImage);
    })()
      .catch((error: unknown) => {
        console.error('加载图片失败:', error);
        showErrorSnackbar('加载图片失败');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleFileSelect = () => {
    return LoadImageFileData.fromFileSelect(false);
  };

  const handleUrlConfirm = (url: string) => {
    return LoadImageFileData.fromFetch(url);
  };

  const handleDrop = (items: DataTransferItemList) => {
    return LoadImageFileData.fromDropItems(items, false);
  };

  const handlePasteDirect = () => {
    return LoadImageFileData.fromPasteDirect(false);
  };

  const handleDefaultImage = (): Promise<Uint8Array[]> => {
    if (defaultImage) {
      return LoadImageFileData.fromAssets(defaultImage);
    }
    return Promise.resolve([]);
  };

  const handleReset = () => {
    setImage(null);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        padding: 2,
        backgroundColor: 'background.paper',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        <Button
          sx={{ flex: 1, height: itemHeight.medium }}
          variant="contained"
          component="label"
          onClick={() => {
            wrapImageLoad(handleFileSelect);
          }}
          disabled={loading}
        >
          选择
        </Button>
        <Button
          sx={{ flex: 1, height: itemHeight.medium }}
          variant="contained"
          component="label"
          onClick={() => {
            wrapImageLoad(handlePasteDirect);
          }}
          disabled={loading}
        >
          粘贴
        </Button>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'stretch',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        <TextField
          sx={{
            flex: 1,
            height: itemHeight.medium,
          }}
          label="URL (http(s)://...)"
          size="small"
          variant="outlined"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
          }}
        />
        <Button
          sx={{
            aspectRatio: 1,
            height: itemHeight.medium,
            minWidth: 0,
            padding: 0,
          }}
          component="label"
          onClick={() => {
            wrapImageLoad(() => handleUrlConfirm(url));
          }}
          disabled={loading || !url}
        >
          <Check />
        </Button>
      </Box>
      {defaultImage && (
        <Button
          variant="contained"
          onClick={() => {
            wrapImageLoad(handleDefaultImage);
          }}
          disabled={loading}
        >
          加载示例图像
        </Button>
      )}
      <DropArea
        onDrop={(items) => {
          wrapImageLoad(() => handleDrop(items));
        }}
        disabled={loading}
      >
        {loading ? (
          <Box
            sx={{
              width: '100%',
              aspectRatio: '16/9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LoadingProgress />
          </Box>
        ) : (
          <ImageDisplay image={image} placeholderText="也可拖拽到此处" width="100%" />
        )}
      </DropArea>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        <Button variant="text" onClick={oncancel}>
          取消
        </Button>
        <Button variant="text" color="error" disabled={image === null} onClick={handleReset}>
          重置
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button
          variant="text"
          onClick={() => {
            if (image) onconfirm(image);
          }}
          color="success"
          disabled={image === null}
        >
          确认
        </Button>
      </Box>
    </Box>
  );
}

export function ImageLoaderDialog({ onconfirm, label, disabled, defaultImage }: ImageLoaderDialogProps) {
  const [open, setOpen] = useState(false);

  const handleToggleOpen = () => {
    setOpen(!open);
  };

  const handleConfirm = (image: PrismImage) => {
    onconfirm(image);
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <>
      <Button variant="contained" onClick={handleToggleOpen} fullWidth disabled={disabled}>
        {label ?? '加载图片'}
      </Button>
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        maxWidth="sm"
        fullWidth
        sx={{ zIndex: zIndex.dialog }}
      >
        <ImageLoader oncancel={handleCancel} onconfirm={handleConfirm} defaultImage={defaultImage} />
      </Dialog>
    </>
  );
}
