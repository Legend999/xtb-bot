import { ElementHandle } from 'puppeteer';
import { clearInput, getTextContent } from 'src/browser/utils.js';
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
  const twoFaInput = await page.$('xs6-two-factor-authentication >>> #otpCode');
  const twoFaButton = await page.$('xs6-two-factor-authentication >>> .otp-step-container__btn');

  await clearInput(twoFaInput!);
  await twoFaInput!.type(code);
  await twoFaButton!.click();

  const goToAddTrustedDeviceButton = await Promise.race([
    page.waitForSelector('xs6-two-factor-authentication >>> xs6-path-selection-step-container .pds-button--style--primary', {visible: true}),
    page.waitForSelector('xs6-two-factor-authentication >>> xs6-otp-step-container .pds-helper-text__text').then(async (result: ElementHandle | null) => {
      const errorMessage = await getTextContent(result!);
      return Promise.reject(new GraphQLUserFriendlyError(errorMessage));
    }),
    handleXtbError(xtbPage),
  ]);

  await goToAddTrustedDeviceButton!.click();

  await addTrustedDevice(xtbPage);

  await postLoginCheck(page);
};

async function addTrustedDevice(xtbPage: XtbPage): Promise<void> {
  const page = xtbPage.page;

  const deviceNameInput = await Promise.race([
    page.waitForSelector('xs6-two-factor-authentication >>> xs6-add-device-step-container #deviceName'),
    handleXtbError(xtbPage),
  ]);
  await clearInput(deviceNameInput!);
  await deviceNameInput!.type('XTB Bot');

  const itsMyDeviceConfirmationCheckbox = await page.$('xs6-two-factor-authentication >>> xs6-add-device-step-container .pds-checkbox__native-control');
  await itsMyDeviceConfirmationCheckbox!.click();

  const addTrustedDeviceButton = await page.$('xs6-two-factor-authentication >>> xs6-add-device-step-container .pds-button--style--primary');
  await addTrustedDeviceButton!.click();

  const goToPlatformButton = await Promise.race([
    page.waitForSelector('xs6-two-factor-authentication >>> xs6-trusted-device-added-step-container .pds-button--style--primary'),
    handleXtbError(xtbPage),
  ]);

  await goToPlatformButton!.click();

  await page.waitForNavigation();
}

async function handleXtbError(xtbPage: XtbPage) {
  const page = xtbPage.page;
  return page.waitForSelector('xs6-two-factor-authentication >>> xs6-error-step-container .error-step-container__body-heading', {visible: true}).then(async (result: ElementHandle | null) => {
    const errorMessage = await getTextContent(result!);

    const goBackToLogInButton = await page.$('xs6-two-factor-authentication >>> xs6-error-step-container .error-step-container__button');
    await goBackToLogInButton!.click();
    xtbPage.setLogInStatus(LogInStatus.LoggedOut);

    return Promise.reject(new GraphQLUserFriendlyError(`XTB reported an error: ${errorMessage}`));
  });
}
