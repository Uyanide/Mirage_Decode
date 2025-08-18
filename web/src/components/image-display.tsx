import { Box, Typography } from '@mui/material';
import type { PrismImage } from '../models/image';
import { useEffect, useRef } from 'react';
import { useThemeStore } from '../providers/theme';

interface ImageDisplayProps {
  image: PrismImage | null;
  width?: string;
  height?: string;
  isBlackBackground?: boolean;
  placeholderText?: string;
  aspectRatio?: string;
  highLight?: boolean;
}

export function ImageDisplay({
  image,
  isBlackBackground,
  placeholderText,
  aspectRatio,
  highLight,
  width,
  height,
}: ImageDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const themeMode = useThemeStore((state) => state.mode);
  const isDark = isBlackBackground ?? themeMode == 'dark';

  useEffect(() => {
    if (!image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = image.width();
    canvas.height = image.height();
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.putImageData(image.imageData, 0, 0);
    } else {
      console.error('无法获取 canvas 上下文');
    }
  }, [image]);

  if (!image) {
    return (
      <Box
        sx={{
          width: width,
          height: height,
          borderColor: 'text.disabled',
          aspectRatio: aspectRatio ?? '16/9',
          borderRadius: 1,
          border: '1.5px solid',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'background.paper',
        }}
      >
        <Typography variant="body1" color="text.secondary">
          {placeholderText ?? '(･_･`)>'}
        </Typography>
      </Box>
    );
  } else {
    return (
      <Box
        sx={{
          width: width,
          height: height,
          aspectRatio: aspectRatio ?? '16/9',
          backgroundColor: isDark ? 'black' : 'white',
          border: highLight ? '3px solid' : 'none',
          borderColor: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <canvas style={{ maxWidth: '100%', maxHeight: '100%' }} ref={canvasRef} />
      </Box>
    );
  }
}
