import { Box, Button, FormControl, FormLabel, Grid, Input, Link, Slider, Switch, TextField, Typography } from '@mui/material';
import { InputContainer } from '../components/input-container';
import { ImageLoaderDialog } from '../components/image-loader';
import { useDesktopMode, useSmallScreen } from '../providers/layout';
import { HelpButton } from '../components/help-button';
import { CanvasFallback } from '../components/canvas-fallback';
import { PaletteEntries } from '../providers/theme';
import { SubThemeManagerProvider } from '../providers/theme-provider';
import { NumberInput } from '../components/number-input';
import { FormatSelector } from '../components/format-selector';
import type { ImageEncodeFormat } from '../services/image-encoder';
import { routes, useCurrentRouteStore } from '../providers/routes';
import { Check } from '@mui/icons-material';
import {
  useAdvancedEncodeConfigsStore,
  useAdvancedImagesStore,
  useAdvancedImagesStoreInit,
} from '../algo/advanced-encode/state';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PrismImage } from '../models/image';
import { prismAdvancedEncodeCanvas } from '../algo/advanced-encode/canvas';
import { AdvancedEncodeDefaultArgs, maxContrast, minContrast } from '../constants/default-arg';
import { LoadingOverlay } from '../components/loading';
import { useFormatWarningStore } from '../providers/format-warning';
import { usePrismDecodeImagesStore } from '../algo/decode/state';
import { showErrorSnackbar, showSuccessSnackbar } from '../providers/snackbar';
import { FormatWarnDialog } from '../components/format-warn-dialog';

export default function AdvancesEncodePage() {
  const desktop = useDesktopMode();

  useAdvancedImagesStoreInit();

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
            setRoute(routes.decode);
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

  const indexes = useAdvancedEncodeConfigsStore((state) => state.indexes);

  return (
    <Grid container spacing={2} maxWidth={desktop ? 'lg' : 'sm'}>
      {indexes.map((index) => (
        <Grid key={index} size={desktop ? 6 : 12}>
          <ImageConfig index={index} />
        </Grid>
      ))}
    </Grid>
  );
}

