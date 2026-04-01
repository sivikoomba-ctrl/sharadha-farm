import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('workers', (table) => {
    table.string('id', 36).primary();
    table.string('full_name', 100).notNullable();
    table.string('phone', 20);
    table.string('role', 30).notNullable();
    table.decimal('daily_wage', 10, 2);
    table.boolean('is_active').defaultTo(true);
    table.date('joined_date');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('workers');
}
