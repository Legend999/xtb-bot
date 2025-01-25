import {
  Stock,
  StockPriceChangeData,
  StockPriceChangeError,
} from 'src/graphql/resolvers.generated.js';

const createSuccess = (stocks: Stock[]): Required<StockPriceChangeData> => ({
  stocks,
  __typename: 'StockPriceChangeData',
});

const createError = (errorMessage = 'An unexpected error occurred.'): Required<StockPriceChangeError> => ({
  errorMessage,
  __typename: 'StockPriceChangeError',
});

const StocksPriceChangeGraphqlTransformer = {
  createSuccess,
  createError,
};

export default StocksPriceChangeGraphqlTransformer;
