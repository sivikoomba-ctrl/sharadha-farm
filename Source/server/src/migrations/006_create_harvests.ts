import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('harvests', (table) => {
    table.string('id', 36).primary();
    table.string('zone_id', 36).notNullable().references('id').inTable('zones').onDelete('CASCADE');
    table.date('harvest_date').notNullable();
    table.decimal('quantity_kg', 10, 2).notNullable();
    table.string('grade', 10);
    table.text('notes');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('harvests');
}
