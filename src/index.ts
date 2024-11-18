import dotenv from "dotenv";
import puppeteer, {ElementHandle} from "puppeteer";

dotenv.config();

const run = async () => {
  console.log("Starting...");
  const debug = process.env.DEBUG === "true";
  const email = process.env.EMAIL;
  const password = process.env.PASSWORD;

  if (!email || !password) {
    throw new Error("EMAIL and PASSWORD must be set in environment variables.");
  }

  const browser = await puppeteer.launch({
    ...(debug ? {headless: false, slowMo: 10} : {}),
  });
  const page = await browser.newPage();
  const ua = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36";
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

  !debug && await browser.close();
};

run().catch(console.error);
