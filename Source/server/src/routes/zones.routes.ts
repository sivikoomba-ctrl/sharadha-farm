import { Router } from 'express';
import { validate } from '../middleware/validate';
import { createZoneSchema, updateZoneSchema } from '../validators/zone.validator';
import * as zonesController from '../controllers/zones.controller';

const router = Router();

router.get('/', zonesController.getAll);
router.get('/:id', zonesController.getById);
router.post('/', validate(createZoneSchema), zonesController.create);
router.put('/:id', validate(updateZoneSchema), zonesController.update);
router.delete('/:id', zonesController.remove);

export default router;
