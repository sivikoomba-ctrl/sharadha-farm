import { Router } from 'express';
import { validate } from '../middleware/validate';
import { createTaskSchema, updateTaskSchema, updateTaskStatusSchema } from '../validators/task.validator';
import * as tasksController from '../controllers/tasks.controller';

const router = Router();

router.get('/', tasksController.getAll);
router.get('/:id', tasksController.getById);
router.post('/', validate(createTaskSchema), tasksController.create);
router.put('/:id', validate(updateTaskSchema), tasksController.update);
router.patch('/:id/status', validate(updateTaskStatusSchema), tasksController.updateStatus);
router.delete('/:id', tasksController.remove);

export default router;
