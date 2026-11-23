# 04. API 명세

> 대상 마일스톤: **M3**(generate), **M4**(feedback, revise)
> 이 문서는 브라우저(`public/js/api.js`)와 서버(`api/*.js`)가 주고받는 데이터의 **유일한 기준**입니다.

---

## 1. 공통 규칙

| 항목 | 규칙 |
|---|---|
| 주소 | `/api/generate`, `/api/feedback`, `/api/revise` (같은 도메인, 다른 사이트에서 호출 불가 — CORS 헤더 추가 금지) |
| 메서드 | `POST`만 허용. 그 외는 `405 METHOD_NOT_ALLOWED` + 응답 헤더 `Allow: POST` |
| 요청 헤더 | `Content-Type: application/json` |
| 요청 본문 | JSON 객체. 문서에 없는 필드는 **무시** |
| 인증 | 없음 (로그인 기능 없음) |
| 응답 형식 | 성공·실패 모두 JSON, 항상 아래 두 형태 중 하나 |
| 문자 인코딩 | UTF-8 |
| 캐시 | 응답 헤더 `Cache-Control: no-store` |

**성공 응답**
```json
{ "ok": true, "data": { } }
```

**실패 응답**
```json
{ "ok": false, "error": { "code": "INVALID_INPUT", "message": "문항 내용을 5자 이상 입력해 주세요.", "field": "question" } }
```
- `field`는 `INVALID_INPUT`일 때만 포함. 값은 §2 표의 "필드" 열 (점 표기, 예: `experience.action`)
- `message`는 사용자에게 그대로 보여줄 수 있는 한국어 문장

---

## 2. 요청 필드 정의

제한값과 에러 문구는 `docs/03-feature-spec.md` §2 표와 **동일**하다. 서버는 `trim()`한 값으로 검사하고, 검사 후 `trim()`한 값을 사용한다.

| 필드 | 타입 | 규칙 | 사용하는 API |
|---|---|---|---|
| `company` | string | 필수, 1~50자 | 전체 |
| `role` | string | 필수, 1~50자 | 전체 |
| `jobPosting` | string | 선택(없거나 `''` 허용), 0~3000자 | generate, feedback |
| `question` | string | 필수, 5~300자 | 전체 |
| `charLimit` | integer | 필수, 100~3000 (정수 아니면 에러) | 전체 |
| `countMode` | string | 필수, `with_spaces` \| `without_spaces` | 전체 |
| `includeTitle` | boolean | 필수 | generate, revise |
| `experience` | object | generate: 필수 / revise: 선택(없으면 모든 값 `''`로 간주) | generate, revise |
| `experience.situation` | string | 선택, 0~1000자 | generate, revise |
| `experience.action` | string | generate: 필수 10~1000자 / revise: 선택 0~1000자 | generate, revise |
| `experience.result` | string | 선택, 0~1000자 | generate, revise |
| `experience.lesson` | string | 선택, 0~1000자 | generate, revise |
| `text` | string | feedback: 필수 50~5000자 / revise: 필수 20~5000자 | feedback, revise |
| `mode` | string | 필수, `concise` \| `specific` \| `fit_length` | revise |

**타입이 틀린 경우** (예: `charLimit: "700"`, `includeTitle: "true"`, 선택 string 필드에 숫자) → `INVALID_INPUT`, `message`는 해당 필드의 제한표 에러 문구(타입 전용 문구 없음). `mode`·`countMode`가 허용값이 아니면 `message: '요청 형식이 올바르지 않아요. 새로고침 후 다시 시도해 주세요.'`
**검사 순서**: 위 표의 위에서 아래 순서로 검사하고, **첫 번째 에러 1개만** 응답한다.

---

## 3. 서버 처리 흐름 (모든 API 공통)

```
1. 메서드 확인 → POST 아니면 405
2. 본문 읽기 → 객체가 아니면 400 INVALID_JSON
3. 입력 검증 (lib/validate.js) → 실패 시 400 INVALID_INPUT
4. 환경 변수 확인 → OPENAI_API_KEY 또는 OPENAI_MODEL 없으면 500 SERVER_CONFIG
5. 프롬프트 생성 (lib/prompts.js) → OpenAI 호출 (lib/openai-client.js)
6. 결과 정리·검사 → 200 성공 응답
7. 에러 → §5 표대로 변환해 응답, 로그에는 코드·상태만 기록
```

### 3.1 `lib/http.js` (내보낼 함수)

