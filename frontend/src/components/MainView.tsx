import AccountList from '@components/AccountList.tsx';
import StockPriceUpdates from '@components/stocks/StockPriceUpdates.tsx';

function MainView() {
  return <>
    <AccountList/>
    <StockPriceUpdates/>
  </>;
}

export default MainView;
