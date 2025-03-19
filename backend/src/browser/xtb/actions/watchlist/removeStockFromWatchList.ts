import { Page } from 'puppeteer';
import toggleStockOnWatchList
  from 'src/browser/xtb/actions/watchlist/toggleStockOnWatchList.js';
import { AppDataSource } from 'src/dataSource.js';
import { StrategyD } from 'src/entity/StrategyD.js';
import GraphQLUserFriendlyError from 'src/graphql/GraphQLUserFriendlyError.js';

export default async (fullTicker: string, page: Page) => {
  const strategyDRepository = AppDataSource.getRepository(StrategyD);
  if (await strategyDRepository.findOneBy({fullTicker})) {
    throw new GraphQLUserFriendlyError('Stock is used in strategy D.');
  }

  await toggleStockOnWatchList(fullTicker, page, false);
}
