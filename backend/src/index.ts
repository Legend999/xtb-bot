import 'reflect-metadata';
import { getValidPortNumber } from '@shared/utils/port.js';
import dotenv from 'dotenv';
import path from 'path';
import BrowserSingleton from 'src/browser/browserSingleton.js';
import XtbPage from 'src/browser/xtb/xtbPage.js';
import { AppDataSource } from 'src/dataSource.js';
import startApolloServer from 'src/server/apolloServer.js';
import { logErrorAndExit } from 'src/utils/errorLogger.js';

dotenv.config({path: path.resolve(import.meta.dirname, '../../.env')});
const bePort = getValidPortNumber(process.env.BE_PORT);

try {
  await AppDataSource.initialize();
  const browser = await BrowserSingleton.get();
  const xtbPage = await XtbPage.create(browser);
  await startApolloServer(xtbPage, bePort);
} catch (e) {
  await BrowserSingleton.close();
  logErrorAndExit(e);
}
