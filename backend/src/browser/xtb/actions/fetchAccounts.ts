import { Page } from 'puppeteer';
import {
  Account,
  AccountCurrency,
  AccountType,
} from 'src/graphql/resolvers.generated.js';
import { toEnum } from 'src/utils/enum.js';

export const fetchAccounts = async (page: Page): Promise<Account[]> => {
  const data = await page.evaluate(() => {
    const accountListElements = document.querySelectorAll('xs-combobox[title="Change account"] .dropdown-menu li, xs-combobox[title="Zmień konto"] .dropdown-menu li');

    return Array.from(accountListElements).map((item) => {
      const type = item.querySelector('.xs-account-label-server-part')!.textContent!;
      const number = item.querySelector('.xs-account-label-login-part')!.textContent!;
      const currency = item.querySelector('.xs-account-label-currency-part')!.textContent!;

      return {type, number, currency};
    });
  });

  return data.map(({type, number, currency}) => ({
    type: toEnum(AccountType, type),
    number: number,
    currency: toEnum(AccountCurrency, currency),
  }));
};
