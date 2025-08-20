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
import { WarnDialog } from '../components/warn-dialog';

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
      {/* <Typography variant="body1">
        在成功加载一张图片后，会有新的图片输入框出现以便您添加更多图片。同理，移除一张图片也会相应地移除它所属的输入框。很直接的交互方式，不是吗
        😊
      </Typography> */}
      <Typography variant="body1">
        请注意，由于渲染的复杂性，此页面<b>不提供</b>结果的实时预览 😥 更新参数请记得手动点击按钮重新生成 🙂
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
        的阈值滑条多了一个端点，这正是为显形复合坦克准备的 😎
      </Typography>
    </Box>
  );
}

function ImageInputs() {
  const desktop = useDesktopMode();

  const indexes = useAdvancedEncodeConfigsStore((state) => state.indexes);

  return (
    <Grid container spacing={1} maxWidth={desktop ? 'lg' : 'sm'}>
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

  const hasImage = useAdvancedImagesStore((state) => state.getHasInput(index));

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
          <ImageInput index={index} hasImage={hasImage} />
          <ImageArguments index={index} disabled={false} />
        </Box>
      </InputContainer>
    </SubThemeManagerProvider>
  );
}

function ImageInput({ index, hasImage }: ImageConfigProps & { hasImage: boolean }) {
  const smallScreen = useSmallScreen();
  const size = smallScreen ? 120 : 200;

  const createConfig = useAdvancedEncodeConfigsStore((state) => state.createConfig);
  const removeConfig = useAdvancedEncodeConfigsStore((state) => state.removeConfig);

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

function ImageArguments({ index, disabled }: ImageConfigProps & { disabled: boolean }) {
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

  const handleGrayChange = (value: boolean) => {
    setConfigValue(index, 'isGray', value);
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
        disabled={disabled}
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
          disabled={disabled}
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
          disabled={disabled}
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
        disabled={disabled}
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
          disabled={disabled}
        />
        <Button
          size="small"
          sx={{
            width: '80px',
          }}
          onClick={() => {
            handleContrastChange(0);
          }}
          disabled={disabled}
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
        <Switch
          size="medium"
          checked={config.isGray}
          onChange={(e) => {
            handleGrayChange(e.target.checked);
          }}
          disabled={disabled}
        />
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
          disabled={disabled}
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
  const checkConflict = useAdvancedEncodeConfigsStore((state) => state.testConflict);

  const dontCareConflict = useAdvancedEncodeConfigsStore((state) => state.dontCareConflict);
  const setDontCareConflict = useAdvancedEncodeConfigsStore((state) => state.setDontCareConflict);

  const [show, setShow] = useState(false); // warning dialog

  const handleConfirm = useCallback(
    (force: boolean) => {
      setLoading(true);
      try {
        if (!force) {
          const conflict = checkConflict();
          if (conflict) {
            setShow(true);
            return;
          }
        }
        prismAdvancedEncodeCanvas.encode();
      } finally {
        setLoading(false);
      }
    },
    [checkConflict]
  );

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
      {/* <Dialog
        open={show}
        onClose={() => {
          setShow(false);
        }}
        maxWidth="sm"
        fullWidth
        sx={{ zIndex: zIndex.dialog }}
      >
        <DialogTitle>{`色阶区间存在冲突！`}</DialogTitle>
        <DialogContent>
          <DialogContentText>建议避免输入图片的色阶端点之间发生重叠，否则显形效果可能不如预期。</DialogContentText>
          <DialogContentText>例如 1-24 与 12-36 存在重叠, 建议调整为 0-24 与 25-49。</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShow(false);
            }}
          >
            取消
          </Button>
          <Button
            onClick={() => {
              setShow(false);
              handleConfirm(true);
            }}
            autoFocus
          >
            仍然继续
          </Button>
        </DialogActions>
      </Dialog> */}
      <WarnDialog
        show={show}
        onClose={() => {
          setShow(false);
        }}
        onConfirm={() => {
          setShow(false);
          handleConfirm(true);
        }}
        showWarning={!dontCareConflict}
        setShowWarning={(v) => {
          setDontCareConflict(!v);
        }}
        title="色阶区间存在冲突！"
        content={[
          '建议避免输入图片的色阶端点之间发生重叠，否则显形效果可能不如预期。',
          '例如 0-24 与 12-36 存在重叠, 建议调整为 0-24 与 25-49。',
        ]}
      />
      <Button
        variant="contained"
        onClick={() => {
          handleConfirm(false);
        }}
        fullWidth
      >
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
      <WarnDialog
        show={show}
        onClose={() => {
          setShow(false);
        }}
        onConfirm={() => {
          setShow(false);
          handleSave(saveFormat, true);
        }}
        showWarning={showWarning}
        setShowWarning={setShowWarning}
        title={`确认保存为 ${saveFormat}?`}
        content={['非 JPEG 格式可能会被某些社交平台强制压缩，这将严重影响显形效果。请谨慎选择。']}
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
      <HelpButton message="非 JPEG 格式有较高的被社交平台强制压缩的风险" />
    </Box>
  );
}
