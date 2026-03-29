import { getSupabaseClient } from '../lib/supabase.js';
import { getAllTasks } from './task.service.js';

function mapSupabaseError(error, fallbackMessage) {
  const err = new Error(error?.message || fallbackMessage);
  err.status = 502;
  return err;
}

export function parseDeadlineToUtcDate(deadlineStr) {
  if (deadlineStr == null || typeof deadlineStr !== 'string') {
    return null;
  }
  const s = deadlineStr.trim();
  if (!s) {
    return null;
  }

  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const y = Number(iso[1]);
    const mo = Number(iso[2]) - 1;
    const d = Number(iso[3]);
    return new Date(Date.UTC(y, mo, d));
  }

  const t = Date.parse(s);
  if (Number.isNaN(t)) {
    return null;
  }
  const parsed = new Date(t);
  return new Date(
    Date.UTC(
      parsed.getUTCFullYear(),
      parsed.getUTCMonth(),
      parsed.getUTCDate()
    )
  );
}

export function isDeadlinePassed(deadlineStr, referenceDate = new Date()) {
  const deadlineDate = parseDeadlineToUtcDate(deadlineStr);
  if (!deadlineDate) {
    return false;
  }

  const ref = new Date(referenceDate);
  const todayUtc = new Date(
    Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), ref.getUTCDate())
  );
  return todayUtc > deadlineDate;
}

export async function checkEscalations() {
  const tasks = await getAllTasks();
  const ids = tasks
    .filter(
      (t) =>
        t.status !== 'done' &&
        t.status !== 'delayed' &&
        isDeadlinePassed(t.deadline)
    )
    .map((t) => t.id);

  if (!ids.length) {
    return { updatedCount: 0, tasks: [] };
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('tasks')
    .update({ status: 'delayed' })
    .in('id', ids)
    .select('id, task, owner, deadline, status');

  if (error) {
    throw mapSupabaseError(error, 'Failed to escalate tasks');
  }

  return { updatedCount: data?.length ?? 0, tasks: data ?? [] };
}

export async function getDelayedTasks() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('tasks')
    .select('id, task, owner, deadline, status')
    .eq('status', 'delayed')
    .order('id', { ascending: false });

  if (error) {
    throw mapSupabaseError(error, 'Failed to load delayed tasks');
  }

  return data ?? [];
}
