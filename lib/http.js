// docs/04 §5 표를 그대로 옮긴 객체 { CODE: { status, message } }
export const ERROR_TABLE = {
  METHOD_NOT_ALLOWED: { status: 405, message: '잘못된 요청 방식이에요.' },
  INVALID_JSON: { status: 400, message: '요청 형식이 올바르지 않아요. 새로고침 후 다시 시도해 주세요.' },
  INVALID_INPUT: { status: 400, message: '입력값을 확인해 주세요.' },
  SERVER_CONFIG: { status: 500, message: '서버 설정에 문제가 있어요. 관리자에게 문의해 주세요.' },
  AI_TIMEOUT: { status: 504, message: 'AI 응답이 늦어지고 있어요. 잠시 후 다시 시도해 주세요.' },
  AI_RATE_LIMITED: { status: 429, message: '요청이 많아 잠시 처리할 수 없어요. 1분 뒤 다시 시도해 주세요.' },
  AI_BAD_OUTPUT: { status: 502, message: 'AI 응답을 처리하지 못했어요. 다시 시도해 주세요.' },
  AI_ERROR: { status: 502, message: 'AI 서비스에 일시적인 문제가 있어요. 잠시 후 다시 시도해 주세요.' },
  INTERNAL_ERROR: { status: 500, message: '일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요.' },
  NOT_FOUND: { status: 404, message: '요청한 주소를 찾을 수 없어요.' },
  NOT_IMPLEMENTED: { status: 501, message: '아직 준비 중인 기능이에요.' },
};

export function readJsonBody(req) {
  try {
    const body = req.body;
    if (body && typeof body === 'object' && !Array.isArray(body)) return body;
    return null;
  } catch {
    return null;
  }
}

export function sendOk(res, data) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ ok: true, data });
}

export function sendError(res, code, extra = {}) {
  const entry = ERROR_TABLE[code] || ERROR_TABLE.INTERNAL_ERROR;
  res.setHeader('Cache-Control', 'no-store');
  return res.status(entry.status).json({
    ok: false,
    error: {
      code: ERROR_TABLE[code] ? code : 'INTERNAL_ERROR',
      message: extra.message || entry.message,
      ...(extra.field ? { field: extra.field } : {}),
    },
  });
}

export function ensurePost(req, res) {
  if (req.method === 'POST') return true;
  res.setHeader('Allow', 'POST');
  sendError(res, 'METHOD_NOT_ALLOWED');
  return false;
}
