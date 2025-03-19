import {
  validateStrategyDPercent,
  validateStrategyDPricePerLevel,
} from '@shared/utils/validators.js';
import { AppDataSource } from 'src/dataSource.js';
import { StrategyD } from 'src/entity/StrategyD.js';
import GraphQLUserFriendlyError from 'src/graphql/GraphQLUserFriendlyError.js';

export default async (fullTicker: string, percent: number, pricePerLevel: number) => {
  const errorMessage = validateStrategyDPercent(percent) ?? validateStrategyDPricePerLevel(pricePerLevel);
  if (errorMessage) {
    throw new GraphQLUserFriendlyError(errorMessage);
  }

  const strategyDRepository = AppDataSource.getRepository(StrategyD);
  if (await strategyDRepository.findOneBy({fullTicker})) {
    throw new GraphQLUserFriendlyError('Stock is already in strategy D.');
  }
  const newStrategyD = new StrategyD(fullTicker, percent, pricePerLevel);
  await strategyDRepository.save(newStrategyD);
}
