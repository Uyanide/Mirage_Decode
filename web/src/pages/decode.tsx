import { useCallback, useEffect, useRef, useState } from 'react';
import { ImageLoaderMulti } from '../components/image-loader-multi';
import { defaultImages } from '../constants/default-arg';
import { usePrismDecodeImagesStore, usePrismDecodeStore, type PrismDecodeMethod } from '../providers/process/decode';
import { PrismImage } from '../models/image';
import { useSidebarStore } from '../providers/sidebar';
import { Box, Button, Input, MenuItem, Select, Slider, Typography } from '@mui/material';
import { DecodeCanvas, useDecodeCanvasStore } from '../algo/decode/canvas';
import { InputContainer } from '../components/input-container';
import { HelpButton } from '../components/help-button';
import type { ImageEncodeFormat } from '../services/image-encoder';
import { CanvasFallback } from '../components/canvas-fallback';
import { LoadImageFileData } from '../services/image-loader';
import { showErrorSnackbar, showSuccessSnackbar } from '../providers/snackbar';
import { LoadingOverlay } from '../components/loading';

export default function DecodePage() {
  const [loading, setLoading] = useState(false);

  const setImages = usePrismDecodeImagesStore((state) => state.setImages);

  const setSidebarShow = useSidebarStore((state) => state.setShow);

  const handleImagesLoaded = useCallback(
    (images: PrismImage[]) => {
      setImages(images);
      if (images.length > 1) {
        setSidebarShow(true);
      }
    },
    [setImages, setSidebarShow]
  );

  const handleLoadDefault = useCallback(() => {
    setLoading(true);
    (async () => {
      // await new Promise((resolve) => setTimeout(resolve, 10000)); // Simulate loading delay
      const arrayBuffers = await LoadImageFileData.fromAssets(defaultImages.decode);
      if (arrayBuffers.length === 0) {
        showErrorSnackbar('加载默认图片失败');
        return;
      }
      const image = await PrismImage.fromFileData(arrayBuffers[0]);
      setImages([image]);
    })()
      .catch((error: unknown) => {
        showErrorSnackbar('加载默认图片失败');
        console.error('加载默认图片失败:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [setImages]);

  const decodeCanvasRef = useRef<HTMLCanvasElement>(null);
  const setDecodeCanvas = useDecodeCanvasStore((state) => state.setDecodeCanvas);
  const currImage = usePrismDecodeImagesStore((state) => state.currImage);

  useEffect(() => {
    if (decodeCanvasRef.current) {
      const canvas = new DecodeCanvas(decodeCanvasRef.current);
      setDecodeCanvas(canvas);
      return () => {
        canvas.destroy();
      };
    }
  }, [setDecodeCanvas]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: 'sm',
        mx: 'auto',
        gap: 2,
        width: '100%',
      }}
    >
      {loading && <LoadingOverlay />}
      <ImageLoaderMulti onLoad={handleImagesLoaded} defaultImage={defaultImages.decode} disabled={loading}>
        <canvas
          ref={decodeCanvasRef}
          style={{
            width: '100%',
            height: '100%',
            display: currImage ? 'block' : 'none',
          }}
        ></canvas>
        {!currImage && (
          <CanvasFallback
            text={loading ? '加载中...' : '只是一张画布'}
            action="加载示例图片"
            onClick={handleLoadDefault}
            disabled={loading}
          ></CanvasFallback>
        )}
      </ImageLoaderMulti>
      <InputContainer>
        <ThresholdSlider />
        <Box sx={{ mt: 2 }} />
        <ContrastSlider />
      </InputContainer>
      <InputContainer>
        <MethodsInput />
      </InputContainer>
      <ImageSave />
    </Box>
  );
}

function ThresholdSlider() {
  const lowerThreshold = usePrismDecodeStore((state) => state.lowerThreshold);
  const higherThreshold = usePrismDecodeStore((state) => state.higherThreshold);

  const setLowerThreshold = usePrismDecodeStore((state) => state.setLowerThreshold);
  const setHigherThreshold = usePrismDecodeStore((state) => state.setHigherThreshold);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        px: 2,
        width: '100%',
        textAlign: 'center',
      }}
    >
      {' '}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'end',
          justifyContent: 'center',
          gap: 1,
          with: '100%',
        }}
      >
        <Typography variant="subtitle1">1. 阈值调整</Typography>
        <HelpButton message="大多数情况下只需要调整右端阈值" />
      </Box>
      <Slider
        value={[lowerThreshold, higherThreshold]}
        onChange={(_, v) => {
          setLowerThreshold(v[0]);
          setHigherThreshold(v[1]);
        }}
        min={0}
        max={255}
        step={1}
        valueLabelDisplay="auto"
      />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 1,
        }}
      >
        <Box sx={{ flex: 2 }} />
        <Input
          value={lowerThreshold}
          size="small"
          onChange={(e) => {
            const value = Number(e.target.value);
            if (!isNaN(value)) {
              setLowerThreshold(value);
            }
          }}
          inputProps={{
            step: 1,
            min: 0,
            max: 255,
            type: 'number',
          }}
          sx={{
            width: '100px',
          }}
        />

        <Box sx={{ flex: 1 }} />
        <Input
          value={higherThreshold}
          size="small"
          onChange={(e) => {
            const value = Number(e.target.value);
            if (!isNaN(value)) {
              setHigherThreshold(value);
            }
          }}
          inputProps={{
            step: 1,
            min: 0,
            max: 255,
            type: 'number',
          }}
          sx={{
            width: '100px',
          }}
        />

        <Box sx={{ flex: 2 }} />
      </Box>
    </Box>
  );
}

