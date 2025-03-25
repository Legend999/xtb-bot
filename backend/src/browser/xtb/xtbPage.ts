import _ from 'lodash';
import { Browser, Page } from 'puppeteer';
import enter2fa from 'src/browser/xtb/actions/enter2fa.js';
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
import { Account, LogInStatus } from 'src/graphql/resolvers.generated.js';

export default class XtbPage {
  public readonly page: Page;
  private lastStockPrices: StockPriceChangeType | null = null;
  private watchPriceChangeIntervalId: NodeJS.Timeout | null = null;
  private logInStatus: LogInStatus = LogInStatus.LoggedOut;

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

  public getLogInStatus(): LogInStatus {
    return this.logInStatus;
  }

  public setLogInStatus(logInStatus: LogInStatus): void {
    this.logInStatus = logInStatus;
  }

  public async getAccounts(): Promise<Account[]> {
    if (this.logInStatus !== LogInStatus.Success) {
      throw new GraphQLUserFriendlyError('You need to be logged in.');
    }
    return await fetchAccounts(this.page);
  }

  public async logIn(email: string, password: string): Promise<void> {
    switch (this.logInStatus) {
      case LogInStatus.Success:
        throw new GraphQLUserFriendlyError('You are already logged in.');
      case LogInStatus.Require_2Fa:
        throw new GraphQLUserFriendlyError('You need to enter 2FA code.');
      case LogInStatus.LoggedOut:
        this.logInStatus = await logIn(email, password, this.page);
    }
  }

  public async enter2fa(code: string): Promise<void> {
    if (this.logInStatus !== LogInStatus.Require_2Fa) {
      throw new GraphQLUserFriendlyError('2FA is not required now.');
    }
    await enter2fa(code, this);

    this.logInStatus = LogInStatus.Success;
  }

  public async addStockToWatchList(fullTicker: string): Promise<void> {
    if (this.logInStatus !== LogInStatus.Success) {
      throw new GraphQLUserFriendlyError('You need to be logged in.');
    }
    await addStockToWatchList(fullTicker, this.page);
  }

  public async removeStockFromWatchList(fullTicker: string): Promise<void> {
    if (this.logInStatus !== LogInStatus.Success) {
      throw new GraphQLUserFriendlyError('You need to be logged in.');
    }
    await removeStockFromWatchList(fullTicker, this.page);
  }

  public async addStockToStrategyD(fullTicker: string, percent: number, pricePerLevel: number): Promise<void> {
    if (this.logInStatus !== LogInStatus.Success) {
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
    if (this.logInStatus !== LogInStatus.Success) {
      throw new GraphQLUserFriendlyError('You need to be logged in.');
    }
    if (!this.watchPriceChangeIntervalId) {
      this.watchPriceChangeIntervalId = await watchPriceChange(this, pubsub);
    }
  }
}
