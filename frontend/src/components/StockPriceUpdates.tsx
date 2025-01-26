import { Stock } from '@graphql/graphql-types.generated.ts';
import { useWatchPriceSubscription } from '@graphql/priceChange.generated';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

function StockPriceUpdates() {
  const {data, loading, error} = useWatchPriceSubscription();
  const [stockName, setStockName] = useState('');
  // const [addToWatchlist] = useAddToWatchlistMutation();

  const handleAddToWatchlist = () => {
    if (stockName.trim()) {
      // await addToWatchlist({ variables: { name: stockName } });
      setStockName(''); // Clear input after successful addition
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress/>
      </Box>
    );
  }

  const errorMessage =
    data?.stocksPriceChange.__typename === 'StockPriceChangeError'
      ? data.stocksPriceChange.errorMessage
      : error?.message;

  if (errorMessage) {
    return <Alert severity="error">Error: {errorMessage}</Alert>;
  }

  const displayStocks =
    data?.stocksPriceChange.__typename === 'StockPriceChangeData'
      ? data.stocksPriceChange.stocks
      : [];

  return (
    <Box padding={2}>
      <Typography variant="h4" gutterBottom>
        Stock Price Updates
      </Typography>
      <Box display="flex" alignItems="center" gap={2} marginBottom={3}>
        <TextField
          label="Add Stock to Watchlist"
          placeholder="Enter full stock ticker (e.g. AAPL.US, CDR.PL)"
          variant="outlined"
          fullWidth
          value={stockName}
          onChange={(e) => { setStockName(e.target.value); }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddToWatchlist}
          disabled={!stockName.trim()}
        >
          Add
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="subtitle1" fontWeight="bold">Stock Name</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle1" fontWeight="bold">Ask</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle1" fontWeight="bold">Bid</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayStocks.map((stock: Stock) => (
              <TableRow key={stock.name} hover>
                <TableCell>
                  <Typography variant="body2">{stock.name}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">{stock.price.ask}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">{stock.price.bid}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default StockPriceUpdates;
