import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Input,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Slider,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { InputContainer } from '../components/input-container';
import { ImageLoaderDialog } from '../components/image-loader';
import { useDesktopMode } from '../providers/layout';
import { HelpButton } from '../components/help-button';
import { CanvasFallback } from '../components/canvas-fallback';
import { useCallback, useEffect, useRef, useState } from 'react';
import { zIndex } from '../constants/layout';
import { isCover } from '../algo/encode/process';
import { usePrismEncodeImageStore, usePrismEncodeStore } from '../algo/encode/state';
import { prismEncodeCanvas } from '../algo/encode/canvas';
import { useDebounce } from '../utils/hooks/debounce';
import { defaultImages, encodeDefaultArgs } from '../constants/default-arg';
import type { ImageEncodeFormat } from '../services/image-encoder';
import { showErrorSnackbar, showSuccessSnackbar } from '../providers/snackbar';
import { useFormatWarningStore } from '../providers/format-warning';
import { usePrismDecodeImagesStore } from '../algo/decode/state';
import { PrismImage } from '../models/image';
import { useCurrentRouteStore } from '../providers/routes';

export default function EncodePage() {
  const desktop = useDesktopMode();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: desktop ? 'lg' : 'sm',
      }}
    >
      <ImageInputs />
      <Box
        sx={{
          display: 'flex',
          flexDirection: desktop ? 'row' : 'column',
          mt: 2,
          gap: 2,
        }}
      >
        <OutputCanvas />
        <Operations />
      </Box>
    </Box>
  );
}

function ImageInputs() {
  const desktop = useDesktopMode();

  return (
    <Grid container spacing={2}>
      <Grid size={desktop ? 6 : 12}>
        <ImageConfig isCover={false} />
      </Grid>

      <Grid size={desktop ? 6 : 12}>
        <ImageConfig isCover={true} />
      </Grid>
    </Grid>
  );
}

interface ImageConfigProps {
  isCover: boolean;
}

function ImageConfig({ isCover }: ImageConfigProps) {
  return (
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
        <ImageInput isCover={isCover}></ImageInput>
        <ImageArguments isCover={isCover}></ImageArguments>
      </Box>
    </InputContainer>
  );
}

function ImageInput({ isCover }: ImageConfigProps) {
  const image = usePrismEncodeImageStore(isCover ? (state) => state.coverImage : (state) => state.innerImage);
  const setImage = usePrismEncodeImageStore(isCover ? (state) => state.setCoverImage : (state) => state.setInnerImage);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    if (isCover) {
      prismEncodeCanvas.bindCover(canvas);
    } else {
      prismEncodeCanvas.bindInner(canvas);
    }
    return () => {
      if (isCover) {
        prismEncodeCanvas.unbindCover();
      } else {
        prismEncodeCanvas.unbindInner();
      }
    };
  });

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        px: 1,
        width: '200px',
      }}
    >
      <ImageLoaderDialog
        onconfirm={(image) => {
          setImage(image);
        }}
        defaultImage={isCover ? defaultImages.encodeCover : defaultImages.encodeInner}
      ></ImageLoaderDialog>
      {!image && (
        <CanvasFallback
          text="(･_･`)>"
          aspectRatio="1"
          styles={{
            maxWidth: '200px',
            maxHeight: '200px',
            objectFit: 'contain',
          }}
        ></CanvasFallback>
      )}
      <canvas
        ref={canvasRef}
        style={{
          maxWidth: '200px',
          maxHeight: '200px',
          display: image ? 'block' : 'none',
          objectFit: 'contain',
          imageRendering: 'pixelated',
        }}
      ></canvas>
    </Box>
  );
}

