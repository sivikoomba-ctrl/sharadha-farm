import path from 'path';
import { fileURLToPath } from 'url';
import type { Knex } from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const currentDir = typeof __dirname !== 'undefined'
  ? __dirname
  : path.dirname(fileURLToPath(import.meta.url));

const isPostgres = !!process.env.DATABASE_URL;

const config: Knex.Config = isPostgres
  ? {
      client: 'pg',
      connection: process.env.DATABASE_URL,
      pool: { min: 2, max: 10 },
      migrations: {
        directory: './src/migrations',
        extension: 'ts',
      },
      seeds: {
        directory: './src/seeds',
        extension: 'ts',
      },
    }
  : {
      client: 'better-sqlite3',
      connection: {
        filename: path.resolve(currentDir, 'data', 'sharadha_farm.db'),
      },
      useNullAsDefault: true,
      migrations: {
        directory: './src/migrations',
        extension: 'ts',
      },
      seeds: {
        directory: './src/seeds',
        extension: 'ts',
      },
    };

export default config;
