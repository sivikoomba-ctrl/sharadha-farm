import { Router } from 'express';
import { validate } from '../middleware/validate';
import { createHarvestSchema, updateHarvestSchema } from '../validators/harvest.validator';
import * as harvestsController from '../controllers/harvests.controller';

const router = Router();

router.get('/', harvestsController.getAll);
router.post('/', validate(createHarvestSchema), harvestsController.create);
router.put('/:id', validate(updateHarvestSchema), harvestsController.update);
router.delete('/:id', harvestsController.remove);

export default router;
