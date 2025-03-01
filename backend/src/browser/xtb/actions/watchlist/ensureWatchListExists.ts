import { Page } from 'puppeteer';
import { clickHiddenElement } from 'src/browser/utils.js';
import { BOT_WATCH_LIST_NAME } from 'src/constants/bot.js';

export default async (page: Page) => {
  if (!await page.$(`span[title="${BOT_WATCH_LIST_NAME}"]`)) {
    await clickHiddenElement(page, 'button[data-create-group-btn]');

    const fullName = await page.waitForSelector('input[ng-model="fullName"]');
    await fullName!.type(BOT_WATCH_LIST_NAME);

    const shortName = await page.waitForSelector('input[ng-model="shortName"]');
    await shortName!.type('BOT');

    const saveButton = await page.waitForSelector('.xs-popup-add-update-group-save');
    await saveButton!.click();
  }
};
