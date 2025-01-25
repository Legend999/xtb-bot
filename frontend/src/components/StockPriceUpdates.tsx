import { Stock } from '@graphql/graphql-types.generated.ts';
import { useWatchPriceSubscription } from '@graphql/priceChange.generated';

function StockPriceUpdates() {
  const {data, loading, error} = useWatchPriceSubscription();

  if (loading) return <p>Loading stock prices...</p>;
  const errorMessage = data?.stocksPriceChange.__typename === 'StockPriceChangeError' ? data.stocksPriceChange.errorMessage : error?.message;
  if (errorMessage) return <p style={{color: 'red'}}>Error: {errorMessage}</p>;

  return (
    <div>
      <h2>Stock Price Updates</h2>
      {data?.stocksPriceChange.__typename === 'StockPriceChangeData' && data.stocksPriceChange.stocks.map((stock: Stock) => (
        <div key={stock.name}>
          <p>
            {stock.name}: Ask - {stock.price.ask}, Bid - {stock.price.bid}
          </p>
        </div>
      ))}
    </div>
  );
}

export default StockPriceUpdates;
