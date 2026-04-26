import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.string('email', 255).unique();
    table.string('google_id', 255).unique();
    table.string('avatar_url', 500);
    table.string('password_hash', 255).nullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('email');
    table.dropColumn('google_id');
    table.dropColumn('avatar_url');
  });
}
