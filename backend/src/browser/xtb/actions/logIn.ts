import { ElementHandle, HTTPResponse, TimeoutError } from 'puppeteer';
import { clearInput } from '../../../browser/utils.js';
import GraphQLUserFriendlyError
  from '../../../server/graphQLUserFriendlyError.js';
import XtbPage from '../xtbPage.js';

export default async (xtbPage: XtbPage, email: string, password: string) => {
  if (xtbPage.isLoggedIn()) {
    throw new GraphQLUserFriendlyError('You are already logged in.');
  }

  const page = xtbPage.get();

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

  xtbPage.setLoggedIn(true);
};