type ImageConfigProps = {
  index: number;
};

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

  const createConfig = useAdvancedEncodeConfigsStore((state) => state.createConfig);
  const removeConfig = useAdvancedEncodeConfigsStore((state) => state.removeConfig);

  const hasImage = useAdvancedImagesStore((state) => state.getHasInput(index));

  const handleImageLoaded = useCallback(
    (image: PrismImage) => {
      if (prismAdvancedEncodeCanvas.setInputImage(image, index)) {
        createConfig();
      }
    },
    [index, createConfig]
  );

  const handleImageRemoved = () => {
    if (!hasImage) {
      // refuse to remove empty inputs
      return;
    }
    removeConfig(index);
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    prismAdvancedEncodeCanvas.bindInputCanvas(index, canvasRef.current!);
    return () => {
      prismAdvancedEncodeCanvas.unbindInputCanvas(index);
    };
  }, [index]);

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
      <ImageLoaderDialog onconfirm={handleImageLoaded} label="加载"></ImageLoaderDialog>
      {!hasImage && (
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
        ref={canvasRef}
        style={{
          maxWidth: size,
          maxHeight: size,
          display: hasImage ? 'block' : 'none',
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
        onClick={handleImageRemoved}
        disabled={!hasImage}
      >
        移除
      </Button>
    </Box>
  );
}

function ImageArguments({ index }: ImageConfigProps) {
  const config = useAdvancedEncodeConfigsStore((state) => state.getConfig(index));

  const setConfigValue = useAdvancedEncodeConfigsStore((state) => state.setConfigValue);

  const handleLowerThresholdChange = (value: number) => {
    setConfigValue(index, 'lowerThreshold', value);
  };

  const handleHigherThresholdChange = (value: number) => {
    setConfigValue(index, 'higherThreshold', value);
  };

  const handleContrastChange = (value: number) => {
    setConfigValue(index, 'contrast', value);
  };

  const handleGrayToggle = () => {
    setConfigValue(index, 'isGray', !config.isGray);
  };

  const handleWeightChange = (value: number) => {
    setConfigValue(index, 'weight', value);
  };

  useEffect(() => {
    prismAdvancedEncodeCanvas.adjustInput(index);
  }, [index, config.contrast, config.lowerThreshold, config.higherThreshold, config.isGray]);

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
      <Slider
        value={[config.lowerThreshold, config.higherThreshold]}
        min={0}
        max={255}
        step={AdvancedEncodeDefaultArgs.thresholdStep}
        onChange={(_, value) => {
          handleLowerThresholdChange(value[0]);
          handleHigherThresholdChange(value[1]);
        }}
      />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 1,
        }}
      >
        <Input
          value={config.lowerThreshold}
          inputProps={{
            step: AdvancedEncodeDefaultArgs.thresholdStep,
            min: 0,
            max: 255,
            type: 'number',
          }}
          sx={{
            width: '80px',
          }}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (!isNaN(value)) {
              handleLowerThresholdChange(value);
            }
          }}
        />
        <Input
          value={config.higherThreshold}
          inputProps={{
            step: AdvancedEncodeDefaultArgs.thresholdStep,
            min: 0,
            max: 255,
            type: 'number',
          }}
          sx={{
            width: '80px',
          }}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (!isNaN(value)) {
              handleHigherThresholdChange(value);
            }
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
      <Slider
        value={config.contrast}
        min={minContrast}
        max={maxContrast}
        step={AdvancedEncodeDefaultArgs.contrastStep}
        onChange={(_, v) => {
          handleContrastChange(v);
        }}
      />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 1,
        }}
      >
        <Input
          value={config.contrast}
          inputProps={{
            step: AdvancedEncodeDefaultArgs.contrastStep,
            min: minContrast,
            max: maxContrast,
            type: 'number',
          }}
          sx={{
            width: '80px',
          }}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (!isNaN(value)) {
              handleContrastChange(value);
            }
          }}
        />
        <Button
          size="small"
          sx={{
            width: '80px',
          }}
          onClick={() => {
            handleContrastChange(0);
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
        <Switch size="medium" value={config.isGray} onClick={handleGrayToggle}></Switch>
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
        <Slider
          value={config.weight}
          min={1}
          max={4}
          step={1}
          onChange={(_, value) => {
            handleWeightChange(value);
          }}
          sx={{
            flex: 1,
            ml: 1,
            minWidth: '60px',
          }}
          valueLabelDisplay="auto"
          marks
        />
        <Box sx={{ flex: 1 }} />
        <HelpButton message="权重越高，越容易直接看出" />
      </Box>
    </Box>
  );
}

function ConfigBox() {
  const size = useAdvancedEncodeConfigsStore((state) => state.size);
  const setSize = useAdvancedEncodeConfigsStore((state) => state.setSize);

  const [loading, setLoading] = useState(false);

  const [width, setWidth] = useState(size.width);
  const [height, setHeight] = useState(size.height);

  const handleConfirm = useCallback(
    (width: number, height: number) => {
      setLoading(true);
      try {
        setSize(width, height);
        prismAdvancedEncodeCanvas.resize({ width, height });
      } finally {
        setLoading(false);
      }
    },
    [setSize]
  );

  return (
    <>
      {loading && <LoadingOverlay />}
      <InputContainer>
        <FormControl
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 1,
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'end',
                gap: 1,
              }}
            >
              <FormLabel>当前宽度:</FormLabel>
              <TextField
                value={size.width}
                size="small"
                variant="standard"
                sx={{
                  maxWidth: '60px',
                }}
                disabled
              />
              <FormLabel>新宽度:</FormLabel>
              <NumberInput
                initValue={width}
                onChange={setWidth}
                size="small"
                variant="standard"
                sx={{
                  maxWidth: '60px',
                }}
                min={AdvancedEncodeDefaultArgs.minSize}
                max={AdvancedEncodeDefaultArgs.maxSize}
              />
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'end',
                gap: 1,
              }}
            >
              {' '}
              <FormLabel>当前高度:</FormLabel>
              <TextField
                value={size.height}
                size="small"
                variant="standard"
                sx={{
                  maxWidth: '60px',
                }}
                disabled
              />
              <FormLabel>新高度:</FormLabel>
              <NumberInput
                initValue={height}
                onChange={setHeight}
                size="small"
                variant="standard"
                sx={{
                  maxWidth: '60px',
                }}
                min={AdvancedEncodeDefaultArgs.minSize}
                max={AdvancedEncodeDefaultArgs.maxSize}
              />
            </Box>
          </Box>
          <Button
            sx={{
              aspectRatio: 1,
              minWidth: 0,
              padding: 0,
              p: 1,
            }}
            component="label"
            onClick={() => {
              handleConfirm(width, height);
            }}
          >
            <Check />
          </Button>
        </FormControl>
      </InputContainer>
    </>
  );
}

