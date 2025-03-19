import AccountList from '@components/accountList/AccountList.tsx';
import StockPriceUpdates from '@components/stocks/StockPriceUpdates.tsx';
import { Box } from '@mui/material';
import 'src/components/MainView.scss';

function MainView() {
  return <Box className="MainView" padding={2}>
    <AccountList/>
    <StockPriceUpdates/>
  </Box>;
}

export default MainView;
