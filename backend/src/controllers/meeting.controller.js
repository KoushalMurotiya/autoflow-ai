/**
 * POST /process-meeting: runs Groq extraction on notes, persists tasks to Supabase.
 */
import * as meetingService from '../services/meeting.service.js';
import * as taskService from '../services/task.service.js';

function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

export async function postProcessMeeting(req, res, next) {
  try {
    const { text } = req.body ?? {};

    if (text === undefined || text === null) {
      throw badRequest('Field "text" is required');
    }
    if (typeof text !== 'string') {
      throw badRequest('Field "text" must be a string');
    }

    const extracted = await meetingService.extractTasksFromMeetingNotes(text);

    if (!extracted.length) {
      res.json([]);
      return;
    }

    const saved = await taskService.insertExtractedTasks(extracted);
    res.json(saved);
  } catch (err) {
    next(err);
  }
}
