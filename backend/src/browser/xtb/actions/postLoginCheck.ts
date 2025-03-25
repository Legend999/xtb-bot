import { ElementHandle, Page } from 'puppeteer';
import { getTextContent } from 'src/browser/utils.js';
import ensureWatchListExists
  from 'src/browser/xtb/actions/watchlist/ensureWatchListExists.js';

export default async (page: Page) => {
  // Account value is (one of) the last element(s) to load, ensuring actions occur on a fully loaded page to prevent errors
  await fetchAccountValue(page);
  await ensureWatchListExists(page);
};

const fetchAccountValue = async (page: Page) => {
  const accountValueElement = await page.waitForFunction<unknown[], () => HTMLSpanElement | false>(() => {
    const balanceSummary = document.querySelector('xs6-balance-summary');
    if (!balanceSummary) return false;
    const shadowRoot = balanceSummary.shadowRoot;
    if (!shadowRoot) return false;
    const accountValueElement = shadowRoot.querySelector<HTMLSpanElement>('.account-value .neutral');
    if (!accountValueElement || accountValueElement.textContent === '0.00') return false;
    return accountValueElement;
  }) as ElementHandle<HTMLSpanElement>;

  return await getTextContent(accountValueElement);
};
