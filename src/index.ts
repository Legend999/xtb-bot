import dotenv from "dotenv";
import puppeteer, {Browser, ElementHandle, Page} from "puppeteer";

dotenv.config();

interface BuyStockData {
  symbol: string;
  volume: number;
  price: number;
}

const fillNumberInput = async (page: Page, selector: string, value: number) => {
  const priceInput = await page.waitForSelector(selector);

  const boundingBox = await priceInput!.boundingBox();
  await page.mouse.click(
    boundingBox!.x + boundingBox!.width / 2,
    boundingBox!.y + boundingBox!.height / 2,
    { count: 3 }
  );
  await priceInput!.press('Backspace');

  await priceInput!.type(value.toString());
}

const buyStock = async (page: Page, data: BuyStockData) => {
  const searchBarInput = await page.waitForSelector('.xs-symbol-search-bar-input-wrapper input.xs-symbol-search-bar-input');
  await searchBarInput!.type(data.symbol);

  const stockContainer = await page.waitForSelector(
    '::-p-xpath(//div[contains(@class, "single-symbol-container") and ' +
    '(.//span[contains(@class, "asset-class") and (text()="Stock" or text()="Akcje")]) and ' +
    `.//p[contains(@class, "group-id") and starts-with(normalize-space(text()), "${data.symbol}")]])`
  );

  const orderButton = await stockContainer!.$('::-p-xpath(.//div[contains(@class, "mw-ct-ticket-btn-icon")])');
  await orderButton!.click();

  const stopLimitTab = await page.waitForSelector('ul.nav-tabs li[select="tabSelected(\'pending\')"] a');
  await stopLimitTab!.click();

  // volume must be set first because otherwise changing the price affects the volume input element
  await fillNumberInput(page, 'div[data-id="volume.volume"] input[name="stepperInput"].xs-stepper-input', data.volume);
  await fillNumberInput(page, 'div[data-id="openPrice"] input[name="stepperInput"].xs-stepper-input', data.price);

  const buyLimitButton = await page.waitForFunction<unknown[], () => HTMLDivElement | false>(() => {
    const buyLimitButton = document.querySelector<HTMLDivElement>('div.xs-popup-trade-button.xs-btn-buy')!;
    return buyLimitButton.hasAttribute('disabled') ? false : buyLimitButton;
  }) as ElementHandle<HTMLDivElement>;
  await buyLimitButton!.click();

  // uncomment to confirm the transaction
  // const confirmButton = await page.waitForSelector('button#applyBtn');
  // await confirmButton!.click();
}

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
}

const handleXtb = async (browser: Browser) => {
  const email = process.env.EMAIL;
  const password = process.env.PASSWORD;

  if (!email || !password) {
    throw new Error("EMAIL and PASSWORD must be set in environment variables.");
  }

  const page = await browser.newPage();
  const ua = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
  await page.setUserAgent(ua);

  await page.goto("https://xstation5.xtb.com/?branch=pl#/_/login");

  const loginInput = await page.waitForSelector("input[name='xslogin']");
  const passwordInput = await page.waitForSelector("input[name='xspass']");
  const loginButton = await page.waitForSelector("input.xs-btn.xs-btn-ok-login");

  await loginInput!.type(email);
  await passwordInput!.type(password);
  await loginButton!.click();

  console.log("Logging in...");

  const accountValueElement = await page.waitForFunction<unknown[], () => HTMLSpanElement | false>(() => {
    const balanceSummary = document.querySelector("xs6-balance-summary");
    if (!balanceSummary) return false;
    const shadowRoot = balanceSummary.shadowRoot;
    if (!shadowRoot) return false;
    const accountValueElement = shadowRoot.querySelector<HTMLSpanElement>(".account-value .neutral");
    if (!accountValueElement || accountValueElement.textContent === "0.00") return false;
    return accountValueElement;
  }) as ElementHandle<HTMLSpanElement>;

  const accountValue = await page.evaluate<
    [ElementHandle<HTMLSpanElement>], (accountValueElement: HTMLSpanElement) => string
  >((accountValueElement: HTMLSpanElement) => {
      return accountValueElement.textContent!;
    },
    accountValueElement,
  );

  console.log(`Account value: ${accountValue}`);

  await fetchAccounts(page);

  await buyStock(page, {symbol: "META.US", price: 100, volume: 1});
}

const run = async () => {
  console.log("Starting...");
  const debug = process.env.DEBUG === "true";

  const browser = await puppeteer.launch({
    ...(debug ? { headless: false, slowMo: 10, defaultViewport: null } : {}),
  });

  try {
    await handleXtb(browser);
  } finally {
    !debug && await browser.close();
  }
}

run().catch(console.error);
