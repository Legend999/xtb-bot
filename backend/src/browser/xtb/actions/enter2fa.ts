import { Page } from 'puppeteer';
import { getTextContent } from 'src/browser/utils.js';
import postLoginCheck from 'src/browser/xtb/actions/postLoginCheck.js';
import XtbPage from 'src/browser/xtb/xtbPage.js';
import GraphQLUserFriendlyError from 'src/graphql/GraphQLUserFriendlyError.js';
import { LogInStatus } from 'src/graphql/resolvers.generated.js';

const sixDigitCodeRegex = /^\d{6}$/;

export default async (code: string, xtbPage: XtbPage) => {
  if (!sixDigitCodeRegex.test(code)) {
    throw new GraphQLUserFriendlyError('The code must be exactly 6 digits long.');
  }

  const page = xtbPage.page;
  const twoFaInput = page.locator('xs6-two-factor-authentication >>> #otpCode');
  const twoFaButton = page.locator('xs6-two-factor-authentication >>> .otp-step-container__btn');
  await twoFaInput.fill(code);
  await twoFaButton.click();

  const goToAddTrustedDeviceButton = page.locator('xs6-two-factor-authentication >>> xs6-path-selection-step-container .pds-button--style--primary')
    .setVisibility('visible');

  await Promise.race([
    goToAddTrustedDeviceButton.click(),
    handle2faHelperText(xtbPage.page),
    handleXtbError(xtbPage),
  ]);

  await addTrustedDevice(xtbPage);

  await postLoginCheck(page);
};

async function addTrustedDevice(xtbPage: XtbPage): Promise<void> {
  const page = xtbPage.page;

  const deviceNameInput = page.locator('xs6-two-factor-authentication >>> xs6-add-device-step-container #deviceName');
  await Promise.race([
    deviceNameInput.fill('XTB Bot'),
    handleXtbError(xtbPage),
  ]);

  const itsMyDeviceConfirmationCheckbox = page.locator('xs6-two-factor-authentication >>> xs6-add-device-step-container .pds-checkbox__native-control');
  await itsMyDeviceConfirmationCheckbox.click();

  const addTrustedDeviceButton = page.locator('xs6-two-factor-authentication >>> xs6-add-device-step-container .pds-button--style--primary');
  await addTrustedDeviceButton.click();

  const goToPlatformButton = page.locator('xs6-two-factor-authentication >>> xs6-trusted-device-added-step-container .pds-button--style--primary');
  await Promise.race([
    goToPlatformButton.click(),
    handleXtbError(xtbPage),
  ]);

  await page.waitForNavigation();
}

async function handle2faHelperText(page: Page) {
  // locator doesn't work because element is dynamically created
  const helperTextHandle = await page.waitForFunction(() => {
    const shadowHost = document.querySelector('xs6-two-factor-authentication');
    return shadowHost?.shadowRoot?.querySelector('.pds-helper-text__text');
  });
  const helperText = await getTextContent(helperTextHandle.asElement()!);
  await helperTextHandle.dispose();

  throw new GraphQLUserFriendlyError(helperText);
}

async function handleXtbError(xtbPage: XtbPage) {
  const page = xtbPage.page;
  const errorMessage = await page.locator('xs6-two-factor-authentication >>> xs6-error-step-container .error-step-container__body-heading')
    .setVisibility('visible')
    .map(element => element.textContent!)
    .wait();

  const goBackToLogInButton = page.locator('xs6-two-factor-authentication >>> xs6-error-step-container .error-step-container__button')
    .setVisibility('visible');
  await goBackToLogInButton.click();
  xtbPage.setLogInStatus(LogInStatus.LoggedOut);

  throw new GraphQLUserFriendlyError(`XTB reported an error: ${errorMessage}`);
}
