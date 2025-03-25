import { STOCKS_PRICE_CHANGE } from 'src/constants/subscription.js';
import { AppDataSource } from 'src/dataSource.js';
import { StrategyD } from 'src/entity/StrategyD.js';
import { StockPriceChangeType } from 'src/graphql/ApiPubSub.js';
import {
  Resolvers,
  StockPrice,
  StockWithPrice,
} from 'src/graphql/resolvers.generated.js';
import { Context } from 'src/server/apolloServer.js';

export const resolvers: Resolvers<Context> = {
  Query: {
    logInStatus: (_, __, {xtbPage}) => xtbPage.getLogInStatus(),
    accountList: async (_, __, {xtbPage}) => await xtbPage.getAccounts(),
    stocksInStrategies: async () => {
      const strategyDRepository = AppDataSource.getRepository(StrategyD);
      return await strategyDRepository.find();
    },
  },
  Mutation: {
    logIn: async (_, {email, password}, {xtbPage}) => {
      await xtbPage.logIn(email, password);
      return true;
    },
    enter2fa: async (_, {code}, {xtbPage}) => {
      await xtbPage.enter2fa(code);
      return true;
    },
    addStockToWatchList: async (_, {fullTicker}, {xtbPage}) => {
      await xtbPage.addStockToWatchList(fullTicker);
      return true;
    },
    removeStockFromWatchList: async (_, {fullTicker}, {xtbPage}) => {
      await xtbPage.removeStockFromWatchList(fullTicker);
      return true;
    },
    addStockToStrategyD: async (_, {
      fullTicker,
      percent,
      pricePerLevel,
    }, {xtbPage}) => {
      await xtbPage.addStockToStrategyD(fullTicker, percent, pricePerLevel);
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
  StockWithPrice: {
    fullTicker: (stock: StockWithPrice) => stock.fullTicker,
    price: (stock: StockWithPrice) => stock.price,
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
  StockInStrategyD: {
    fullTicker: (stockInStrategyD) => stockInStrategyD.fullTicker,
    percent: (stockInStrategyD) => stockInStrategyD.percent,
    pricePerLevel: (stockInStrategyD) => stockInStrategyD.pricePerLevel,
  },
};
