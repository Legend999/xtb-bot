import { Page, TimeoutError } from 'puppeteer';
import postLoginCheck from 'src/browser/xtb/actions/postLoginCheck.js';
import GraphQLUserFriendlyError from 'src/graphql/GraphQLUserFriendlyError.js';
import { LogInStatus } from 'src/graphql/resolvers.generated.js';

export default async (email: string, password: string, page: Page): Promise<LogInStatus> => {
  await page.locator('input[name="xslogin"]').fill(email);
  await page.locator('input[name="xspass"]').fill(password);
  await page.locator('input.xs-btn.xs-btn-ok-login').click();

  const logInStatus = await getLogInStatus(page);

  if (logInStatus === LogInStatus.Success) {
    await postLoginCheck(page);
  }

  return logInStatus;
};

const getLogInStatus = async (page: Page): Promise<LogInStatus> => {
  try {
    return await Promise.race([
      page.waitForNavigation().then(() => LogInStatus.Success),
      page.locator('xs6-two-factor-authentication >>> .two-factor-auth .pds-button--style--primary')
        .click()
        .then(() => LogInStatus.Require_2Fa),
      page.locator('div.xs-error-msg > div')
        .map(element => element.textContent!)
        .wait()
        .then(errorMessage => {throw new GraphQLUserFriendlyError(errorMessage);}),
    ]);
  } catch (e: unknown) {
    if (e instanceof TimeoutError) {
      await page.reload();
      throw new GraphQLUserFriendlyError('Signing in is probably temporarily blocked due to excessive attempts. Please try again in a few hours.');
    }
    throw e;
  }
};
