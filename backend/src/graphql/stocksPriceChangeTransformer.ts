import {
  StockPriceChangeData,
  StockPriceChangeError,
  StockWithPrice,
} from 'src/graphql/resolvers.generated.js';

const createSuccess = (stocks: StockWithPrice[]): Required<StockPriceChangeData> => ({
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
