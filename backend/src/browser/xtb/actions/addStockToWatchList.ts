import { Page } from 'puppeteer';
import { clearInput, clickHiddenElement } from 'src/browser/utils.js';
import { BOT_WATCH_LIST_NAME } from 'src/constants/bot.js';
import GraphQLUserFriendlyError from 'src/graphql/GraphQLUserFriendlyError.js';

export default async (fullTicker: string, page: Page) => {
  const stockContainer = await findStock(fullTicker, page);
  await clickHiddenElement(stockContainer!, '.xs-button-icon.xs-button-add-to-group');

  const addToWatchListCheckboxItem = await page.waitForSelector(`::-p-xpath(//li[.//span[text()="${BOT_WATCH_LIST_NAME}"]])`);
  const isSelected = await addToWatchListCheckboxItem!.evaluate(el => el.classList.contains('selected'));

  if (isSelected) {
    throw new GraphQLUserFriendlyError('Stock is already on the watch list.');
  }

  await addToWatchListCheckboxItem!.click();
}

const findStock = async (fullTicker: string, page: Page) => {
  const searchBarInput = await page.$('.xs-symbol-search-bar-input-wrapper input.xs-symbol-search-bar-input');

  await clearInput(searchBarInput!);

  await searchBarInput!.type(fullTicker);

  return await page.waitForSelector(
    '::-p-xpath(//div[contains(@class, "single-symbol-container") and ' +
    '(.//span[contains(@class, "asset-class") and (text()="Stock" or text()="Akcje")]) and ' +
    `.//p[contains(@class, "group-id") and starts-with(normalize-space(text()), "${fullTicker}")]])`,
  );
};
