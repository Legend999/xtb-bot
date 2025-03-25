import { ElementHandle, Page, TimeoutError } from 'puppeteer';
import { clearInput, getTextContent } from 'src/browser/utils.js';
import postLoginCheck from 'src/browser/xtb/actions/postLoginCheck.js';
import GraphQLUserFriendlyError from 'src/graphql/GraphQLUserFriendlyError.js';
import { LogInStatus } from 'src/graphql/resolvers.generated.js';

export default async (email: string, password: string, page: Page): Promise<LogInStatus> => {
  const loginInput = await page.waitForSelector('input[name=\'xslogin\']');
  const passwordInput = await page.waitForSelector('input[name=\'xspass\']');
  const loginButton = await page.waitForSelector('input.xs-btn.xs-btn-ok-login');

  await clearInput(loginInput!);
  await clearInput(passwordInput!);

  await loginInput!.type(email);
  await passwordInput!.type(password);
  await loginButton!.click();

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
      page.waitForSelector('xs6-two-factor-authentication >>> .two-factor-auth .pds-button--style--primary', {visible: true}).then(async (result: ElementHandle | null) => {
        await result!.click();
        return LogInStatus.Require_2Fa;
      }),
      page.waitForSelector('div.xs-error-msg > div').then(async (result: ElementHandle | null) => {
        const errorMessage = await getTextContent(result!);
        return Promise.reject(new GraphQLUserFriendlyError(errorMessage));
      }),
    ]);
  } catch (e: unknown) {
    if (e instanceof TimeoutError) {
      await page.reload();
      throw new GraphQLUserFriendlyError('Signing in is probably temporarily blocked due to excessive attempts. Please try again in a few hours.');
    }
    throw e;
  }
};
