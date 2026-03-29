import { Router } from 'express';
import * as meetingController from '../controllers/meeting.controller.js';

const router = Router();

router.post('/process-meeting', meetingController.postProcessMeeting);

export default router;
