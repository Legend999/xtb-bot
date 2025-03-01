import { ElementHandle, HTTPResponse, Page, TimeoutError } from 'puppeteer';
import { clearInput } from 'src/browser/utils.js';
import ensureWatchListExists
  from 'src/browser/xtb/actions/watchlist/ensureWatchListExists.js';
import GraphQLUserFriendlyError from 'src/graphql/GraphQLUserFriendlyError.js';

export default async (email: string, password: string, page: Page) => {
  const loginInput = await page.waitForSelector('input[name=\'xslogin\']');
  const passwordInput = await page.waitForSelector('input[name=\'xspass\']');
  const loginButton = await page.waitForSelector('input.xs-btn.xs-btn-ok-login');

  await clearInput(loginInput!);
  await clearInput(passwordInput!);

  await loginInput!.type(email);
  await passwordInput!.type(password);
  await loginButton!.click();

  try {
    const result: HTTPResponse | ElementHandle<HTMLDivElement> | null = await Promise.race([
      page.waitForNavigation(),
      page.waitForSelector('div.xs-error-msg > div'),
    ]);

    if (result instanceof ElementHandle) {
      const errorMessage = await result.evaluate((element) => element.textContent);
      throw new GraphQLUserFriendlyError(errorMessage!);
    }
  } catch (e: unknown) {
    if (e instanceof TimeoutError) {
      await page.reload();
      throw new GraphQLUserFriendlyError('Signing in is probably temporarily blocked due to excessive attempts. Please try again in a few hours.');
    }
    throw e;
  }

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

  return await page.evaluate<
    [ElementHandle<HTMLSpanElement>], (accountValueElement: HTMLSpanElement) => string
  >(
    (accountValueElement: HTMLSpanElement) => accountValueElement.textContent!,
    accountValueElement,
  );
};
