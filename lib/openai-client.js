import OpenAI from 'openai';

const MAX_OUTPUT_TOKENS = 4000;
let client = null;

// 서버 내부 에러. code는 docs/04 §5 표의 코드, detail은 로그용 짧은 설명(사용자 내용 금지)
export class AiError extends Error {
  constructor(code, detail = '') {
    super(code);
    this.code = code;
    this.detail = detail;
  }
}

function getClient() {
  if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_MODEL) {
    throw new AiError('SERVER_CONFIG', 'missing_env');
  }
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, maxRetries: 0 });
  return client;
}

// OpenAI SDK 에러를 docs/04 §5 코드로 바꾼다. 시간 초과 에러가 연결 에러의 하위 종류라 먼저 검사한다.
function toAiError(error) {
  if (error instanceof AiError) return error;
  if (error instanceof OpenAI.APIConnectionTimeoutError) return new AiError('AI_TIMEOUT');
  if (error instanceof OpenAI.APIError) {
    if (error.code === 'insufficient_quota') return new AiError('SERVER_CONFIG', 'insufficient_quota');
    if ([401, 403, 404].includes(error.status)) return new AiError('SERVER_CONFIG', `openai_${error.status}`);
    if (error.status === 429) return new AiError('AI_RATE_LIMITED');
    return new AiError('AI_ERROR', `openai_${error.status ?? 'connection'}`);
  }
  return new AiError('INTERNAL_ERROR');
}

// AI가 규칙을 어기고 붙이는 마크다운·여분 줄바꿈을 정리한다. 내용(문장)은 바꾸지 않는다.
export function cleanText(raw) {
  let text = String(raw ?? '').replace(/\r\n?/g, '\n').trim();
  text = text.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, ''); // 코드 블록 표시
  text = text.replace(/\*\*(.+?)\*\*/g, '$1'); // 굵게 표시
  text = text.replace(/^#{1,6}\s+/gm, ''); // 제목 기호
  text = text.split('\n').map((line) => line.trimEnd()).join('\n');
  text = text.replace(/\n{3,}/g, '\n\n'); // 빈 줄 최대 1개
  return text.trim();
}

async function createResponse(params, timeoutMs) {
  const response = await getClient().responses.create(
    { model: process.env.OPENAI_MODEL, max_output_tokens: MAX_OUTPUT_TOKENS, ...params },
    { timeout: timeoutMs },
  );
  if (response.status === 'incomplete') throw new AiError('AI_BAD_OUTPUT', 'incomplete');
  return response;
}

export async function requestText({ instructions, input, timeoutMs }) {
  try {
    const response = await createResponse({ instructions, input }, timeoutMs);
    const text = cleanText(response.output_text);
    if (!text) throw new AiError('AI_BAD_OUTPUT', 'empty');
    return text;
  } catch (error) {
    throw toAiError(error);
  }
}

export async function requestJson({ instructions, input, schemaName, schema, timeoutMs }) {
  try {
    const response = await createResponse({
      instructions,
      input,
      text: { format: { type: 'json_schema', name: schemaName, schema, strict: true } },
    }, timeoutMs);
    try {
      return JSON.parse(response.output_text);
    } catch {
      throw new AiError('AI_BAD_OUTPUT', 'json_parse');
    }
  } catch (error) {
    throw toAiError(error);
  }
}