function OutputBox() {
  const [loading, setLoading] = useState(false);

  const hasOutput = useAdvancedImagesStore((state) => state.hasOutput);

  const handleConfirm = useCallback(() => {
    setLoading(true);
    try {
      prismAdvancedEncodeCanvas.encode();
    } finally {
      setLoading(false);
    }
  }, []);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    prismAdvancedEncodeCanvas.bind(canvasRef.current!);
    return () => {
      prismAdvancedEncodeCanvas.unbind();
    };
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      {loading && <LoadingOverlay />}
      <Button variant="contained" onClick={handleConfirm} fullWidth>
        光棱，启动！
      </Button>
      {!hasOutput && (
        <CanvasFallback
          text="只是一张画布"
          styles={{
            width: '100%',
            objectFit: 'contain',
          }}
        ></CanvasFallback>
      )}
      <canvas
        ref={canvasRef}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          display: hasOutput ? 'block' : 'none',
        }}
      ></canvas>
    </Box>
  );
}

function SaveBox() {
  const saveFormat = useAdvancedEncodeConfigsStore((state) => state.saveFormat);
  const setSaveFormat = useAdvancedEncodeConfigsStore((state) => state.setSaveFormat);

  const showWarning = useFormatWarningStore((state) => state.showWarning);
  const setShowWarning = useFormatWarningStore((state) => state.setShowWarning);

  const [show, setShow] = useState(false);

  const setDecodeImages = usePrismDecodeImagesStore((state) => state.setImages);

  const serRoute = useCurrentRouteStore((state) => state.setCurrentRoute);

  const [processing, setProcessing] = useState(false);

  const handleSave = useCallback(
    (saveFormat: ImageEncodeFormat, ignoreWarning: boolean) => {
      if (!ignoreWarning && saveFormat !== 'JPEG' && showWarning) {
        setShow(true);
        return;
      }
      setProcessing(true);
      prismAdvancedEncodeCanvas
        .saveResult(saveFormat)
        .then((name: string) => {
          showSuccessSnackbar(`已保存为 ${name}`);
        })
        .catch((error: unknown) => {
          console.error('Failed to save result:', error);
          showErrorSnackbar('保存失败');
        })
        .finally(() => {
          setProcessing(false);
        });
    },
    [showWarning]
  );

  const handleTest = useCallback(
    (saveFormat: ImageEncodeFormat) => {
      setProcessing(true);
      (async () => {
        const fileData = await prismAdvancedEncodeCanvas.encodeResultToFile(saveFormat);
        const image = await PrismImage.fromFileData(fileData);
        setDecodeImages([image]);
        serRoute(routes.decode);
      })()
        .catch((error: unknown) => {
          console.error('Failed to encode result:', error);
          showErrorSnackbar('跳转失败');
        })
        .finally(() => {
          setProcessing(false);
        });
    },
    [setDecodeImages, serRoute]
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
      <FormatWarnDialog
        show={show}
        setShow={setShow}
        saveFormat={saveFormat}
        handleSave={handleSave}
        showWarning={showWarning}
        setShowWarning={setShowWarning}
      />
      <Button
        sx={{ flex: 1 }}
        variant="contained"
        onClick={() => {
          handleSave(saveFormat, false);
        }}
        disabled={processing}
      >
        保存结果
      </Button>
      <Button
        sx={{ flex: 1 }}
        variant="contained"
        color="secondary"
        onClick={() => {
          handleTest(saveFormat);
        }}
        disabled={processing}
      >
        显形测试
      </Button>
      <FormatSelector
        format={saveFormat}
        onChange={(format) => {
          setSaveFormat(format);
        }}
        disabled={processing}
      ></FormatSelector>
      <HelpButton message="非 JPEG 格式有较高地被社交平台强制压缩的风险" />
    </Box>
  );
}
