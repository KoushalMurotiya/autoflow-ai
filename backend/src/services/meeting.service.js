/**
 * Meeting → tasks via Groq OpenAI-compatible chat API. Uses GROQ_API_KEY (never hardcoded).
 */
import axios from 'axios';

const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile';

const FALLBACK_TASKS = [];

function buildPrompt(input) {
  return `Extract tasks from meeting notes.

STRICT RULES:
- Return valid JSON only
- Deadline must be in YYYY-MM-DD format

Format:
[
 { "task": "", "owner": "", "deadline": "" }
]

Text:
${input}`;
}

function normalizeTaskRow(item) {
  if (!item || typeof item !== 'object') {
    return null;
  }
  return {
    task: String(item.task ?? ''),
    owner: String(item.owner ?? ''),
    deadline: String(item.deadline ?? ''),
  };
}

function stripCodeFence(raw) {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}

function parseTasksJson(content) {
  if (content == null || typeof content !== 'string') {
    return FALLBACK_TASKS;
  }

  let payload = stripCodeFence(content);

  try {
    const data = JSON.parse(payload);
    if (!Array.isArray(data)) {
      return FALLBACK_TASKS;
    }
    const rows = data.map(normalizeTaskRow).filter(Boolean);
    return rows;
  } catch {
    try {
      const bracket = payload.match(/\[[\s\S]*\]/);
      if (!bracket) {
        return FALLBACK_TASKS;
      }
      const data = JSON.parse(bracket[0]);
      if (!Array.isArray(data)) {
        return FALLBACK_TASKS;
      }
      return data.map(normalizeTaskRow).filter(Boolean);
    } catch {
      return FALLBACK_TASKS;
    }
  }
}

export async function extractTasksFromMeetingNotes(rawText) {
  const text = typeof rawText === 'string' ? rawText.trim() : '';
  if (!text) {
    return [];
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    const err = new Error('GROQ_API_KEY is not configured');
    err.status = 503;
    throw err;
  }

  try {
    const { data } = await axios.post(
      GROQ_CHAT_URL,
      {
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: buildPrompt(text) }],
        temperature: 0.2,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 120_000,
      }
    );

    const content = data?.choices?.[0]?.message?.content;
    return parseTasksJson(content);
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.code === 'ECONNABORTED') {
        const e = new Error('Groq API request timed out');
        e.status = 504;
        throw e;
      }
      if (err.response) {
        const msg =
          err.response.data?.error?.message ??
          err.response.statusText ??
          err.message;
        const e = new Error(`Groq API error: ${msg}`);
        e.status = 502;
        throw e;
      }
      const e = new Error(err.message || 'Groq API request failed');
      e.status = 502;
      throw e;
    }
    throw err;
  }
}
