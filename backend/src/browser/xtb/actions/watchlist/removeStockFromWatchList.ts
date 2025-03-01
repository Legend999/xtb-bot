import { Page } from 'puppeteer';
import toggleStockOnWatchList
  from 'src/browser/xtb/actions/watchlist/toggleStockOnWatchList.js';

export default async (fullTicker: string, page: Page) => toggleStockOnWatchList(fullTicker, page, false);
