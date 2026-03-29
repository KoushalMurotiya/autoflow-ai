import { getSupabaseClient } from '../lib/supabase.js';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function mapSupabaseError(error, fallbackMessage) {
  const err = new Error(error?.message || fallbackMessage);
  err.status = 502;
  return err;
}

function notFound(message) {
  const err = new Error(message);
  err.status = 404;
  return err;
}

function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

export async function insertExtractedTasks(rows) {
  if (!rows.length) {
    return [];
  }

  const supabase = getSupabaseClient();
  const payload = rows.map((r) => ({
    task: r.task,
    owner: r.owner,
    deadline: r.deadline,
    status: 'pending',
  }));

  const { data, error } = await supabase.from('tasks').insert(payload).select();

  if (error) {
    throw mapSupabaseError(error, 'Failed to save tasks');
  }

  return data ?? [];
}

export async function getAllTasks() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('tasks')
    .select('id, task, owner, deadline, status')
    .order('id', { ascending: false });

  if (error) {
    throw mapSupabaseError(error, 'Failed to load tasks');
  }

  return data ?? [];
}

export async function updateTaskStatus(id, status) {
  if (!id || typeof id !== 'string' || !UUID_RE.test(id.trim())) {
    throw badRequest('Invalid task id');
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', id.trim())
    .select('id, task, owner, deadline, status')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw notFound('Task not found');
    }
    throw mapSupabaseError(error, 'Failed to update task');
  }

  return data;
}
