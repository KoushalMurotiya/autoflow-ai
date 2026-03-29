import { Router } from 'express';
import * as tasksController from '../controllers/tasks.controller.js';

const router = Router();

router.get('/tasks', tasksController.getTasks);
router.patch('/tasks/:id', tasksController.patchTask);

export default router;
