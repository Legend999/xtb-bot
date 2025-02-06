// import { ElementHandle, Page } from 'puppeteer';
// import {
//   clearInput,
//   clickHiddenElement,
//   fillNumberInput,
// } from '../browser/utils.js';
// import { ONE_SECOND_IN_MILLISECONDS } from '../constants/time.js';
//
// interface BuyStockData {
//   symbol: string;
//   volume: number;
//   price: number;
// }
//
// const buyStock = async (page: Page, data: BuyStockData) => {
//   const stockContainer = await findStock(page, data.symbol);
//
//   await clickHiddenElement(stockContainer!, '.mw-ct-ticket-btn.mw-btn-menu');
//
//   const stopLimitTab = await page.waitForSelector('ul.nav-tabs li[select="tabSelected(\'pending\')"] a');
//   await stopLimitTab!.click();
//
//   const isMarketClosed = await page.evaluate(
//     (tab) => !!tab.querySelector('.mw-ticket-session-tab-icon.mw-session-type-closed-ticket-icon'),
//     stopLimitTab!,
//   );
//
//   if (isMarketClosed) {
//     throw new Error('The market is closed. Cannot proceed.');
//   }
//
//   // volume must be set first because otherwise changing the price affects the volume input element
//   await fillNumberInput(page, 'div[data-id="volume.volume"] input[name="stepperInput"].xs-stepper-input', data.volume);
//   await fillNumberInput(page, 'div[data-id="openPrice"] input[name="stepperInput"].xs-stepper-input', data.price);
//
//   const buyLimitButton = await page.waitForSelector('.xs-popup-trade-button.xs-btn-buy:not([disabled])');
//   await buyLimitButton!.click();
//
//   // uncomment to confirm the transaction
//   // const confirmButton = await page.waitForSelector('button#applyBtn');
//   // await confirmButton!.click();
// };
//
