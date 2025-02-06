import AddStockToWatchList from '@components/AddStockToWatchList.tsx';
import { Stock } from '@graphql/graphql-types.generated.ts';
import { useWatchPriceSubscription } from '@graphql/priceChange.generated';
import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

function StockPriceUpdates() {
  const {data, loading, error} = useWatchPriceSubscription();

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
      <AddStockToWatchList/>
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
