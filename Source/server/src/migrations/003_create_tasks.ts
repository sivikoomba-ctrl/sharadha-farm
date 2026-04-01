import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('tasks', (table) => {
    table.string('id', 36).primary();
    table.string('title', 200).notNullable();
    table.text('description');
    table.string('zone_id', 36).references('id').inTable('zones').onDelete('SET NULL');
    table.string('assigned_to', 36).references('id').inTable('workers').onDelete('SET NULL');
    table.string('status', 20).defaultTo('pending');
    table.string('priority', 10).defaultTo('medium');
    table.string('category', 30).defaultTo('general');
    table.date('due_date');
    table.timestamp('completed_at');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('tasks');
}
