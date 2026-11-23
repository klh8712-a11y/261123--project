import { ensurePost, readJsonBody, sendOk, sendError } from '../lib/http.js';
import { validateFeedbackInput } from '../lib/validate.js';
import { getFeedback } from '../lib/draft-service.js';

export default async function handler(req, res) {
  if (!ensurePost(req, res)) return;

  const body = readJsonBody(req);
  if (!body) return sendError(res, 'INVALID_JSON');

  const result = validateFeedbackInput(body);
  if (!result.ok) return sendError(res, 'INVALID_INPUT', { field: result.field, message: result.message });

  try {
    const data = await getFeedback(result.value);
    return sendOk(res, data);
  } catch (error) {
    const code = error?.code || 'INTERNAL_ERROR';
    console.error('[api/feedback]', code, error?.detail || '');
    return sendError(res, code);
  }
}
