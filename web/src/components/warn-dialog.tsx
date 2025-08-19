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

type WarnDialogProps = {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  showWarning: boolean;
  setShowWarning: (show: boolean) => void;
  title: string;
  content: string[];
};

export function WarnDialog({ show, onClose, onConfirm, showWarning, setShowWarning, title, content }: WarnDialogProps) {
  return (
    <Dialog
      open={show}
      onClose={() => {
        onClose();
      }}
      maxWidth="sm"
      fullWidth
      sx={{ zIndex: zIndex.dialog }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {content.map((line) => (
          <DialogContentText key={line} sx={{ whiteSpace: 'pre-line' }}>
            {line}
          </DialogContentText>
        ))}

        <FormControlLabel
          control={
            <Switch
              checked={!showWarning}
              onChange={(e) => {
                setShowWarning(!e.target.checked);
              }}
            />
          }
          label="不再显示此提示"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button onClick={onConfirm} autoFocus>
          无视，继续
        </Button>
      </DialogActions>
    </Dialog>
  );
}