```js
// 본문 읽기: Vercel은 잘못된 JSON에서 req.body 접근 시 에러를 던지므로 try/catch로 감싼다.
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
  // ERROR_TABLE: §5 표를 그대로 옮긴 객체 { CODE: { status, message } }
  const entry = ERROR_TABLE[code] || ERROR_TABLE.INTERNAL_ERROR;
  res.setHeader('Cache-Control', 'no-store');
  return res.status(entry.status).json({
    ok: false,
    error: { code: ERROR_TABLE[code] ? code : 'INTERNAL_ERROR', message: extra.message || entry.message, ...(extra.field ? { field: extra.field } : {}) },
  });
}

export function ensurePost(req, res) {
  if (req.method === 'POST') return true;
  res.setHeader('Allow', 'POST');
  sendError(res, 'METHOD_NOT_ALLOWED');
  return false;
}
```

### 3.2 `lib/validate.js` (내보낼 함수)

```js
// 반환: { ok: true, value: 정리된 입력 } 또는 { ok: false, field, message }
export function validateGenerateInput(body) {}
export function validateFeedbackInput(body) {}
export function validateReviseInput(body) {}
```

### 3.3 API 파일 형태 (`api/generate.js` 예시)

```js
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
```
`api/feedback.js`, `api/revise.js`도 같은 형태. 각각 `validateFeedbackInput` + `getFeedback`(lib/draft-service.js), `validateReviseInput` + `reviseDraft`를 사용한다.

---

## 4. API별 명세

### 4.1 `POST /api/generate` — AI 초안 생성

**요청**
```json
{
  "company": "한국전력거래소",
  "role": "전력계통 운영",
  "jobPosting": "전력계통 운영 및 수급 관리 ... 인재상: 책임감, 전문성",
  "question": "지원 직무와 관련된 경험을 바탕으로 본인의 강점을 기술해 주세요.",
  "charLimit": 700,
  "countMode": "with_spaces",
  "includeTitle": true,
  "experience": {
    "situation": "자동차 의장 공정 인턴 중 센터 콘솔 부착 불량이 반복됨",
    "action": "불량 발생 시간대와 작업 순서를 2주간 기록하고 원인을 작업자 간 체결 순서 차이로 좁혀 표준 작업 순서표를 제안함",
    "result": "제안한 순서표가 라인에 적용됨",
    "lesson": ""
  }
}
```

**성공 응답 (200)**
```json
{
  "ok": true,
  "data": {
    "text": "[기록으로 원인을 좁히는 끈기]\n인턴 기간 중 ...",
    "count": { "withSpaces": 668, "withoutSpaces": 503 },
    "overLimit": false,
    "placeholderCount": 1,
    "retried": false
  }
}
```

| 응답 필드 | 의미 |
|---|---|
| `text` | 정리(`docs/05` §8)된 최종 본문 |
| `count` | `lib/count.js`의 `countChars(text)` 결과 |
| `overLimit` | `countMode` 기준 글자수 > `charLimit`이면 true |
| `placeholderCount` | `[보완 필요: …]` 개수 |
| `retried` | 제한 초과로 자동 축약을 1회 실행했으면 true (검증용) |

**처리 상세**: `docs/05` §4(프롬프트), §7(초과 시 자동 축약)

### 4.2 `POST /api/feedback` — AI 피드백

**요청**
```json
{
  "company": "한국전력거래소",
  "role": "전력계통 운영",
  "jobPosting": "",
  "question": "지원 직무와 관련된 경험을 바탕으로 본인의 강점을 기술해 주세요.",
  "charLimit": 700,
  "countMode": "with_spaces",
  "text": "인턴 기간 중 센터 콘솔 부착 불량이 반복되었습니다. ..."
}
```

**성공 응답 (200)**
```json
{
  "ok": true,
  "data": {
    "summary": "문항에 직접 답하고 있으나 결과가 수치 없이 서술되어 설득력이 약합니다.",
    "scores": { "relevance": 4, "specificity": 3, "jobFit": 3, "readability": 4 },
    "strengths": ["기록을 바탕으로 원인을 좁힌 과정이 구체적입니다."],
    "improvements": [
      { "issue": "결과에 수치가 없음", "suggestion": "순서표 적용 전후 불량 건수나 비율을 경험 메모에 추가한 뒤 결과 문장에 반영하세요." }
    ],
    "rewriteExamples": [
      { "before": "제안한 순서표가 라인에 적용되었습니다.", "after": "제안한 표준 작업 순서표가 라인에 정식 적용되어 [보완 필요: 적용 후 불량 감소 수치]의 효과를 냈습니다." }
    ]
  }
}
```

