import { getValidPortNumber } from '@shared/utils/port.js';
import dotenv from 'dotenv';
import path from 'path';
import { DataSource } from 'typeorm';

dotenv.config({path: path.resolve(import.meta.dirname, '../../.env')});
const dbPort = getValidPortNumber(process.env.DB_PORT);

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: dbPort,
  username: 'root',
  password: process.env.DB_ROOT_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true, // @todo change to migrations
  logging: false,
  entities: ['src/entity/**/*.ts'],
  migrations: ['src/migration/*.ts'],
});
