import { Box, Button, Typography } from '@mui/material';
import { usePrismDecodeImagesStore } from '../providers/decode/state';
import { ImageDisplay } from '../components/image-display';
import { routes, useCurrentRouteStore } from '../providers/routes';

export function DecodeList() {
  const listState = usePrismDecodeImagesStore();
  const images = listState.images;
  const currImage = listState.currImage;
  const setCurrIndex = listState.setCurrIndex;
  const setImages = listState.setImages;
  const setRoute = useCurrentRouteStore((state) => state.setCurrentRoute);

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
        fullWidth
      >
        清空
      </Button>
      {images.map((image) => (
        <Box
          key={image.index}
          onClick={() => {
            setCurrIndex(image.index);
            setRoute(routes.decode);
          }}
          sx={{
            width: '100%',
          }}
        >
          <ImageDisplay image={image.image} highLight={currImage !== null && currImage.index === image.index} width="100%" />
        </Box>
      ))}
    </Box>
  );
}
