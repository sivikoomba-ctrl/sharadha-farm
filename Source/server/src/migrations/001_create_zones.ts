import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('zones', (table) => {
    table.string('id', 36).primary();
    table.string('name', 100).notNullable().unique();
    table.decimal('area_hectares', 8, 2);
    table.string('variety', 50);
    table.date('planting_date');
    table.string('status', 20).defaultTo('active');
    table.text('notes');
    table.text('sensor_config');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('zones');
}
