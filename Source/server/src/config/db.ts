import knex from 'knex';
import path from 'path';

const db = knex({
  client: 'better-sqlite3',
  connection: {
    filename: path.resolve(__dirname, '..', '..', 'data', 'sharadha_farm.db'),
  },
  useNullAsDefault: true,
});

export default db;
