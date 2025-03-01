import AddStockToWatchList from '@components/stocks/AddStockToWatchList.tsx';
import RemoveStockPriceDialog
  from '@components/stocks/RemoveStockPriceDialog.tsx';
import { Stock } from '@graphql/graphql-types.generated.ts';
import { useWatchPriceSubscription } from '@graphql/priceChange.generated.ts';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Alert,
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { useState } from 'react';

function StockPriceUpdates() {
  const theme = useTheme();
  const {data, loading, error} = useWatchPriceSubscription();
  const [stockToDelete, setStockToDelete] = useState<string | null>(null);

  const handleOpenDeleteDialog = (stockName: string) => {
    setStockToDelete(stockName);
  };

  const handleCloseDeleteDialog = () => {
    setStockToDelete(null);
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

  const columnStyles = {
    name: {width: '40%', minWidth: '150px'},
    price: {width: '25%', minWidth: '100px'},
    actions: {width: '10%', minWidth: '80px'},
  };

  return (
    <Box padding={2}>
      <Typography variant="h4" gutterBottom sx={{fontWeight: 500}}>
        Stock Price Updates
      </Typography>
      <AddStockToWatchList/>
      <TableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={columnStyles.name}>
                <Typography variant="subtitle1" fontWeight="bold">Stock Name</Typography>
              </TableCell>
              <TableCell align="right" sx={columnStyles.price}>
                <Typography variant="subtitle1" fontWeight="bold">Ask</Typography>
              </TableCell>
              <TableCell align="right" sx={columnStyles.price}>
                <Typography variant="subtitle1" fontWeight="bold">Bid</Typography>
              </TableCell>
              <TableCell align="center" sx={columnStyles.actions}>
                <Typography variant="subtitle1" fontWeight="bold">Actions</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayStocks.map((stock: Stock) => (
              <TableRow
                key={stock.name}
                hover
                sx={{
                  transition: 'background-color 0.2s',
                  '&:last-child td, &:last-child th': {border: 0},
                }}
              >
                <TableCell sx={columnStyles.name}>
                  <Typography variant="body2">{stock.name}</Typography>
                </TableCell>
                <TableCell align="right" sx={columnStyles.price}>
                  <Typography variant="body2">{stock.price.ask}</Typography>
                </TableCell>
                <TableCell align="right" sx={columnStyles.price}>
                  <Typography variant="body2">{stock.price.bid}</Typography>
                </TableCell>
                <TableCell align="center" sx={columnStyles.actions}>
                  <Tooltip title="Remove from watchlist" arrow>
                    <IconButton
                      aria-label="delete"
                      size="small"
                      onClick={() => { handleOpenDeleteDialog(stock.name); }}
                      // disabled={removeLoading}
                      sx={{
                        color: theme.palette.error.main,
                        '&:hover': {
                          backgroundColor: `${theme.palette.error.light}20`,
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small"/>
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {displayStocks.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{py: 4}}>
                  <Typography variant="body1" color="text.secondary">
                    No stocks in your watchlist
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <RemoveStockPriceDialog fullTicker={stockToDelete} handleClose={handleCloseDeleteDialog}/>
    </Box>
  );
}

export default StockPriceUpdates;
