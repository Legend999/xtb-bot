import { Page } from 'puppeteer';
import ensureWatchListExists
  from 'src/browser/xtb/actions/watchlist/ensureWatchListExists.js';

export default async (page: Page) => {
  // Account value is (one of) the last element(s) to load, ensuring actions occur on a fully loaded page to prevent errors
  await fetchAccountValue(page);
  await ensureWatchListExists(page);
};

const fetchAccountValue = async (page: Page) => {
  return await page.waitForFunction(() => {
    const balanceSummary = document.querySelector('xs6-balance-summary');
    if (!balanceSummary) return null;
    const shadowRoot = balanceSummary.shadowRoot;
    if (!shadowRoot) return null;
    const accountValueElement = shadowRoot.querySelector('.account-value .neutral');
    if (!accountValueElement || accountValueElement.textContent === '0.00') return null;
    return accountValueElement;
  });
};
