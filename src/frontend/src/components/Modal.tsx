import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  onConfirm?: () => void
  confirmText?: string
  cancelText?: string
  showCloseButton?: boolean
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  fullWidth?: boolean
  children: React.ReactNode
  actions?: React.ReactNode
}

function Modal({
  open,
  title,
  onClose,
  onConfirm,
  confirmText = '確定',
  cancelText = 'キャンセル',
  showCloseButton = true,
  maxWidth = 'sm',
  fullWidth = true,
  children,
  actions
}: ModalProps) {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
    >
      <DialogTitle>
        <Box className="flex justify-between items-center">
          <Typography variant="h6" component="h2">
            {title}
          </Typography>
          {showCloseButton && (
            <IconButton
              aria-label="閉じる"
              onClick={onClose}
              size="small"
              className="-mr-2"
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>

      <DialogContent dividers>{children}</DialogContent>

      <DialogActions>
        {actions || (
          <>
            <Button onClick={onClose}>{cancelText}</Button>
            {onConfirm && (
              <Button onClick={handleConfirm} variant="contained">
                {confirmText}
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default Modal 