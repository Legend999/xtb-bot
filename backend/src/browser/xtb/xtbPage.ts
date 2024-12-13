import { Browser, Page } from 'puppeteer';
import { USER_AGENT } from '../../constants/page.js';
import { ONE_SECOND_IN_MILLISECONDS } from '../../constants/time.js';

export default class XtbPage {
  private loggedIn: boolean = false;
  private readonly page: Page;

  private constructor(page: Page) {
    this.page = page;
  }

  public static async create(browser: Browser): Promise<XtbPage> {
    const page = await browser.newPage(); // https://github.com/puppeteer/puppeteer/issues/10654
    await page.setUserAgent(USER_AGENT);
    page.setDefaultTimeout(10 * ONE_SECOND_IN_MILLISECONDS);
    await page.goto('https://xstation5.xtb.com/?branch=pl#/_/login');

    return new XtbPage(page);
  }

  public get(): Page {
    return this.page;
  }

  public isLoggedIn(): boolean {
    return this.loggedIn;
  }

  public setLoggedIn(loggedIn: boolean) {
    this.loggedIn = loggedIn;
  }
}
