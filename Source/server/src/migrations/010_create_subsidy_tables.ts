import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('subsidy_applications', (table) => {
    table.string('id', 36).primary();
    table.string('applicant_name', 200).notNullable();
    table.string('family_id', 100).nullable();
    table.string('project_type', 20).notNullable();
    table.decimal('subsidy_cap_inr', 14, 2).notNullable().defaultTo(0);
    table.integer('current_stage').notNullable().defaultTo(1);
    table.string('status', 20).notNullable().defaultTo('active');
    table.string('consultant_name', 200).nullable();
    table.string('consultant_phone', 50).nullable();
    table.string('consultant_email', 200).nullable();
    table.text('notes').nullable();
    table.date('dpr_submission_date').nullable();
    table.date('bank_sanction_date').nullable();
    table.date('online_application_date').nullable();
    table.date('goc_date').nullable();
    table.date('first_term_loan_release_date').nullable();
    table.date('project_completion_date').nullable();
    table.date('subsidy_claim_date').nullable();
    table.date('subsidy_received_date').nullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable('subsidy_documents', (table) => {
    table.string('id', 36).primary();
    table.string('application_id', 36).notNullable()
      .references('id').inTable('subsidy_applications').onDelete('CASCADE');
    table.string('doc_key', 50).notNullable();
    table.string('category', 20).notNullable();
    table.boolean('is_uploaded').notNullable().defaultTo(false);
    table.boolean('is_notarized').notNullable().defaultTo(false);
    table.boolean('is_translated').notNullable().defaultTo(false);
    table.text('file_url').nullable();
    table.date('submitted_date').nullable();
    table.text('notes').nullable();
    table.unique(['application_id', 'doc_key']);
    table.index('application_id');
  });

  await knex.schema.createTable('subsidy_stage_events', (table) => {
    table.string('id', 36).primary();
    table.string('application_id', 36).notNullable()
      .references('id').inTable('subsidy_applications').onDelete('CASCADE');
    table.integer('stage').notNullable();
    table.string('event_type', 20).notNullable();
    table.date('event_date').notNullable();
    table.text('notes').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index('application_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('subsidy_stage_events');
  await knex.schema.dropTableIfExists('subsidy_documents');
  await knex.schema.dropTableIfExists('subsidy_applications');
}
