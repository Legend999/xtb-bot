import {
  useRemoveStockFromWatchListMutation,
} from '@graphql/removeStockFromWatchList.generated.ts';
import useSafeAsync from '@hooks/useSafeAsync.ts';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useEffect, useState } from 'react';

interface RemoveStockPriceDialogProps {
  fullTicker: string | null;
  handleClose: () => void;
}

function RemoveStockPriceDialog({
  fullTicker,
  handleClose,
}: RemoveStockPriceDialogProps) {
  const safeAsync = useSafeAsync();
  const [fullTickerStore, setFullTickerStore] = useState<string | null>(fullTicker);
  const [removeStockFromWatchList, {loading}] = useRemoveStockFromWatchListMutation();

  useEffect(() => {
    if (fullTicker !== null) setFullTickerStore(fullTicker);
  }, [fullTicker]);

  const handleConfirm = async () => {
    if (fullTickerStore) {
      await removeStockFromWatchList({variables: {fullTicker: fullTickerStore}});
    }
    handleClose();
  };

  return <Dialog
    open={!!fullTicker}
    onClose={handleClose}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
    slotProps={{
      transition: {
        onExited: () => {setFullTickerStore(null); },
      },
    }}
    disableScrollLock
  >
    <DialogTitle id="alert-dialog-title">
      Remove Stock
    </DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        Are you sure you want to remove {fullTickerStore} from your watchlist?
      </DialogContentText>
    </DialogContent>
    <DialogActions
      sx={{
        pb: 2,
        px: 3,
      }}
    >
      <Button
        onClick={handleClose}
        color="primary"
        variant="outlined"
      >
        Cancel
      </Button>
      <Button
        onClick={safeAsync(handleConfirm)}
        color="error"
        variant="contained"
        autoFocus
        disabled={loading}
        startIcon={loading && <CircularProgress size={16} color="inherit"/>}
      >
        Remove
      </Button>
    </DialogActions>
  </Dialog>;
}

export default RemoveStockPriceDialog;
