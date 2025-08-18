import { Box, Button, Grid, Input, Select, Slider, Switch, Typography } from '@mui/material';
import { InputContainer } from '../components/input-container';
import { ImageLoaderDialog } from '../components/image-loader';
import { useDesktopMode, useSmallScreen } from '../providers/layout';
import { HelpButton } from '../components/help-button';
import { CanvasFallback } from '../components/canvas-fallback';

export default function AdvancesEncodePage() {
  const desktop = useDesktopMode();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: desktop ? 'lg' : 'sm',
        mx: 'auto',
      }}
    >
      <ImageInputs />
    </Box>
  );
}

function ImageInputs() {
  const desktop = useDesktopMode();

  return (
    <Grid container spacing={2} maxWidth={desktop ? 'lg' : 'sm'}>
      <Grid size={desktop ? 6 : 12}>
        <ImageConfig index={0} />
      </Grid>

      <Grid size={desktop ? 6 : 12}>
        <ImageConfig index={1} />
      </Grid>

      <Grid size={desktop ? 6 : 12}>
        <ImageConfig index={2} />
      </Grid>

      <Grid size={desktop ? 6 : 12}>
        <ImageConfig index={3} />
      </Grid>
    </Grid>
  );
}

interface ImageConfigProps {
  index: number;
}

function ImageConfig({ index }: ImageConfigProps) {
  return (
    <InputContainer>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          gap: 2,
          alignItems: 'center',
          overflowX: 'auto',
        }}
      >
        <ImageInput index={index} />
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Typography variant="body1">1. 色阶端点:</Typography>
            <Box sx={{ flex: 1 }} />
            <HelpButton message="建议避免和其他输入图片的色阶重叠" />
          </Box>
          <Slider value={[10, 20]} min={0} max={255} step={1} />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: 1,
            }}
          >
            <Input
              value={10}
              inputProps={{
                step: 1,
                min: 0,
                max: 255,
                type: 'number',
              }}
              sx={{
                width: '80px',
              }}
            />
            <Input
              value={10}
              inputProps={{
                step: 1,
                min: 0,
                max: 255,
                type: 'number',
              }}
              sx={{
                width: '80px',
              }}
            />
          </Box>
          <Box
            sx={{
              mt: 1,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Typography variant="body1">2. 对比度:</Typography>
            <Box sx={{ flex: 1 }} />
            <HelpButton message="不合理的对比度会严重降低显形质量" />
          </Box>
          <Slider value={50} min={0} max={100} step={1} />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: 1,
            }}
          >
            <Input
              value={10}
              inputProps={{
                step: 1,
                min: 0,
                max: 255,
                type: 'number',
              }}
              sx={{
                width: '80px',
              }}
            />
            <Button
              size="small"
              sx={{
                width: '80px',
              }}
            >
              重置对比度
            </Button>
          </Box>
          <Box
            sx={{
              mt: 1,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography variant="body1">3. 取灰度:</Typography>
            <Switch size="medium"></Switch>
            <Box sx={{ flex: 1 }} />
            <HelpButton message="舍弃颜色可显著提升抗压缩能力" />
          </Box>
          <Box
            sx={{
              mt: 1,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography variant="body1">4. 混合权重:</Typography>
            <Select value="1" size="small" variant="standard">
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </Select>
            <Box sx={{ flex: 1 }} />
            <HelpButton message="权重越高，越容易直接看出" />
          </Box>
        </Box>
      </Box>
    </InputContainer>
  );
}

function ImageInput({ index }: ImageConfigProps) {
  const smallScreen = useSmallScreen();
  const size = smallScreen ? 100 : 200;

  const image = null;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        px: 1,
        width: size,
      }}
    >
      <ImageLoaderDialog onconfirm={(image) => {}} label="加载"></ImageLoaderDialog>
      {!image && (
        <CanvasFallback
          text="(･_･`)>"
          aspectRatio="1"
          styles={{
            width: '100%',
            objectFit: 'contain',
          }}
        ></CanvasFallback>
      )}
      <canvas
        style={{
          maxWidth: size,
          maxHeight: size,
          display: image ? 'block' : 'none',
          objectFit: 'contain',
        }}
      ></canvas>
    </Box>
  );
}
