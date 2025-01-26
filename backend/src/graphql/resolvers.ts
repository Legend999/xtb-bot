import { STOCKS_PRICE_CHANGE } from 'src/constants/subscription.js';
import { StockPriceChangeType } from 'src/graphql/ApiPubSub.js';
import {
  Resolvers,
  Stock,
  StockPrice,
} from 'src/graphql/resolvers.generated.js';
import { Context } from 'src/server/apolloServer.js';

export const resolvers: Resolvers<Context> = {
  Query: {
    loggedIn: (_, __, {xtbPage}) => xtbPage.getLoggedIn(),
    accountList: async (_, __, {xtbPage}) => await xtbPage.getAccounts(),
  },
  Mutation: {
    logIn: async (_, {email, password}, {xtbPage}) => {
      await xtbPage.logIn(email, password);
      return true;
    },
  },
  Subscription: {
    stocksPriceChange: {
      resolve: (payload: StockPriceChangeType) => payload,
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
