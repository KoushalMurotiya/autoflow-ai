import * as taskService from '../services/task.service.js';

function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

export async function getTasks(_req, res, next) {
  try {
    const tasks = await taskService.getAllTasks();
    res.json(tasks);
  } catch (err) {
    next(err);
  }
}

export async function deleteTasks(_req, res, next) {
  try {
    await taskService.deleteAllTasks();
    res.json({ message: 'All tasks cleared' });
  } catch (err) {
    next(err);
  }
}

export async function patchTask(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body ?? {};

    if (status === undefined || status === null) {
      throw badRequest('Field "status" is required');
    }
    if (typeof status !== 'string' || !status.trim()) {
      throw badRequest('Field "status" must be a non-empty string');
    }

    const task = await taskService.updateTaskStatus(id, status.trim());
    res.json(task);
  } catch (err) {
    next(err);
  }
}
