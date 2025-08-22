import { Box } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

type DropAreaProps = {
  onDrop: (items: DataTransferItemList) => void;
  children?: React.ReactNode;
  disabled?: boolean;
  styles?: React.CSSProperties;
};

export function DropArea({ onDrop, children, disabled, styles }: DropAreaProps) {
  const areaRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    const element = areaRef.current;
    if (!element) return;
    if (disabled) return;

    const handleDragOver = (e: DragEvent) => {
      // console.log('Drag over');
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      // console.log('Drag leave');
      e.preventDefault();
      e.stopPropagation();
      if (!element.contains(e.relatedTarget as Node)) {
        setIsDragOver(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      // console.log('Drop');
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (e.dataTransfer?.items) {
        onDrop(e.dataTransfer.items);
      }
    };

    element.addEventListener('dragover', handleDragOver);
    element.addEventListener('dragenter', handleDragOver);
    element.addEventListener('dragleave', handleDragLeave);
    element.addEventListener('drop', handleDrop);

    return () => {
      element.removeEventListener('dragover', handleDragOver);
      element.removeEventListener('dragenter', handleDragOver);
      element.removeEventListener('dragleave', handleDragLeave);
      element.removeEventListener('drop', handleDrop);
    };
  }, [onDrop, disabled]);

  return (
    <Box ref={areaRef} sx={{ position: 'relative', width: '100%', height: '100%', ...styles }}>
      {children}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'text.primary',
          opacity: isDragOver ? 0.2 : 0,
          transition: 'opacity 0.2s ease-in-out',
          pointerEvents: 'none',
          zIndex: 114514,
        }}
      />
    </Box>
  );
}
