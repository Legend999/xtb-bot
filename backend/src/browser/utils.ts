import { ElementHandle, Page } from 'puppeteer';

export const getTextContent = async (element: ElementHandle<Node>) => (await element.evaluate(el => el.textContent))!;

export const clickHiddenElement = async (container: ElementHandle | Page, selector: string) => {
  await container.$eval(selector, (el) => { (el as HTMLElement).click(); });
};

export const fillNumberInput = async (page: Page, selector: string, value: number) => {
  await page.locator(selector).fill(value.toString());
};
