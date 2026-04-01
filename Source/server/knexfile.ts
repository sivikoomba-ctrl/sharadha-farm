import path from 'path';
import { fileURLToPath } from 'url';
import type { Knex } from 'knex';

const currentDir = typeof __dirname !== 'undefined'
  ? __dirname
  : path.dirname(fileURLToPath(import.meta.url));

const config: Knex.Config = {
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
