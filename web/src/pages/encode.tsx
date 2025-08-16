import {
  Box,
  Button,
  Dialog,
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
        <CanvasFallback text="只是一张画布" width="100%"></CanvasFallback>
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
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            px: 1,
          }}
        >
          <ImageLoaderDialog onconfirm={() => {}}></ImageLoaderDialog>
          <CanvasFallback text="(･_･`)>" aspectRatio="1" height="200px"></CanvasFallback>
        </Box>
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
          <Slider value={100} min={0} max={255} step={1} track={isCover ? 'inverted' : 'normal'} />
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
          ></Box>
        </Box>
      </Box>
    </InputContainer>
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
          }}
        >
          <BlendModeConfig />
          <SizeConfig />
        </Box>
      </InputContainer>
      <Output />
    </Box>
  );
}

function BlendModeConfig() {
  const [showDialog, setShowDialog] = useState(false);

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
        <BlendModeConfigDialog
          onConfirm={() => {}}
          onCancel={() => {
            setShowDialog(false);
          }}
        />
      </Dialog>
    </>
  );
}

interface BlendModeConfigDialogProps {
  onConfirm: (slope: number, gap: number, isRow: boolean) => void;
  onCancel: () => void;
}

function BlendModeConfigDialog({ onConfirm, onCancel }: BlendModeConfigDialogProps) {
  const [slope, setSlope] = useState(1);
  const [gap, setGap] = useState(1);
  const [isRow, setIsRow] = useState(false);

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
  return (
    <FormControl>
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
        <FormLabel>最大长或宽:</FormLabel>
        <Input
          inputProps={{
            step: 1,
            min: 10,
            max: 10000,
            type: 'number',
          }}
          value={1000}
          size="small"
        ></Input>
        <HelpButton message="此选项用于限制生成图像文件的大小" />
      </Box>
    </FormControl>
  );
}

function Output() {
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        gap: 1,
      }}
    >
      <Button sx={{ flex: 1 }} variant="contained">
        保存结果
      </Button>
      <Button sx={{ flex: 1 }} variant="contained" color="secondary">
        跳转显形测试
      </Button>
      <Select value={'JPEG'} variant="standard" sx={{ minWidth: 80 }}>
        <MenuItem value="JPEG">JPEG</MenuItem>
        <MenuItem value="PNG">PNG</MenuItem>
      </Select>
      <HelpButton message="非 JPEG 格式有较高地被社交平台强制压缩的风险" />
    </Box>
  );
}
