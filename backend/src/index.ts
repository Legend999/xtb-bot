import dotenv from 'dotenv';
import path from 'path';
import BrowserSingleton from 'src/browser/browserSingleton.js';
import XtbPage from 'src/browser/xtb/xtbPage.js';
import startApolloServer from 'src/server/apolloServer.js';
import { logErrorAndExit } from 'src/utils/errorLogger.js';
import { getValidPortNumber } from 'src/utils/port.js';

dotenv.config({path: path.resolve(import.meta.dirname, '../../.env')});
const port = getValidPortNumber(process.env.BE_PORT);

try {
  const browser = await BrowserSingleton.get();
  const xtbPage = await XtbPage.create(browser);
  await startApolloServer(xtbPage, port);
} catch (e) {
  await BrowserSingleton.close();
  logErrorAndExit(e);
}
