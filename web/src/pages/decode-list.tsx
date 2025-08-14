import { Box, Button, Container, Typography } from '@mui/material';
import { usePrismDecodeImagesStore } from '../providers/process/decode';
import { ImageDisplay } from '../components/image-display';
import { useThemeStore } from '../providers/theme';

export function DecodeList() {
  const listState = usePrismDecodeImagesStore();
  const images = listState.images;
  const currImage = listState.currImage;
  const setCurrIndex = listState.setCurrIndex;
  const setImages = listState.setImages;

  const themeMode = useThemeStore((state) => state.mode);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        padding: 2,
        backgroundColor: 'transparent',
        alignContent: 'center',
        justifyContent: 'begin',
        gap: 1,
      }}
    >
      <Typography variant="h6" align="center" fontWeight={'bold'}>
        显形图片列表
      </Typography>
      <Typography variant="subtitle1" align="center">
        总数: {images.length}
      </Typography>
      <Button
        variant="contained"
        onClick={() => {
          setImages([]);
        }}
      >
        清空
      </Button>
      {images.map((image) => (
        <Container
          key={image.index}
          onClick={() => {
            setCurrIndex(image.index);
          }}
          sx={{
            padding: 0,
          }}
        >
          <ImageDisplay
            image={image.image}
            isBlackBackground={themeMode === 'dark'}
            highLight={currImage !== null && currImage.index === image.index}
          />
        </Container>
      ))}
    </Box>
  );
}
