import { Router } from 'express';
import alertsRoutes from './alerts.routes.js';
import healthRoutes from './health.routes.js';
import meetingRoutes from './meeting.routes.js';
import tasksRoutes from './tasks.routes.js';

const router = Router();

router.use(healthRoutes);
router.use(meetingRoutes);
router.use(tasksRoutes);
router.use(alertsRoutes);

export default router;
