import { Page } from 'puppeteer';
import { clickHiddenElement } from 'src/browser/utils.js';
import findStock from 'src/browser/xtb/actions/watchlist/findStock.js';
import { BOT_WATCH_LIST_NAME } from 'src/constants/bot.js';
import GraphQLUserFriendlyError from 'src/graphql/GraphQLUserFriendlyError.js';

export default async (fullTicker: string, page: Page, targetSelection: boolean) => {
  const stockContainer = await findStock(fullTicker, page);
  await clickHiddenElement(stockContainer!, '.xs-button-icon.xs-button-add-to-group');

  const addToWatchListCheckboxItem = await page.waitForSelector(`::-p-xpath(//li[.//span[text()="${BOT_WATCH_LIST_NAME}"]])`);
  const isSelected = await addToWatchListCheckboxItem!.evaluate(el => el.classList.contains('selected'));

  if (isSelected && targetSelection) {
    throw new GraphQLUserFriendlyError('Stock is already on the watch list.');
  }
  if (!isSelected && !targetSelection) {
    throw new GraphQLUserFriendlyError('Stock is not on the watch list.');
  }

  await addToWatchListCheckboxItem!.click();
}
