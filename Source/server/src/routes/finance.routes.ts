import { Router } from 'express';
import { validate } from '../middleware/validate';
import { createTransactionSchema, updateTransactionSchema } from '../validators/finance.validator';
import * as financeController from '../controllers/finance.controller';

const router = Router();

router.get('/summary', financeController.getSummary);
router.get('/', financeController.getAll);
router.get('/:id', financeController.getById);
router.post('/', validate(createTransactionSchema), financeController.create);
router.put('/:id', validate(updateTransactionSchema), financeController.update);
router.delete('/:id', financeController.remove);

export default router;
