import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('workers').insert([
    { id: 'b1b2c3d4-0001-4000-8000-000000000001', full_name: 'Ravi Kumar', phone: '+91-9876543210', role: 'supervisor', daily_wage: 800, is_active: true, joined_date: '2020-01-10' },
    { id: 'b1b2c3d4-0002-4000-8000-000000000002', full_name: 'Lakshmi Devi', phone: '+91-9876543211', role: 'supervisor', daily_wage: 750, is_active: true, joined_date: '2020-03-15' },
    { id: 'b1b2c3d4-0003-4000-8000-000000000003', full_name: 'Suresh Reddy', phone: '+91-9876543212', role: 'field_worker', daily_wage: 500, is_active: true, joined_date: '2021-06-01' },
    { id: 'b1b2c3d4-0004-4000-8000-000000000004', full_name: 'Anitha Kumari', phone: '+91-9876543213', role: 'field_worker', daily_wage: 500, is_active: true, joined_date: '2021-08-20' },
    { id: 'b1b2c3d4-0005-4000-8000-000000000005', full_name: 'Venkat Rao', phone: '+91-9876543214', role: 'field_worker', daily_wage: 500, is_active: true, joined_date: '2022-04-10' },
    { id: 'b1b2c3d4-0006-4000-8000-000000000006', full_name: 'Priya Sharma', phone: '+91-9876543215', role: 'seasonal', daily_wage: 400, is_active: false, joined_date: '2025-05-01' },
  ]);
}
