import { Router } from 'express';
import authRoutes from './auth.routes';
import zoneRoutes from './zones.routes';
import workerRoutes from './workers.routes';
import taskRoutes from './tasks.routes';
import inventoryRoutes from './inventory.routes';
import financeRoutes from './finance.routes';
import harvestRoutes from './harvests.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/zones', zoneRoutes);
router.use('/workers', workerRoutes);
router.use('/tasks', taskRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/transactions', financeRoutes);
router.use('/harvests', harvestRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
