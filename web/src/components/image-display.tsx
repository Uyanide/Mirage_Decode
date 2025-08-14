import { Box, Typography } from '@mui/material';
import type { PrismImage } from '../models/image';
import { useEffect, useRef } from 'react';

interface ImageDisplayProps {
  image: PrismImage | null;
  isBlackBackground: boolean;
  placeholderText?: string;
  aspectRatio?: string;
  highLight?: boolean;
}

export function ImageDisplay({ image, isBlackBackground, placeholderText, aspectRatio, highLight }: ImageDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
          border: '1px solid',
          borderColor: 'text.disabled',
          width: '100%',
          aspectRatio: aspectRatio ?? '16/9',
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="body1" color="text.secondary">
          {placeholderText ?? '空空如也(暂时) :/'}
        </Typography>
      </Box>
    );
  } else {
    return (
      <Box
        sx={{
          width: '100%',
          aspectRatio: aspectRatio ?? '16/9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isBlackBackground ? 'black' : 'white',
          border: highLight ? '3px solid' : 'none',
          borderColor: 'primary.main',
        }}
      >
        <canvas style={{ maxWidth: '100%', maxHeight: '100%' }} ref={canvasRef} />
      </Box>
    );
  }
}
