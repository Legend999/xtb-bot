import { ElementHandle, Page } from 'puppeteer';

export const clickHiddenElement = async (container: ElementHandle | Page, selector: string) => {
  await container.$eval(selector, (el) => { (el as HTMLElement).click(); });
};

export const clearInput = async (input: ElementHandle) => {
  await input.click({count: 3});
  await input.press('Backspace');
};

export const fillNumberInput = async (page: Page, selector: string, value: number) => {
  const numberInput = await page.waitForSelector(selector);

  await clearInput(numberInput!);

  await numberInput!.type(value.toString());
};
