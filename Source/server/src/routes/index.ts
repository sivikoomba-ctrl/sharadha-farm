import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import authRoutes from './auth.routes';
import zoneRoutes from './zones.routes';
import workerRoutes from './workers.routes';
import taskRoutes from './tasks.routes';
import inventoryRoutes from './inventory.routes';
import financeRoutes from './finance.routes';
import harvestRoutes from './harvests.routes';
import dashboardRoutes from './dashboard.routes';
import subsidyRoutes from './subsidy.routes';

const router = Router();

// Public routes
router.use('/auth', authRoutes);

// Protected routes — require valid JWT
router.use('/zones', authenticate, zoneRoutes);
router.use('/workers', authenticate, workerRoutes);
router.use('/tasks', authenticate, taskRoutes);
router.use('/inventory', authenticate, inventoryRoutes);
router.use('/transactions', authenticate, financeRoutes);
router.use('/harvests', authenticate, harvestRoutes);
router.use('/dashboard', authenticate, dashboardRoutes);
router.use('/subsidy-applications', authenticate, subsidyRoutes);

export default router;
