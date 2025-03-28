import { Page } from 'puppeteer';
import { clickHiddenElement } from 'src/browser/utils.js';
import { BOT_WATCH_LIST_NAME } from 'src/constants/bot.js';

export default async (page: Page) => {
  if (!await page.$(`span[title="${BOT_WATCH_LIST_NAME}"]`)) {
    await clickHiddenElement(page, 'button[data-create-group-btn]');
    await page.locator('input[ng-model="fullName"]').fill(BOT_WATCH_LIST_NAME);
    await page.locator('input[ng-model="shortName"]').fill('BOT');
    await page.locator('.xs-popup-add-update-group-save').click();
  }
};
