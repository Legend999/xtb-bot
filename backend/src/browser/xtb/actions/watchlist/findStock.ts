import { Page } from 'puppeteer';
import { clearInput } from 'src/browser/utils.js';
import { ONE_SECOND_IN_MILLISECONDS } from 'src/constants/time.js';
import GraphQLUserFriendlyError from 'src/graphql/GraphQLUserFriendlyError.js';

export default async (fullTicker: string, page: Page) => {
  const searchBarInput = await page.$('.xs-symbol-search-bar-input-wrapper input.xs-symbol-search-bar-input');

  await clearInput(searchBarInput!);

  await searchBarInput!.type(fullTicker);

  try {
    return await page.waitForSelector(
      '::-p-xpath(//div[contains(@class, "single-symbol-container") and ' +
      '(.//span[contains(@class, "asset-class") and (text()="Stock" or text()="Akcje" or text()="ETF")]) and ' +
      `.//p[contains(@class, "group-id") and starts-with(normalize-space(text()), "${fullTicker.toUpperCase()}")]])`,
      {timeout: ONE_SECOND_IN_MILLISECONDS},
    );
  } catch {
    throw new GraphQLUserFriendlyError('Stock not found.');
  }
};
