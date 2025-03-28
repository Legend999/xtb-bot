import { Page } from 'puppeteer';
import XtbPage from 'src/browser/xtb/xtbPage.js';
import { BOT_WATCH_LIST_NAME } from 'src/constants/bot.js';
import { STOCKS_PRICE_CHANGE } from 'src/constants/subscription.js';
import { ONE_SECOND_IN_MILLISECONDS } from 'src/constants/time.js';
import ApiPubSub from 'src/graphql/ApiPubSub.js';
import { StockWithPrice } from 'src/graphql/resolvers.generated.js';
import StocksPriceChangeGraphqlTransformer
  from 'src/graphql/stocksPriceChangeTransformer.js';
import { logErrorAndExit } from 'src/utils/errorLogger.js';

export default async (xtbPage: XtbPage, pubsub: ApiPubSub): Promise<NodeJS.Timeout> => {
  const page = xtbPage.page;

  const watchListMenuButton = page.locator('.mws-menu-more-box');
  await watchListMenuButton.click();

  const xtbBotWatchList = page.locator(`::-p-xpath(//button[.//span[@title="${BOT_WATCH_LIST_NAME}"]])`);
  await xtbBotWatchList.click();

  return setInterval(() => { // poll instead of MutationObserver to avoid logging frequent updates that are unnecessary
    handleStockDataInterval(xtbPage, pubsub).catch(logErrorAndExit);
  }, ONE_SECOND_IN_MILLISECONDS);
};

async function handleStockDataInterval(xtbPage: XtbPage, pubsub: ApiPubSub) {
  const stockPriceChange = await getStockPriceChange(xtbPage.page);

  if (xtbPage.checkStockPriceChangeAndUpdate(stockPriceChange)) {
    await pubsub.publish(STOCKS_PRICE_CHANGE, stockPriceChange);
  }
}

async function getStockPriceChange(page: Page) {
  try {
    const stockData = await fetchStockData(page);
    return StocksPriceChangeGraphqlTransformer.createSuccess(stockData);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return StocksPriceChangeGraphqlTransformer.createError();
  }
}

async function fetchStockData(page: Page): Promise<StockWithPrice[]> {
  return await page.evaluate(() => {
    const targetNode = document.querySelector('.grid-canvas');

    return Array.from(targetNode!.querySelectorAll('.slick-row')).map(row => {
      const fullTicker = row.querySelector('.xs-symbol-name')!.getAttribute('title')!.split(',')[0];
      const cells = row.querySelectorAll('.slick-cell');
      const bid = cells[2].textContent!;
      const ask = cells[3].textContent!;

      return {
        fullTicker: fullTicker,
        price: {bid: Number(bid), ask: Number(ask)},
      };
    });
  });
}
