import knex from 'knex';
import path from 'path';
import { env } from './env';

const isPostgres = !!env.DATABASE_URL;

const db = knex(
  isPostgres
    ? {
        client: 'pg',
        connection: env.DATABASE_URL,
        pool: { min: 2, max: 10 },
      }
    : {
        client: 'better-sqlite3',
        connection: {
          filename: path.resolve(__dirname, '..', '..', 'data', 'sharadha_farm.db'),
        },
        useNullAsDefault: true,
      },
);

export { isPostgres };
export default db;
