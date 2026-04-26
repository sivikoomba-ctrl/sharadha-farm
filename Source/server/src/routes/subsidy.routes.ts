import { Router } from 'express';
import { validate } from '../middleware/validate';
import {
  createApplicationSchema,
  updateApplicationSchema,
  updateDocumentSchema,
  advanceStageSchema,
} from '../validators/subsidy.validator';
import * as subsidyController from '../controllers/subsidy.controller';

const router = Router();

router.get('/', subsidyController.getAll);
router.get('/active', subsidyController.getActive);
router.get('/:id', subsidyController.getById);
router.post('/', validate(createApplicationSchema), subsidyController.create);
router.patch('/:id', validate(updateApplicationSchema), subsidyController.update);
router.delete('/:id', subsidyController.remove);
router.patch('/:id/documents/:docKey', validate(updateDocumentSchema), subsidyController.updateDocument);
router.post('/:id/advance-stage', validate(advanceStageSchema), subsidyController.advanceStage);

export default router;
