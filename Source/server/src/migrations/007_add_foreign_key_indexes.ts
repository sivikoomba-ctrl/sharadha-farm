import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('tasks', (table) => {
    table.index('zone_id');
    table.index('assigned_to');
    table.index('status');
  });

  await knex.schema.alterTable('transactions', (table) => {
    table.index('worker_id');
    table.index('inventory_item_id');
    table.index('type');
    table.index('transaction_date');
  });

  await knex.schema.alterTable('harvests', (table) => {
    table.index('zone_id');
    table.index('harvest_date');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('tasks', (table) => {
    table.dropIndex('zone_id');
    table.dropIndex('assigned_to');
    table.dropIndex('status');
  });

  await knex.schema.alterTable('transactions', (table) => {
    table.dropIndex('worker_id');
    table.dropIndex('inventory_item_id');
    table.dropIndex('type');
    table.dropIndex('transaction_date');
  });

  await knex.schema.alterTable('harvests', (table) => {
    table.dropIndex('zone_id');
    table.dropIndex('harvest_date');
  });
}
