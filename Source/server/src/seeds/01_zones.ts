import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('harvests').del();
  await knex('tasks').del();
  await knex('transactions').del();
  await knex('inventory_items').del();
  await knex('workers').del();
  await knex('zones').del();

  await knex('zones').insert([
    { id: 'a1b2c3d4-0001-4000-8000-000000000001', name: 'North Block A', area_hectares: 2.5, variety: 'Duke', planting_date: '2021-03-15', status: 'active', notes: 'Primary high-yield zone' },
    { id: 'a1b2c3d4-0002-4000-8000-000000000002', name: 'South Block B', area_hectares: 3.0, variety: 'Bluecrop', planting_date: '2020-06-20', status: 'active', notes: 'Mature bushes, consistent production' },
    { id: 'a1b2c3d4-0003-4000-8000-000000000003', name: 'East Ridge', area_hectares: 1.8, variety: 'Jersey', planting_date: '2023-02-10', status: 'active', notes: 'Young plants, first harvest expected 2026' },
    { id: 'a1b2c3d4-0004-4000-8000-000000000004', name: 'Greenhouse Nursery', area_hectares: 0.5, variety: 'Legacy', planting_date: '2024-01-05', status: 'replanting', notes: 'Experimental varieties and seedling nursery' },
  ]);
}
