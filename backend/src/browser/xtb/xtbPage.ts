import _ from 'lodash';
import { Browser, Page } from 'puppeteer';
import { fetchAccounts } from 'src/browser/xtb/actions/fetchAccounts.js';
import logIn from 'src/browser/xtb/actions/logIn.js';
import addStockToStrategyD
  from 'src/browser/xtb/actions/strategy/addStockToStrategyD.js';
import addStockToWatchList
  from 'src/browser/xtb/actions/watchlist/addStockToWatchList.js';
import removeStockFromWatchList
  from 'src/browser/xtb/actions/watchlist/removeStockFromWatchList.js';
import watchPriceChange from 'src/browser/xtb/actions/watchPriceChange.js';
import { USER_AGENT } from 'src/constants/page.js';
import { ONE_SECOND_IN_MILLISECONDS } from 'src/constants/time.js';
import ApiPubSub, { StockPriceChangeType } from 'src/graphql/ApiPubSub.js';
import GraphQLUserFriendlyError from 'src/graphql/GraphQLUserFriendlyError.js';
import { Account } from 'src/graphql/resolvers.generated.js';

export default class XtbPage {
  public readonly page: Page;
  private lastStockPrices: StockPriceChangeType | null = null;
  private watchPriceChangeIntervalId: NodeJS.Timeout | null = null;
  private loggedIn: boolean = false;

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

  public getLoggedIn(): boolean {
    return this.loggedIn;
  }

  public async getAccounts(): Promise<Account[]> {
    if (!this.loggedIn) {
      throw new GraphQLUserFriendlyError('You need to be logged in.');
    }
    return await fetchAccounts(this.page);
  }

  public async logIn(email: string, password: string): Promise<void> {
    if (this.loggedIn) {
      throw new GraphQLUserFriendlyError('You are already logged in.');
    }
    await logIn(email, password, this.page);
    this.loggedIn = true;
  }

  public async addStockToWatchList(fullTicker: string): Promise<void> {
    if (!this.loggedIn) {
      throw new GraphQLUserFriendlyError('You need to be logged in.');
    }
    await addStockToWatchList(fullTicker, this.page);
  }

  public async removeStockFromWatchList(fullTicker: string): Promise<void> {
    if (!this.loggedIn) {
      throw new GraphQLUserFriendlyError('You need to be logged in.');
    }
    await removeStockFromWatchList(fullTicker, this.page);
  }

  public async addStockToStrategyD(fullTicker: string, percent: number, pricePerLevel: number): Promise<void> {
    if (!this.loggedIn) {
      throw new GraphQLUserFriendlyError('You need to be logged in.');
    }
    await addStockToStrategyD(fullTicker, percent, pricePerLevel);
  }

  public checkStockPriceChangeAndUpdate(newStockPrices: StockPriceChangeType): boolean {
    if (_.isEqual(newStockPrices, this.lastStockPrices)) {
      return false;
    }
    this.lastStockPrices = newStockPrices;
    return true;
  }

  public async subscribeToPriceChange(pubsub: ApiPubSub): Promise<void> {
    if (!this.loggedIn) {
      throw new GraphQLUserFriendlyError('You need to be logged in.');
    }
    if (!this.watchPriceChangeIntervalId) {
      this.watchPriceChangeIntervalId = await watchPriceChange(this, pubsub);
    }
  }
}
