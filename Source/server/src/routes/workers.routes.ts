import { Router } from 'express';
import { validate } from '../middleware/validate';
import { createWorkerSchema, updateWorkerSchema } from '../validators/worker.validator';
import * as workersController from '../controllers/workers.controller';

const router = Router();

router.get('/', workersController.getAll);
router.get('/:id', workersController.getById);
router.post('/', validate(createWorkerSchema), workersController.create);
router.put('/:id', validate(updateWorkerSchema), workersController.update);
router.delete('/:id', workersController.remove);

export default router;
