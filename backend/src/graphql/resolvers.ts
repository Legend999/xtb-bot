import _ from 'lodash';
import { STOCKS_PRICE_CHANGE } from 'src/constants/subscription.js';
import {
  Resolvers,
  Stock,
  StockPrice,
} from 'src/graphql/resolvers.generated.js';
import { Context } from 'src/server/apolloServer.js';

export const resolvers: Resolvers<Context> = {
  Query: {
    test: () => 'Test',
  },
  Mutation: {
    logIn: async (_, {email, password}, {xtbPage}) => {
      return await xtbPage.logIn(email, password);
    },
  },
  Subscription: {
    stocksPriceChange: {
      resolve: _.identity,
      subscribe: async (_, __, {xtbPage, pubsub}) => {
        await xtbPage.subscribeToPriceChange(pubsub);
        return pubsub.asyncIterableIterator(STOCKS_PRICE_CHANGE);
      },
    },
  },
  Account: {
    currency: (account) => account.currency,
    number: (account) => account.number,
    type: (account) => account.type,
  },
  Stock: {
    name: (stock: Stock) => stock.name,
    price: (stock: Stock) => stock.price,
  },
  StockPrice: {
    ask: (stockPrice: StockPrice) => stockPrice.ask,
    bid: (stockPrice: StockPrice) => stockPrice.bid,
  },
  StocksPriceChangeResult: {
    __resolveType(obj) {
      return obj.__typename ?? null;
    },
  },
  StockPriceChangeData: {
    stocks: (payload) => payload.stocks,
  },
  StockPriceChangeError: {
    errorMessage: (payload) => payload.errorMessage,
  },
};
