import { Box, Button, FormControl, FormLabel, Grid, Input, Link, Select, Slider, Switch, Typography } from '@mui/material';
import { InputContainer } from '../components/input-container';
import { ImageLoaderDialog } from '../components/image-loader';
import { useDesktopMode, useSmallScreen } from '../providers/layout';
import { HelpButton } from '../components/help-button';
import { CanvasFallback } from '../components/canvas-fallback';
import { PaletteEntries, useThemeStore } from '../providers/theme';
import { SubThemeManagerProvider } from '../providers/theme-provider';
import { NumberInput } from '../components/number-input';
import { FormatSelector } from '../components/format-selector';
import type { ImageEncodeFormat } from '../services/image-encoder';
import { useCurrentRouteStore } from '../providers/routes';

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
        gap: 1,
      }}
    >
      <InfoBox />
      <ImageInputs />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: 'sm',
          mx: 'auto',
          gap: 1,
        }}
      >
        <ConfigBox />
        <OutputBox />
        <SaveBox />
      </Box>
    </Box>
  );
}

function InfoBox() {
  const setRoute = useCurrentRouteStore((state) => state.setCurrentRoute);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        p: 1,
        gap: 1,
      }}
    >
      <Typography variant="h6" color="primary">
        <b>复合</b>光棱坦克
      </Typography>
      <Typography variant="body1">
        这是允许输入<b>超过两张图片</b>的模式 🤓 推荐在对"光棱坦克"的原理有基础的了解后再使用。或者如果您恰巧理解能力超群 🧐
        也可以边试边学——所有的图片均在您的浏览器本地生成，没有人会有任何意见 😉
      </Typography>
      <Typography variant="body1">
        在成功加载一张图片后，会有新的图片输入框出现以便您添加更多图片。同理，移除一张图片也会相应地移除它所属的输入框。很直接的交互方式，不是吗
        😊
      </Typography>
      <Typography variant="body1">
        另外，相较1.x版本，
        <Link
          component="button"
          variant="body1"
          onClick={() => {
            setRoute('/decode');
          }}
        >
          显形界面
        </Link>{' '}
        的阈值滑条多了一个端点，这就是为显形复合坦克准备的 😎
      </Typography>
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
    </Grid>
  );
}

interface ImageConfigProps {
  index: number;
}

function ImageConfig({ index }: ImageConfigProps) {
  const primaryColor = PaletteEntries[index % PaletteEntries.length];
  return (
    <SubThemeManagerProvider primaryPaletteKey={primaryColor}>
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
          <ImageArguments index={index} />
        </Box>
      </InputContainer>
    </SubThemeManagerProvider>
  );
}

function ImageInput({ index }: ImageConfigProps) {
  const smallScreen = useSmallScreen();
  const size = smallScreen ? 120 : 200;

  const image = null;

  const palette = useThemeStore((state) => state.palette);

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
      <Button
        variant="outlined"
        size="small"
        sx={{
          width: '100%',
          border: '2px solid',
        }}
      >
        移除
      </Button>
    </Box>
  );
}

function ImageArguments({ index }: ImageConfigProps) {
  return (
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
        <Typography variant="body2">1. 色阶端点:</Typography>
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
        <Typography variant="body2">2. 对比度:</Typography>
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
        <Typography variant="body2">3. 取灰度:</Typography>
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
        <Typography variant="body2">4. 混合权重:</Typography>
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
  );
}

function ConfigBox() {
  return (
    <InputContainer>
      <FormControl
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          width: '100%',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'end',
            justifyContent: 'center',
            width: '100%',
            gap: 1,
          }}
        >
          <FormLabel>生成图片宽度:</FormLabel>
          <NumberInput
            initValue={1000}
            onChange={(v) => {}}
            size="small"
            variant="standard"
            sx={{
              maxWidth: '100px',
            }}
          />
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'end',
            justifyContent: 'center',
            width: '100%',
            gap: 1,
          }}
        >
          <FormLabel>生成图片高度:</FormLabel>
          <NumberInput
            initValue={1000}
            onChange={(v) => {}}
            size="small"
            variant="standard"
            sx={{
              maxWidth: '100px',
            }}
          />
        </Box>
      </FormControl>
    </InputContainer>
  );
}

function OutputBox() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <Button variant="contained">光棱，启动！</Button>
      <CanvasFallback
        text="只是一张画布"
        styles={{
          width: '100%',
          objectFit: 'contain',
        }}
      ></CanvasFallback>
    </Box>
  );
}

function SaveBox() {
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        gap: 1,
      }}
    >
      <Button sx={{ flex: 1 }} variant="contained" onClick={() => {}}>
        保存结果
      </Button>
      <Button sx={{ flex: 1 }} variant="contained" color="secondary" onClick={() => {}}>
        显形测试
      </Button>
      s
      <FormatSelector
        format={'JPEG' as ImageEncodeFormat}
        onChange={(format) => {
          console.log(`Selected format: ${format}`);
        }}
      ></FormatSelector>
    </Box>
  );
}
