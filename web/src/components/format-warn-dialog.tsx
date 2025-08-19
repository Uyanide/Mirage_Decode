import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { zIndex } from '../constants/layout';
import type { ImageEncodeFormat } from '../services/image-encoder';

type FormatWarnDialogProps = {
  show: boolean;
  setShow: (show: boolean) => void;
  saveFormat: ImageEncodeFormat;
  handleSave: (format: ImageEncodeFormat, force: boolean) => void;
  showWarning: boolean;
  setShowWarning: (show: boolean) => void;
};

export function FormatWarnDialog({
  show,
  setShow,
  saveFormat,
  handleSave,
  showWarning,
  setShowWarning,
}: FormatWarnDialogProps) {
  return (
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
  );
}
