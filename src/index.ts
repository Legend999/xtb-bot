import dotenv from 'dotenv';
import puppeteer, {
  Browser,
  ElementHandle,
  HTTPResponse,
  Page,
  TimeoutError,
} from 'puppeteer';

dotenv.config();

interface BuyStockData {
  symbol: string;
  volume: number;
  price: number;
}

const EXAMPLE_STOCK = 'ARRY.US';
const BOT_LIST_NAME = 'XtbBot';
const ONE_SECOND_IN_MILLISECONDS = 1000;

const clickHiddenElement = async (container: ElementHandle | Page, selector: string) => {
  await container.$eval(selector, (el) => (el as HTMLElement).click());
};

const clearInput = async (page: Page, input: ElementHandle) => {
  const boundingBox = await input!.boundingBox();
  await page.mouse.click(
    boundingBox!.x + boundingBox!.width / 2,
    boundingBox!.y + boundingBox!.height / 2,
    {count: 3},
  );
  await input!.press('Backspace');
};

const fillNumberInput = async (page: Page, selector: string, value: number) => {
  const priceInput = await page.waitForSelector(selector);

  await clearInput(page, priceInput!);

  await priceInput!.type(value.toString());
};

const findStock = async (page: Page, symbol: string) => {
  const searchBarInput = await page.$('.xs-symbol-search-bar-input-wrapper input.xs-symbol-search-bar-input');

  await clearInput(page, searchBarInput!);

  await searchBarInput!.type(symbol);

  return await page.waitForSelector(
    '::-p-xpath(//div[contains(@class, "single-symbol-container") and ' +
    '(.//span[contains(@class, "asset-class") and (text()="Stock" or text()="Akcje")]) and ' +
    `.//p[contains(@class, "group-id") and starts-with(normalize-space(text()), "${symbol}")]])`,
  );
};

const buyStock = async (page: Page, data: BuyStockData) => {
  const stockContainer = await findStock(page, data.symbol);

  await clickHiddenElement(stockContainer!, '.mw-ct-ticket-btn.mw-btn-menu');

  const stopLimitTab = await page.waitForSelector('ul.nav-tabs li[select="tabSelected(\'pending\')"] a');
  await stopLimitTab!.click();

  const isMarketClosed = await page.evaluate(
    (tab) => !!tab.querySelector('.mw-ticket-session-tab-icon.mw-session-type-closed-ticket-icon'),
    stopLimitTab!,
  );

  if (isMarketClosed) {
    throw new Error('The market is closed. Cannot proceed.');
  }

  // volume must be set first because otherwise changing the price affects the volume input element
  await fillNumberInput(page, 'div[data-id="volume.volume"] input[name="stepperInput"].xs-stepper-input', data.volume);
  await fillNumberInput(page, 'div[data-id="openPrice"] input[name="stepperInput"].xs-stepper-input', data.price);

  const buyLimitButton = await page.waitForSelector('.xs-popup-trade-button.xs-btn-buy:not([disabled])');
  await buyLimitButton!.click();

  // uncomment to confirm the transaction
  // const confirmButton = await page.waitForSelector('button#applyBtn');
  // await confirmButton!.click();
};

const fetchAccounts = async (page: Page) => {
  const accounts = await page.evaluate(() => {
    const accountListElements = document.querySelectorAll('xs-combobox[title="Zmień konto"] .dropdown-menu li');

    return Array.from(accountListElements).map((item) => {
      const spans = item.querySelectorAll('span');
      return Array.from(spans)
        .map((span) => span.textContent!)
        .join(' ');
    });
  });

  console.log(accounts);
};

