import { ApolloError } from '@apollo/client';
import {
  useAddStockToWatchListMutation,
} from '@graphql/addStockToWatchList.generated.ts';
import useSafeAsync from '@hooks/useSafeAsync.ts';
import { Box, Button, CircularProgress, TextField } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

function StockPriceUpdates() {
  const safeAsync = useSafeAsync();
  const {enqueueSnackbar} = useSnackbar();
  const [fullTicker, setFullTicker] = useState('');
  const [addStockToWatchlist, {loading}] = useAddStockToWatchListMutation();

  const isValid = /^[A-Za-z0-9]{1,5}[.][A-Za-z]{2}$/.test(fullTicker);

  const handleAddToWatchlist = async () => {
    try {
      await addStockToWatchlist({variables: {fullTicker: fullTicker}});
      setFullTicker('');
    } catch (error) {
      if (error instanceof ApolloError) {
        enqueueSnackbar(error.message, {variant: 'error'});
      } else {
        throw error;
      }
    }
  };

  return (
    <Box display="flex" alignItems="center" gap={2} marginBottom={3}>
      <TextField
        label="Add Stock to Watchlist"
        placeholder="Enter full stock ticker (e.g. AAPL.US, CDR.PL)"
        variant="outlined"
        fullWidth
        value={fullTicker}
        onChange={(e) => { setFullTicker(e.target.value.toUpperCase()); }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={safeAsync(handleAddToWatchlist)}
        disabled={!isValid || loading}
      >
        {loading ? <CircularProgress size={24}/> : 'Add'}
      </Button>
    </Box>
  );
}

export default StockPriceUpdates;
