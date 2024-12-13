import dotenv from 'dotenv';
import path from 'path';
import BrowserSingleton from './browser/browserSingleton.js';
import XtbPage from './browser/xtb/xtbPage.js';
import startApolloServer from './server/startApolloServer.js';
import { logErrorAndExit } from './utils/errorLogger.js';
import { getValidPortNumber } from './utils/port.js';

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
