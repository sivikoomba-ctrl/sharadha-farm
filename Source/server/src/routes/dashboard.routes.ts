import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';

const router = Router();

router.get('/summary', dashboardController.getSummary);
router.get('/harvest-trend', dashboardController.getHarvestTrend);
router.get('/finance-trend', dashboardController.getFinanceTrend);

export default router;
