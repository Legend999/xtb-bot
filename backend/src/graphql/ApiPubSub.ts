import { PubSub } from 'graphql-subscriptions';
import {
  StockPriceChangeData,
  StockPriceChangeError,
} from 'src/graphql/resolvers.generated.js';

export type StockPriceChangeType = Required<StockPriceChangeData | StockPriceChangeError>

// @todo https://www.apollographql.com/docs/apollo-server/data/subscriptions#production-pubsub-libraries
export default class ApiPubSub extends PubSub<{
  STOCKS_PRICE_CHANGE: StockPriceChangeType
}> {
}
