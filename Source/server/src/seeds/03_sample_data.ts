import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Tasks
  await knex('tasks').insert([
    { id: 'c1c2c3d4-0001-4000-8000-000000000001', title: 'Prune North Block A bushes', description: 'Winter pruning of mature Duke bushes', zone_id: 'a1b2c3d4-0001-4000-8000-000000000001', assigned_to: 'b1b2c3d4-0003-4000-8000-000000000003', status: 'completed', priority: 'high', category: 'pruning', due_date: '2026-02-15', completed_at: '2026-02-14T10:00:00Z' },
    { id: 'c1c2c3d4-0002-4000-8000-000000000002', title: 'Apply NPK fertilizer to South Block', description: 'Spring fertilization round 1', zone_id: 'a1b2c3d4-0002-4000-8000-000000000002', assigned_to: 'b1b2c3d4-0004-4000-8000-000000000004', status: 'in_progress', priority: 'high', category: 'fertilizing', due_date: '2026-04-05' },
    { id: 'c1c2c3d4-0003-4000-8000-000000000003', title: 'Check irrigation drip lines', description: 'Inspect and repair drip irrigation across all zones', zone_id: null, assigned_to: 'b1b2c3d4-0005-4000-8000-000000000005', status: 'pending', priority: 'medium', category: 'irrigation', due_date: '2026-04-10' },
    { id: 'c1c2c3d4-0004-4000-8000-000000000004', title: 'Spray fungicide on East Ridge', description: 'Preventive treatment for botrytis', zone_id: 'a1b2c3d4-0003-4000-8000-000000000003', assigned_to: 'b1b2c3d4-0003-4000-8000-000000000003', status: 'pending', priority: 'high', category: 'pest_control', due_date: '2026-04-08' },
    { id: 'c1c2c3d4-0005-4000-8000-000000000005', title: 'Harvest South Block B - Round 1', description: 'First harvest of the season', zone_id: 'a1b2c3d4-0002-4000-8000-000000000002', assigned_to: 'b1b2c3d4-0001-4000-8000-000000000001', status: 'pending', priority: 'high', category: 'harvest', due_date: '2026-05-20' },
    { id: 'c1c2c3d4-0006-4000-8000-000000000006', title: 'Repair greenhouse ventilation', description: 'Fix the broken fan in nursery greenhouse', zone_id: 'a1b2c3d4-0004-4000-8000-000000000004', assigned_to: 'b1b2c3d4-0005-4000-8000-000000000005', status: 'pending', priority: 'low', category: 'general', due_date: '2026-04-20' },
    { id: 'c1c2c3d4-0007-4000-8000-000000000007', title: 'Soil pH testing - all zones', description: 'Quarterly pH check for blueberry optimal range (4.5-5.5)', zone_id: null, assigned_to: 'b1b2c3d4-0002-4000-8000-000000000002', status: 'in_progress', priority: 'medium', category: 'general', due_date: '2026-04-03' },
    { id: 'c1c2c3d4-0008-4000-8000-000000000008', title: 'Mulch East Ridge beds', description: 'Apply pine bark mulch to maintain soil acidity', zone_id: 'a1b2c3d4-0003-4000-8000-000000000003', assigned_to: 'b1b2c3d4-0004-4000-8000-000000000004', status: 'pending', priority: 'medium', category: 'general', due_date: '2026-04-15' },
    { id: 'c1c2c3d4-0009-4000-8000-000000000009', title: 'Order packaging materials', description: 'Clamshells and labels for upcoming harvest season', zone_id: null, assigned_to: 'b1b2c3d4-0002-4000-8000-000000000002', status: 'completed', priority: 'medium', category: 'general', due_date: '2026-03-25', completed_at: '2026-03-24T14:00:00Z' },
    { id: 'c1c2c3d4-0010-4000-8000-000000000010', title: 'Install bird netting on North Block', description: 'Protect ripening berries from birds', zone_id: 'a1b2c3d4-0001-4000-8000-000000000001', assigned_to: 'b1b2c3d4-0003-4000-8000-000000000003', status: 'pending', priority: 'high', category: 'general', due_date: '2026-05-01' },
  ]);

  // Inventory Items
  await knex('inventory_items').insert([
    { id: 'c1c2c3d4-1001-4000-8000-000000000001', name: 'NPK 10-10-10 Fertilizer', category: 'fertilizer', quantity: 150, unit: 'kg', reorder_level: 50, unit_cost: 45, location: 'Storage Shed A' },
    { id: 'c1c2c3d4-1002-4000-8000-000000000002', name: 'Sulfur Powder', category: 'fertilizer', quantity: 30, unit: 'kg', reorder_level: 20, unit_cost: 80, location: 'Storage Shed A' },
    { id: 'c1c2c3d4-1003-4000-8000-000000000003', name: 'Botrytis Fungicide', category: 'pesticide', quantity: 10, unit: 'liters', reorder_level: 5, unit_cost: 350, location: 'Chemical Store' },
    { id: 'c1c2c3d4-1004-4000-8000-000000000004', name: 'Neem Oil Concentrate', category: 'pesticide', quantity: 8, unit: 'liters', reorder_level: 10, unit_cost: 200, location: 'Chemical Store' },
    { id: 'c1c2c3d4-1005-4000-8000-000000000005', name: 'Pruning Shears', category: 'tool', quantity: 12, unit: 'units', reorder_level: 5, unit_cost: 250, location: 'Tool Room' },
    { id: 'c1c2c3d4-1006-4000-8000-000000000006', name: 'Drip Irrigation Tubing', category: 'tool', quantity: 200, unit: 'units', reorder_level: 50, unit_cost: 15, location: 'Storage Shed B' },
    { id: 'c1c2c3d4-1007-4000-8000-000000000007', name: 'Berry Clamshells (125g)', category: 'packaging', quantity: 2000, unit: 'units', reorder_level: 500, unit_cost: 3, location: 'Packing House' },
    { id: 'c1c2c3d4-1008-4000-8000-000000000008', name: 'Pine Bark Mulch', category: 'other', quantity: 80, unit: 'bags', reorder_level: 30, unit_cost: 120, location: 'Storage Shed B' },
  ]);

  // Transactions
  await knex('transactions').insert([
    { id: 'c1c2c3d4-2001-4000-8000-000000000001', type: 'expense', category: 'labor', amount: 24000, description: 'March wages - field workers (3 workers x 20 days)', transaction_date: '2026-03-31', worker_id: null },
    { id: 'c1c2c3d4-2002-4000-8000-000000000002', type: 'expense', category: 'labor', amount: 31000, description: 'March wages - supervisors (2 x 20 days)', transaction_date: '2026-03-31', worker_id: null },
    { id: 'c1c2c3d4-2003-4000-8000-000000000003', type: 'expense', category: 'supplies', amount: 6750, description: 'NPK Fertilizer purchase - 150kg', transaction_date: '2026-03-10' },
    { id: 'c1c2c3d4-2004-4000-8000-000000000004', type: 'expense', category: 'supplies', amount: 3500, description: 'Botrytis fungicide - 10L', transaction_date: '2026-03-12' },
    { id: 'c1c2c3d4-2005-4000-8000-000000000005', type: 'expense', category: 'supplies', amount: 6000, description: 'Berry clamshells - 2000 units', transaction_date: '2026-03-20' },
    { id: 'c1c2c3d4-2006-4000-8000-000000000006', type: 'expense', category: 'equipment', amount: 15000, description: 'Drip irrigation repair and new tubing', transaction_date: '2026-02-25' },
    { id: 'c1c2c3d4-2007-4000-8000-000000000007', type: 'expense', category: 'transport', amount: 4500, description: 'Monthly transport for supplies', transaction_date: '2026-03-15' },
    { id: 'c1c2c3d4-2008-4000-8000-000000000008', type: 'revenue', category: 'sales', amount: 85000, description: 'Blueberry sales - Grade A (200kg @ Rs.425/kg)', transaction_date: '2026-01-15' },
    { id: 'c1c2c3d4-2009-4000-8000-000000000009', type: 'revenue', category: 'sales', amount: 52500, description: 'Blueberry sales - Grade B (150kg @ Rs.350/kg)', transaction_date: '2026-01-20' },
    { id: 'c1c2c3d4-2010-4000-8000-000000000010', type: 'revenue', category: 'sales', amount: 110000, description: 'Blueberry sales - Grade A (250kg @ Rs.440/kg)', transaction_date: '2026-02-10' },
    { id: 'c1c2c3d4-2011-4000-8000-000000000011', type: 'revenue', category: 'sales', amount: 63000, description: 'Blueberry sales - Grade B (180kg @ Rs.350/kg)', transaction_date: '2026-02-18' },
    { id: 'c1c2c3d4-2012-4000-8000-000000000012', type: 'revenue', category: 'sales', amount: 95000, description: 'Blueberry sales - Grade A (220kg @ Rs.432/kg)', transaction_date: '2026-03-05' },
    { id: 'c1c2c3d4-2013-4000-8000-000000000013', type: 'expense', category: 'other', amount: 2500, description: 'Soil testing lab fees', transaction_date: '2026-03-08' },
    { id: 'c1c2c3d4-2014-4000-8000-000000000014', type: 'expense', category: 'supplies', amount: 9600, description: 'Pine bark mulch - 80 bags', transaction_date: '2026-03-18' },
    { id: 'c1c2c3d4-2015-4000-8000-000000000015', type: 'revenue', category: 'sales', amount: 42000, description: 'Blueberry sales - Grade C (200kg @ Rs.210/kg)', transaction_date: '2026-03-12' },
  ]);

  // Harvests
  await knex('harvests').insert([
    { id: 'c1c2c3d4-3001-4000-8000-000000000001', zone_id: 'a1b2c3d4-0001-4000-8000-000000000001', harvest_date: '2025-06-10', quantity_kg: 320, grade: 'A', notes: 'Excellent quality, Duke variety peak season' },
    { id: 'c1c2c3d4-3002-4000-8000-000000000002', zone_id: 'a1b2c3d4-0002-4000-8000-000000000002', harvest_date: '2025-06-15', quantity_kg: 450, grade: 'A', notes: 'Bluecrop heavy yield' },
    { id: 'c1c2c3d4-3003-4000-8000-000000000003', zone_id: 'a1b2c3d4-0001-4000-8000-000000000001', harvest_date: '2025-07-05', quantity_kg: 280, grade: 'B', notes: 'Second pick, slightly smaller berries' },
    { id: 'c1c2c3d4-3004-4000-8000-000000000004', zone_id: 'a1b2c3d4-0002-4000-8000-000000000002', harvest_date: '2025-07-10', quantity_kg: 380, grade: 'A', notes: 'Good size and color' },
    { id: 'c1c2c3d4-3005-4000-8000-000000000005', zone_id: 'a1b2c3d4-0002-4000-8000-000000000002', harvest_date: '2025-08-01', quantity_kg: 200, grade: 'C', notes: 'Late season, smaller berries for processing' },
    { id: 'c1c2c3d4-3006-4000-8000-000000000006', zone_id: 'a1b2c3d4-0001-4000-8000-000000000001', harvest_date: '2026-01-10', quantity_kg: 200, grade: 'A', notes: 'Early season harvest' },
    { id: 'c1c2c3d4-3007-4000-8000-000000000007', zone_id: 'a1b2c3d4-0002-4000-8000-000000000002', harvest_date: '2026-01-20', quantity_kg: 250, grade: 'A', notes: 'Good early yield from Bluecrop' },
    { id: 'c1c2c3d4-3008-4000-8000-000000000008', zone_id: 'a1b2c3d4-0001-4000-8000-000000000001', harvest_date: '2026-02-08', quantity_kg: 270, grade: 'A', notes: 'Peak quality' },
    { id: 'c1c2c3d4-3009-4000-8000-000000000009', zone_id: 'a1b2c3d4-0002-4000-8000-000000000002', harvest_date: '2026-02-15', quantity_kg: 180, grade: 'B', notes: 'Moderate yield' },
    { id: 'c1c2c3d4-3010-4000-8000-000000000010', zone_id: 'a1b2c3d4-0001-4000-8000-000000000001', harvest_date: '2026-03-01', quantity_kg: 220, grade: 'A', notes: 'Consistent quality' },
  ]);
}
