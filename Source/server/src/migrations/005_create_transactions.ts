import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('transactions', (table) => {
    table.string('id', 36).primary();
    table.string('type', 10).notNullable();
    table.string('category', 30).notNullable();
    table.decimal('amount', 12, 2).notNullable();
    table.string('description', 300);
    table.date('transaction_date').notNullable();
    table.string('worker_id', 36).references('id').inTable('workers').onDelete('SET NULL');
    table.string('inventory_item_id', 36).references('id').inTable('inventory_items').onDelete('SET NULL');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('transactions');
}
