import * as escalationService from '../services/escalation.service.js';

export async function getAlerts(_req, res, next) {
  try {
    await escalationService.checkEscalations();
    const tasks = await escalationService.getDelayedTasks();
    res.json(tasks);
  } catch (err) {
    next(err);
  }
}
