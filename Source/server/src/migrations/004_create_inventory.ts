import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('inventory_items', (table) => {
    table.string('id', 36).primary();
    table.string('name', 150).notNullable();
    table.string('category', 30).notNullable();
    table.decimal('quantity', 10, 2).defaultTo(0);
    table.string('unit', 20);
    table.decimal('reorder_level', 10, 2).defaultTo(0);
    table.decimal('unit_cost', 10, 2).defaultTo(0);
    table.string('location', 100);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('inventory_items');
}