function ImageArguments({ isCover }: ImageConfigProps) {
  const threshold = usePrismEncodeStore(isCover ? (state) => state.coverThreshold : (state) => state.innerThreshold);
  const contrast = usePrismEncodeStore(isCover ? (state) => state.coverContrast : (state) => state.innerContrast);
  const isGray = usePrismEncodeStore(isCover ? (state) => state.isCoverGray : (state) => state.isInnerGray);
  const setThreshold = usePrismEncodeStore(isCover ? (state) => state.setCoverThreshold : (state) => state.setInnerThreshold);
  const setContrast = usePrismEncodeStore(isCover ? (state) => state.setCoverContrast : (state) => state.setInnerContrast);
  const setIsGray = usePrismEncodeStore(isCover ? (state) => state.setIsCoverGray : (state) => state.setIsInnerGray);

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography variant="subtitle1" color="primary">
        {isCover ? '表图设置' : '里图设置'}
      </Typography>
      <Box
        sx={{
          mt: 1,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Typography variant="body2">1. 色阶端点:</Typography>
        <Box sx={{ flex: 1 }} />
        <HelpButton message={isCover ? '越高显形效果越好' : '越低隐藏效果越好'} />
      </Box>
      <Slider
        value={threshold}
        min={0}
        max={255}
        step={1}
        track={isCover ? 'inverted' : 'normal'}
        onChange={(_, value) => {
          setThreshold(value);
        }}
        valueLabelDisplay="auto"
      />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 1,
        }}
      >
        <Input
          value={threshold}
          inputProps={{
            step: 1,
            min: 0,
            max: 255,
            type: 'number',
          }}
          sx={{
            width: '80px',
          }}
          onChange={(e) => {
            const value = parseInt(e.target.value, 10);
            if (!isNaN(value)) {
              setThreshold(value);
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
        value={contrast}
        min={0}
        max={100}
        step={1}
        onChange={(_, value) => {
          setContrast(value);
        }}
        valueLabelDisplay="auto"
      />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 1,
        }}
      >
        <Input
          value={contrast}
          inputProps={{
            step: 1,
            min: 0,
            max: 255,
            type: 'number',
          }}
          sx={{
            width: '80px',
          }}
          onChange={(e) => {
            const value = parseInt(e.target.value, 10);
            if (!isNaN(value)) {
              setContrast(value);
            }
          }}
        />
        <Button
          size="small"
          sx={{
            width: '80px',
          }}
          onClick={() => {
            setContrast(50);
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
        <Switch
          size="medium"
          checked={isGray}
          onChange={(e) => {
            setIsGray(e.target.checked);
          }}
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
      ></Box>
    </Box>
  );
}

function Operations() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        gap: 2,
      }}
    >
      <InputContainer>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            width: '100%',
          }}
        >
          <BlendModeConfig />
          <SizeConfig />
          <ReverseConfig />
        </Box>
      </InputContainer>
      <Output />
    </Box>
  );
}

function OutputCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const haveResult = usePrismEncodeImageStore((state) => state.haveResult);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    prismEncodeCanvas.bind(canvas);
    return () => {
      prismEncodeCanvas.unbind();
    };
  }, []);

  return (
    <>
      {!haveResult && (
        <CanvasFallback
          text="只是一张画布"
          styles={{
            width: '100%',
          }}
        ></CanvasFallback>
      )}
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          display: haveResult ? 'block' : 'none',
        }}
      ></canvas>
    </>
  );
}

function BlendModeConfig() {
  const [showDialog, setShowDialog] = useState(false);

  const setBlendMode = usePrismEncodeStore((state) => state.setBlendMode);

  const handleConfirm = useCallback(
    (slope: number, gap: number, isRow: boolean) => {
      setBlendMode(slope, gap, isRow);
      setShowDialog(false);
      prismEncodeCanvas.encodeResult();
    },
    [setBlendMode]
  );

  const handleCancel = useCallback(() => {
    setShowDialog(false);
  }, []);

  return (
    <>
      <Button
        variant="contained"
        onClick={() => {
          setShowDialog(true);
        }}
      >
        设置混合模式
      </Button>
      <Dialog open={showDialog} maxWidth="sm" fullWidth sx={{ zIndex: zIndex.dialog }}>
        <BlendModeConfigDialog onConfirm={handleConfirm} onCancel={handleCancel} />
      </Dialog>
    </>
  );
}

interface BlendModeConfigDialogProps {
  onConfirm: (slope: number, gap: number, isRow: boolean) => void;
  onCancel: () => void;
}

