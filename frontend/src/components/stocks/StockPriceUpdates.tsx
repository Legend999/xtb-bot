import AddStockToWatchList from '@components/stocks/AddStockToWatchList.tsx';
import RemoveStockPriceDialog
  from '@components/stocks/RemoveStockPriceDialog.tsx';
import StrategyParameters from '@components/stocks/StrategyParameters.tsx';
import {
  StockInStrategyD,
  StockWithPrice,
} from '@graphql/graphql-types.generated.ts';
import { useWatchPriceSubscription } from '@graphql/priceChange.generated.ts';
import {
  useAddStockToStrategyDMutation,
} from '@graphql/strategy/addStockToStrategyD.generated.ts';
import {
  StocksInStrategiesDocument,
  useStocksInStrategiesQuery,
} from '@graphql/strategy/stocksInStrategies.generated.ts';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
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
import React, { useEffect, useState } from 'react';

export interface StrategyParams {
  percent: string;
  pricePerLevel: string;
  editable: boolean;
}

interface StrategiesParams {
  [fullTicker: string]: StrategyParams;
}

function StockPriceUpdates() {
  const theme = useTheme();
  const {
    data: priceData,
    loading: priceLoading,
    error: priceError,
  } = useWatchPriceSubscription();
  const {
    data: strategiesData,
    loading: strategiesLoading,
    error: strategiesError,
  } = useStocksInStrategiesQuery();
  const [addStockToStrategyD, {loading: addStockToStrategyDLoading}] =
    useAddStockToStrategyDMutation({
      refetchQueries: [{query: StocksInStrategiesDocument}],
      awaitRefetchQueries: true,
    });
  const [strategiesParams, setStrategiesParams] = useState<StrategiesParams>({});
  const [stockToDelete, setStockToDelete] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    if (strategiesData) {
      const initialStrategiesParams = strategiesData.stocksInStrategies.reduce((acc, strategy: StockInStrategyD) => ({
        ...acc,
        [strategy.fullTicker]: {
          percent: strategy.percent.toString(),
          pricePerLevel: strategy.pricePerLevel.toString(),
          editable: false,
        },
      }), {});
      setStrategiesParams(prev => ({
        ...prev,
        ...initialStrategiesParams,
      }));
    }
  }, [strategiesData]);

  const handleOpenDeleteDialog = (fullTicker: string) => {
    setStockToDelete(fullTicker);
  };

  const handleCloseDeleteDialog = () => {
    setStockToDelete(null);
  };

  const toggleExpandedRow = (fullTicker: string) => {
    setExpandedRow(prev => (prev === fullTicker ? null : fullTicker));
  };

  const handleAssignStrategy = (fullTicker: string) => {
    toggleExpandedRow(fullTicker);

    if (!strategiesParams[fullTicker]) {
      setStrategiesParams(prev => ({
        ...prev,
        [fullTicker]: {percent: '', pricePerLevel: '', editable: true},
      }));
    }
  };

  const handleStrategyChange = (fullTicker: string, field: 'percent' | 'pricePerLevel', value: string) => {
    setStrategiesParams(prev => ({
      ...prev,
      [fullTicker]: {
        ...prev[fullTicker]!,
        [field]: value,
      },
    }));
  };

  const handleRunStrategy = async (fullTicker: string) => {
    await addStockToStrategyD({
      variables: {
        fullTicker: fullTicker,
        percent: Number(strategiesParams[fullTicker]!.percent),
        pricePerLevel: Number(strategiesParams[fullTicker]!.pricePerLevel),
      },
    });
  };

  if (priceLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
        <CircularProgress/>
      </Box>
    );
  }

  const errorMessage =
    priceData?.stocksPriceChange.__typename === 'StockPriceChangeError'
      ? priceData.stocksPriceChange.errorMessage
      : priceError?.message;

  if (errorMessage) {
    return <Alert severity="error">Error: {errorMessage}</Alert>;
  }

  const watchedStocks =
    priceData?.stocksPriceChange.__typename === 'StockPriceChangeData'
      ? priceData.stocksPriceChange.stocks
      : [];

  const columnStyles = {
    arrow: {width: '8%', minWidth: '25px'},
    name: {width: '22%', minWidth: '125px'},
    strategy: {width: '20%', minWidth: '100px'},
    price: {width: '20%', minWidth: '100px'},
    actions: {width: '10%', minWidth: '50px'},
  };

  const getStrategy = (stock: StockWithPrice) => {
    if (strategiesLoading) {
      return <Chip
        size="medium"
        label="Loading"
        sx={{
          backgroundColor: `${theme.palette.info.light}20`,
          color: theme.palette.info.main,
          fontWeight: 500,
        }}
      />;
    }
    if (strategiesError) {
      return <Chip
        size="medium"
        label="Error"
        sx={{
          backgroundColor: `${theme.palette.error.light}20`,
          color: theme.palette.error.main,
          fontWeight: 500,
        }}
      />;
    }
    const strategy = strategiesData?.stocksInStrategies.find(
      (stockInStrategyD: StockInStrategyD) => stockInStrategyD.fullTicker === stock.fullTicker,
    );
    if (!strategy) {
      return <Button
        variant="outlined"
        size="small"
        startIcon={<AssignmentIcon/>}
        onClick={(e) => {
          e.stopPropagation();
          handleAssignStrategy(stock.fullTicker);
        }}
        sx={{
          textTransform: 'none',
          borderColor: theme.palette.primary.main,
          '&:hover': {
            borderColor: theme.palette.primary.light,
            backgroundColor: `${theme.palette.primary.light}15`,
          },
        }}
      >
        Assign Strategy
      </Button>;
    }
    return <Chip
      size="medium"
      label={`D${strategy.percent.toString()}`}
      sx={{
        backgroundColor: `${theme.palette.success.main}20`,
        color: theme.palette.success.main,
        fontWeight: 500,
        fontSize: '1em',
      }}
    />;
  };

  return (
    <>
      <Typography variant="h4" gutterBottom sx={{fontWeight: 500}}>
        Watchlist
      </Typography>
      <AddStockToWatchList/>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={columnStyles.arrow}></TableCell>
              <TableCell sx={columnStyles.name}>
                <Typography variant="subtitle1" fontWeight="bold">Stock Name</Typography>
              </TableCell>
              <TableCell align="center" sx={columnStyles.strategy}>
                <Typography variant="subtitle1" fontWeight="bold">Strategy</Typography>
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
            {watchedStocks.map((stock: StockWithPrice) => {
              const fullTicker = stock.fullTicker;
              return (
                <React.Fragment key={fullTicker}>
                  <TableRow
                    hover
                    onClick={() => { strategiesParams[fullTicker] && toggleExpandedRow(fullTicker); }}
                    sx={strategiesParams[fullTicker] ? {cursor: 'pointer'} : {}}
                  >
                    <TableCell sx={columnStyles.arrow}>
                      <IconButton size="small" sx={{color: theme.palette.text.secondary}}>
                        {strategiesParams[fullTicker] ? expandedRow === fullTicker ? (
                          <KeyboardArrowUpIcon/>
                        ) : (
                          <KeyboardArrowDownIcon/>
                        ) : null}
                      </IconButton>
                    </TableCell>
                    <TableCell sx={columnStyles.name}>
                      <Typography variant="body2">{fullTicker}</Typography>
                    </TableCell>
                    <TableCell align="center" sx={columnStyles.strategy}>
                      {getStrategy(stock)}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDeleteDialog(fullTicker);
                          }}
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
                  <TableRow>
                    <TableCell
                      style={{
                        paddingBottom: 0,
                        paddingTop: 0,
                      }}
                      colSpan={6}
                    >
                      <Collapse in={expandedRow === fullTicker} timeout="auto" unmountOnExit>
                        {strategiesParams[fullTicker] !== undefined
                          ?
                          <StrategyParameters
                            strategyParams={strategiesParams[fullTicker]}
                            onChange={(field: 'percent' | 'pricePerLevel', value: string) => { handleStrategyChange(fullTicker, field, value); }}
                            onRun={() => handleRunStrategy(fullTicker)}
                            loading={addStockToStrategyDLoading}
                          />
                          : null}
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              );
            })}
            {watchedStocks.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{py: 4}}>
                  <Typography color="text.secondary">
                    No stocks in your watchlist
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <RemoveStockPriceDialog fullTicker={stockToDelete} handleClose={handleCloseDeleteDialog}/>
    </>
  );
}

export default StockPriceUpdates;
