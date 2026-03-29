import { Router } from 'express';
import * as alertsController from '../controllers/alerts.controller.js';

const router = Router();

router.get('/alerts', alertsController.getAlerts);

export default router;