| 필드 | 규칙 (서버가 보장) |
|---|---|
| `summary` | 1~150자 |
| `scores.*` | 정수 1~5 (4개 모두 존재) |
| `strengths` | 0~3개, 각 비어 있지 않은 문자열 |
| `improvements` | 0~3개, `issue`·`suggestion` 모두 비어 있지 않은 문자열 |
| `rewriteExamples` | 0~2개, `before`는 요청 `text`에 **그대로 포함된** 문자열, `before !== after` |

보장 방법은 `docs/05` §9.

### 4.3 `POST /api/revise` — AI 다듬기

**요청**
```json
{
  "mode": "fit_length",
  "company": "한국전력거래소",
  "role": "전력계통 운영",
  "question": "지원 직무와 관련된 경험을 바탕으로 본인의 강점을 기술해 주세요.",
  "charLimit": 700,
  "countMode": "with_spaces",
  "includeTitle": true,
  "experience": { "situation": "...", "action": "...", "result": "...", "lesson": "" },
  "text": "현재 본문 ..."
}
```

**성공 응답 (200)**: §4.1과 같은 형태 (`text`, `count`, `overLimit`, `placeholderCount`, `retried`)

---

## 5. 에러 코드 표 (기준)

| 코드 | HTTP | 사용자 문구 (`message`) | 발생 상황 |
|---|---|---|---|
| `METHOD_NOT_ALLOWED` | 405 | 잘못된 요청 방식이에요. | POST 외 메서드 |
| `INVALID_JSON` | 400 | 요청 형식이 올바르지 않아요. 새로고침 후 다시 시도해 주세요. | 본문이 JSON 객체가 아님 |
| `INVALID_INPUT` | 400 | (필드별 문구, `docs/03` §2) | 입력 검증 실패 |
| `SERVER_CONFIG` | 500 | 서버 설정에 문제가 있어요. 관리자에게 문의해 주세요. | 환경 변수 없음, OpenAI 401·403·404, `insufficient_quota` |
| `AI_TIMEOUT` | 504 | AI 응답이 늦어지고 있어요. 잠시 후 다시 시도해 주세요. | OpenAI 응답 시간 초과 |
| `AI_RATE_LIMITED` | 429 | 요청이 많아 잠시 처리할 수 없어요. 1분 뒤 다시 시도해 주세요. | OpenAI 429 (quota 부족 제외) |
| `AI_BAD_OUTPUT` | 502 | AI 응답을 처리하지 못했어요. 다시 시도해 주세요. | 빈 응답, JSON 해석 실패, 응답 미완료, 점수 형식 오류 |
| `AI_ERROR` | 502 | AI 서비스에 일시적인 문제가 있어요. 잠시 후 다시 시도해 주세요. | 그 외 OpenAI 오류, 연결 실패 |
| `INTERNAL_ERROR` | 500 | 일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요. | 예상하지 못한 서버 오류 |
| `NOT_FOUND` | 404 | 요청한 주소를 찾을 수 없어요. | 없는 API 주소 (로컬 dev-server) |
| `NOT_IMPLEMENTED` | 501 | 아직 준비 중인 기능이에요. | M1 임시 코드 |

**브라우저 전용 코드** (`public/js/api.js`에서 생성, 서버 응답 아님)

| 코드 | 사용자 문구 |
|---|---|
| `CLIENT_TIMEOUT` | 응답 시간이 1분을 넘었어요. 잠시 후 다시 시도해 주세요. |
| `NETWORK_ERROR` | 인터넷 연결을 확인한 뒤 다시 시도해 주세요. |

- 브라우저는 서버의 `message`를 그대로 쓰지 않고, **코드로 위 표의 문구를 찾아** 표시한다 (단, `INVALID_INPUT`은 서버 `message` 사용).
- 표에 없는 코드를 받으면 `INTERNAL_ERROR` 문구를 표시한다.

---

## 6. 완료 기준

**M3**
- [ ] §4.1 요청 예시로 호출 시 §4.1 형태의 응답
- [ ] `docs/07` §8의 generate 관련 curl 테스트 통과 (405, 400 INVALID_JSON, 400 INVALID_INPUT, 500 SERVER_CONFIG)
- [ ] 서버 로그에 요청 본문·AI 출력이 찍히지 않음

**M4**
- [ ] §4.2, §4.3 형태의 응답
- [ ] 피드백 응답의 `rewriteExamples[].before`가 모두 요청 `text`에 포함됨 (10회 호출로 확인)
- [ ] `mode: "wrong"` → 400 `INVALID_INPUT`, `field: "mode"`