const handleCreateWatchList = async (page: Page) => {
  if (!await page.$(`span[title="${BOT_LIST_NAME}"]`)) {
    await clickHiddenElement(page, 'button[data-create-group-btn]');

    const fullName = await page.waitForSelector('input[ng-model="fullName"]');
    await fullName!.type(BOT_LIST_NAME);

    const shortName = await page.waitForSelector('input[ng-model="shortName"]');
    await shortName!.type('BOT');

    const saveButton = await page.waitForSelector('.xs-popup-add-update-group-save');
    await saveButton!.click();

    const stockContainer = await findStock(page, EXAMPLE_STOCK);
    await clickHiddenElement(stockContainer!, '.xs-button-icon.xs-button-add-to-group');

    const addToXtbBotGroup = await page.waitForSelector(`::-p-xpath(//li[.//span[text()="${BOT_LIST_NAME}"]])`);
    await addToXtbBotGroup!.click();
  }
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

  const accountValue = await page.evaluate<
    [ElementHandle<HTMLSpanElement>], (accountValueElement: HTMLSpanElement) => string
  >(
    (accountValueElement: HTMLSpanElement) => accountValueElement.textContent!,
    accountValueElement,
  );

  console.log(`Account value: ${accountValue}`);
};

const startObservingStockPrices = async (page: Page): Promise<NodeJS.Timeout> => {
  const watchListMenuButton = await page.waitForSelector('.mws-menu-more-box');
  await watchListMenuButton!.click();

  const xtbBotWatchList = await page.waitForSelector(`::-p-xpath(//button[.//span[@title="${BOT_LIST_NAME}"]])`);
  await xtbBotWatchList!.click();

  return setInterval(async () => {  // poll instead of using MutationObserver due to frequent updates
    const stockData = await page.evaluate(() => {
      const targetNode = document.querySelector('.grid-canvas');

      return Array.from(targetNode!.querySelectorAll('.slick-row')).map(row => {
        const name = row.querySelector('.xs-symbol-name')!.getAttribute('title')!.split(',')[0];
        const cells = row.querySelectorAll('.slick-cell');
        const ask = cells[2].textContent;
        const bid = cells[3].textContent;

        return {name, ask, bid};
      });
    });

    console.log('Stock data:', stockData);
  }, ONE_SECOND_IN_MILLISECONDS);
};

const logIn = async (page: Page) => {
  const email = process.env.EMAIL;
  const password = process.env.PASSWORD;

  if (!email || !password) {
    throw new Error('EMAIL and PASSWORD must be set in environment variables.');
  }

  await page.goto('https://xstation5.xtb.com/?branch=pl#/_/login');

  const loginInput = await page.waitForSelector('input[name=\'xslogin\']');
  const passwordInput = await page.waitForSelector('input[name=\'xspass\']');
  const loginButton = await page.waitForSelector('input.xs-btn.xs-btn-ok-login');

  await loginInput!.type(email);
  await passwordInput!.type(password);
  await loginButton!.click();

  console.log('Logging in...');

  try {
    const result: HTTPResponse | ElementHandle<HTMLDivElement> | null = await Promise.race([
      page.waitForNavigation(),
      page.waitForSelector('div.xs-error-msg > div'),
    ]);

    if (result instanceof ElementHandle) {
      const errorMessage = await result.evaluate((element) => element.textContent);
      throw new Error(errorMessage!);
    }
  } catch (e: unknown) {
    if (e instanceof TimeoutError) {
      throw new Error('Login is probably blocked due to excessive attempts in a short time. Retry in a few hours.');
    }
    throw e;
  }
};

const handleXtb = async (browser: Browser) => {
  const page = await browser.newPage();
  const ua = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
  await page.setUserAgent(ua);
  page.setDefaultTimeout(10 * ONE_SECOND_IN_MILLISECONDS);

  await logIn(page);

  await fetchAccountValue(page);

  await handleCreateWatchList(page);

  await fetchAccounts(page);

  const interval = await startObservingStockPrices(page);

  try {
    await new Promise(r => setTimeout(r, 5 * ONE_SECOND_IN_MILLISECONDS));
    await buyStock(page, {symbol: EXAMPLE_STOCK, price: 1, volume: 20});
  } finally {
    clearInterval(interval);
  }
};

const run = async () => {
  console.log('Starting...');
  const headless = process.env.HEADLESS === 'true';

  const browser = await puppeteer.launch({
    pipe: true,
    ...(headless ? {} : {headless: false, slowMo: 10, defaultViewport: null}),
  });

  try {
    await handleXtb(browser);
  } finally {
    headless && await browser.close();
  }
};

run().catch(console.error);
