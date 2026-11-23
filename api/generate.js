import { ensurePost, readJsonBody, sendOk, sendError } from '../lib/http.js';
import { validateGenerateInput } from '../lib/validate.js';
import { generateDraft } from '../lib/draft-service.js';

export default async function handler(req, res) {
  if (!ensurePost(req, res)) return;

  const body = readJsonBody(req);
  if (!body) return sendError(res, 'INVALID_JSON');

  const result = validateGenerateInput(body);
  if (!result.ok) return sendError(res, 'INVALID_INPUT', { field: result.field, message: result.message });

  try {
    const data = await generateDraft(result.value);
    return sendOk(res, data);
  } catch (error) {
    const code = error?.code || 'INTERNAL_ERROR';
    // 사용자 입력·AI 출력은 절대 로그에 남기지 않는다 (AGENTS.md N-5)
    console.error('[api/generate]', code, error?.detail || '');
    return sendError(res, code);
  }
}