function BlendModeConfigDialog({ onConfirm, onCancel }: BlendModeConfigDialogProps) {
  const blendMode = usePrismEncodeStore((state) => state.blendMode);

  const [slope, setSlope] = useState(blendMode.slope);
  const [gap, setGap] = useState(blendMode.gap);
  const [isRow, setIsRow] = useState(blendMode.isRow);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const updateCanvas = useCallback((slope: number, gap: number, isRow: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    canvas.width = 8;
    canvas.height = 8;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    ctx.imageSmoothingEnabled = false;
    for (let x = 0; x < canvas.width; x++) {
      for (let y = 0; y < canvas.height; y++) {
        if (isCover(x, y, slope, gap, isRow)) {
          ctx.fillStyle = 'white';
        } else {
          ctx.fillStyle = 'black';
        }
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }, []);

  useEffect(() => {
    updateCanvas(slope, gap, isRow);
  }, [slope, gap, isRow, updateCanvas]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        padding: 2,
        backgroundColor: 'background.paper',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          aspectRatio: '1',
          imageRendering: 'pixelated',
          padding: '16px',
        }}
      ></canvas>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          px: 2,
        }}
      >
        <FormControl>
          <FormLabel>1. 斜率</FormLabel>
          <Slider
            value={slope}
            min={0}
            max={4}
            step={1}
            onChange={(_, value) => {
              setSlope(value);
            }}
            valueLabelDisplay="auto"
            marks
          />

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <FormLabel>2. 间距</FormLabel>
            <HelpButton message="间距越大，隐藏效果越好，但显形效果越差" />
          </Box>
          <Slider
            value={gap}
            min={1}
            max={4}
            step={1}
            onChange={(_, value) => {
              setGap(value);
            }}
            valueLabelDisplay="auto"
            marks
          />
          <FormLabel>3. 方向</FormLabel>
          <RadioGroup
            value={isRow ? 'row' : 'column'}
            row
            onChange={(_, value) => {
              setIsRow(value === 'row');
            }}
          >
            <FormControlLabel value="row" control={<Radio />} label="这样" />
            <FormControlLabel value="column" control={<Radio />} label="或者这样" />
          </RadioGroup>
        </FormControl>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        <Button variant="text" onClick={onCancel}>
          取消
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button
          variant="text"
          onClick={() => {
            onConfirm(slope, gap, isRow);
          }}
          color="success"
        >
          确认
        </Button>
      </Box>
    </Box>
  );
}

function SizeConfig() {
  const maxSize = usePrismEncodeStore((state) => state.maxSize);
  const setMaxSize = usePrismEncodeStore((state) => state.setMaxSize);
  const [_size, _setSize] = useState(maxSize.toString());
  const [_valid, _setValid] = useState(true);
  const _debouncedSize = useDebounce(_size, 500);

  useEffect(() => {
    const size = parseInt(_debouncedSize, 10);
    if (isNaN(size) || size < encodeDefaultArgs.minWidth || size > encodeDefaultArgs.maxSize) {
      _setValid(false);
      return;
    }
    _setValid(true);
    setMaxSize(size);
  }, [_debouncedSize, setMaxSize]);

  return (
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
      <Typography>最大长或宽:</Typography>
      <TextField
        value={_size}
        onChange={(e) => {
          _setSize(e.target.value);
        }}
        size="small"
        variant="standard"
        error={!_valid}
        sx={{
          maxWidth: '100px',
        }}
      ></TextField>
      <HelpButton message="此选项用于限制生成图像文件的大小" />
    </Box>
  );
}

function ReverseConfig() {
  const isReverse = usePrismEncodeStore((state) => state.isReverse);
  const setIsReverse = usePrismEncodeStore((state) => state.setIsReverse);

  return (
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
      <Typography variant="body1">是否反向:</Typography>
      <Switch
        size="small"
        checked={isReverse}
        onChange={(e) => {
          setIsReverse(e.target.checked);
        }}
      ></Switch>
      <HelpButton message="“反向”即表图更暗 & 里图更亮的模式" />
    </Box>
  );
}

function Output() {
  const saveFormat = usePrismEncodeStore((state) => state.saveFormat);
  const setSaveFormat = usePrismEncodeStore((state) => state.setSaveFormat);

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
      prismEncodeCanvas
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
        const fileData = await prismEncodeCanvas.encodeResultToFile(saveFormat);
        const image = await PrismImage.fromFileData(fileData);
        setDecodeImages([image]);
        serRoute('/decode');
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
      <Dialog
        open={show}
        onClose={() => {
          setShow(false);
        }}
        maxWidth="sm"
        fullWidth
        sx={{ zIndex: zIndex.dialog }}
      >
        <DialogTitle id="alert-dialog-title">{`确认保存为 ${saveFormat}？`}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            非 JPEG 格式可能会被社交平台强制压缩，这将严重影响显形效果。请谨慎选择。
          </DialogContentText>
          <FormControlLabel
            control={
              <Switch
                checked={!showWarning}
                onChange={(e) => {
                  setShowWarning(!e.target.checked);
                }}
              />
            }
            label="本次不再显示此提示"
          />
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
              handleSave(saveFormat, true);
            }}
            autoFocus
          >
            仍然保存
          </Button>
        </DialogActions>
      </Dialog>
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
      <Select
        value={saveFormat}
        variant="standard"
        sx={{ minWidth: 80 }}
        onChange={(e) => {
          setSaveFormat(e.target.value as ImageEncodeFormat);
        }}
        disabled={processing}
      >
        <MenuItem value="JPEG">JPEG</MenuItem>
        <MenuItem value="PNG">PNG</MenuItem>
      </Select>
      <HelpButton message="非 JPEG 格式有较高地被社交平台强制压缩的风险" />
    </Box>
  );
}
