import { Router } from 'express';
import { validate } from '../middleware/validate';
import { createInventorySchema, updateInventorySchema } from '../validators/inventory.validator';
import * as inventoryController from '../controllers/inventory.controller';

const router = Router();

router.get('/', inventoryController.getAll);
router.get('/:id', inventoryController.getById);
router.post('/', validate(createInventorySchema), inventoryController.create);
router.put('/:id', validate(updateInventorySchema), inventoryController.update);
router.delete('/:id', inventoryController.remove);

export default router;