function ContrastSlider() {
  const contrast = usePrismDecodeStore((state) => state.contrast);
  const setContrast = usePrismDecodeStore((state) => state.setContrast);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        px: 2,
        width: '100%',
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 1,
          with: '100%',
          justifyContent: 'center',
        }}
      >
        <Typography variant="subtitle1">2. 对比度调整</Typography>
      </Box>
      <Slider
        value={contrast}
        onChange={(_, v) => {
          setContrast(v);
        }}
        min={0}
        max={100}
        step={1}
        valueLabelDisplay="auto"
      />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 1,
        }}
      >
        <Box sx={{ flex: 2 }} />
        <Input
          value={contrast}
          size="small"
          onChange={(e) => {
            const value = Number(e.target.value);
            if (!isNaN(value)) {
              setContrast(value);
            }
          }}
          inputProps={{
            step: 1,
            min: 0,
            max: 255,
            type: 'number',
          }}
          sx={{
            width: '100px',
          }}
        />

        <Box sx={{ flex: 1 }} />
        <Button
          size="small"
          onClick={() => {
            setContrast(50);
          }}
          sx={{
            width: '100px',
          }}
        >
          重置对比度
        </Button>

        <Box sx={{ flex: 2 }} />
      </Box>
    </Box>
  );
}

function MethodsInput() {
  const method = usePrismDecodeStore((state) => state.method);
  const setMethod = usePrismDecodeStore((state) => state.setMethod);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
      }}
    >
      <Typography variant="subtitle1">3. 其他像素处理方式:</Typography>
      <Select
        value={method}
        size="small"
        onChange={(e) => {
          setMethod(e.target.value as PrismDecodeMethod);
        }}
      >
        <MenuItem value="ltavg">临近平均</MenuItem>
        <MenuItem value="lcopy">左侧复制</MenuItem>
        <MenuItem value="tcopy">上方复制</MenuItem>
        <MenuItem value="transparent">置为透明</MenuItem>
        <MenuItem value="black">置为黑色</MenuItem>
        <MenuItem value="white">置为白色</MenuItem>
      </Select>
      <HelpButton message="此选项不会大幅影响显形质量" />
    </Box>
  );
}

function ImageSave() {
  const saveFormat = usePrismDecodeStore((state) => state.saveFormat);
  const setSaveFormat = usePrismDecodeStore((state) => state.setSaveFormat);

  const decodeCanvas = useDecodeCanvasStore((state) => state.decodeCanvas);

  const handleSaveCurrent = useCallback(
    (format: ImageEncodeFormat) => {
      decodeCanvas
        ?.saveCurrentImage(format)
        .then((fileName) => {
          showSuccessSnackbar(`已保存为: ${fileName}`);
        })
        .catch((error: unknown) => {
          console.error('Failed to save image:', error);
          showErrorSnackbar(`保存显示图像失败`);
        });
    },
    [decodeCanvas]
  );

  const handleSaveOriginal = useCallback(
    (format: ImageEncodeFormat) => {
      decodeCanvas
        ?.saveOriginalImage(format)
        .then((fileName) => {
          showErrorSnackbar(`已保存原始图像为: ${fileName}`);
        })
        .catch((error: unknown) => {
          console.error('Failed to save original image:', error);
          showErrorSnackbar(`保存原始图像失败`);
        });
    },
    [decodeCanvas]
  );

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        gap: 1,
      }}
    >
      <Button
        sx={{ flex: 1 }}
        variant="contained"
        onClick={() => {
          handleSaveCurrent(saveFormat);
        }}
      >
        保存显示图像
      </Button>
      <Button
        sx={{ flex: 1 }}
        variant="contained"
        color="secondary"
        onClick={() => {
          handleSaveOriginal(saveFormat);
        }}
      >
        保存原始图像
      </Button>
      <Select
        value={saveFormat}
        variant="standard"
        onChange={(e) => {
          setSaveFormat(e.target.value as ImageEncodeFormat);
        }}
        sx={{ minWidth: 80 }}
      >
        <MenuItem value="JPEG">JPEG</MenuItem>
        <MenuItem value="PNG">PNG</MenuItem>
      </Select>
    </Box>
  );
}
