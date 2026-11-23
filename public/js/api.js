import { CLIENT_TIMEOUT_MS } from './constants.js';

export const CLIENT_ERROR_MESSAGES = {
  METHOD_NOT_ALLOWED: '잘못된 요청 방식이에요.',
  INVALID_JSON: '요청 형식이 올바르지 않아요. 새로고침 후 다시 시도해 주세요.',
  SERVER_CONFIG: '서버 설정에 문제가 있어요. 관리자에게 문의해 주세요.',
  AI_TIMEOUT: 'AI 응답이 늦어지고 있어요. 잠시 후 다시 시도해 주세요.',
  AI_RATE_LIMITED: '요청이 많아 잠시 처리할 수 없어요. 1분 뒤 다시 시도해 주세요.',
  AI_BAD_OUTPUT: 'AI 응답을 처리하지 못했어요. 다시 시도해 주세요.',
  AI_ERROR: 'AI 서비스에 일시적인 문제가 있어요. 잠시 후 다시 시도해 주세요.',
  INTERNAL_ERROR: '일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요.',
  NOT_FOUND: '요청한 주소를 찾을 수 없어요.',
  CLIENT_TIMEOUT: '응답 시간이 1분을 넘었어요. 잠시 후 다시 시도해 주세요.',
  NETWORK_ERROR: '인터넷 연결을 확인한 뒤 다시 시도해 주세요.',
};

export class ApiError extends Error {
  constructor(code, message = null, field = null) {
    super(message || CLIENT_ERROR_MESSAGES[code] || CLIENT_ERROR_MESSAGES.INTERNAL_ERROR);
    this.code = code;
    this.userMessage = message || CLIENT_ERROR_MESSAGES[code] || CLIENT_ERROR_MESSAGES.INTERNAL_ERROR;
    this.field = field;
  }
}

export async function postJson(path, payload) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

  try {
    const res = await fetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timer);

    let json;
    try {
      json = await res.json();
    } catch {
      if (res.status === 504) {
        throw new ApiError('AI_TIMEOUT');
      }
      throw new ApiError('INTERNAL_ERROR');
    }

    if (!json.ok) {
      const code = json.error?.code || 'INTERNAL_ERROR';
      const msg = code === 'INVALID_INPUT' ? json.error?.message : null;
      throw new ApiError(code, msg, json.error?.field);
    }

    return json.data;
  } catch (error) {
    clearTimeout(timer);
    if (error instanceof ApiError) throw error;
    if (error?.name === 'AbortError') throw new ApiError('CLIENT_TIMEOUT');
    if (error instanceof TypeError) throw new ApiError('NETWORK_ERROR');
    throw new ApiError('INTERNAL_ERROR');
  }
}

export function requestGenerate(payload) {
  return postJson('/api/generate', payload);
}

export function requestFeedback(payload) {
  return postJson('/api/feedback', payload);
}

export function requestRevise(payload) {
  return postJson('/api/revise', payload);
}
