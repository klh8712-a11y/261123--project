# 03. 기능 구현 지침

> 대상 마일스톤: **M2**(상태·저장·카운터·문항), **M3**(초안 생성 연결), **M4**(피드백·다듬기·복원), **M5**(복사·내보내기·초기화)
> 화면 요소의 id·문구는 `docs/02-ui-guide.md`, 서버 요청·응답 형식은 `docs/04-api-spec.md`를 따른다.

---

## 1. 동작 원리 (비전공자용)

```
[사용자 입력] → state.js (앱의 "기억") → storage.js (브라우저에 자동 저장)
                     ↓
                render.js (기억을 화면에 그림)

[AI 버튼 클릭] → validate.js (빠진 입력 확인) → api.js → 서버 /api/* → OpenAI
                                                        ↓
                                    결과를 state에 반영 → 화면 갱신 → 자동 저장
```

- **state(상태)**: 지금 화면에 있어야 할 모든 데이터를 담은 하나의 객체. 화면은 항상 state를 보고 그린다.
- 입력창에 글자를 칠 때마다 state가 바뀌고, 0.5초 동안 추가 입력이 없으면 브라우저에 저장된다.

---

## 2. 입력값 제한표 (기준 문서)

- 이 표가 **유일한 기준**이다. `public/js/constants.js`와 `lib/constants.js`의 값은 이 표와 같아야 한다.
- 글자수는 `Array.from(문자열.trim()).length`로 센다 (이모지도 1자).
- 검증은 **버튼을 눌렀을 때** 한다 (타이핑 중 실시간 에러 표시 안 함).

| 필드 | state 경로 | 입력창 id | 필수 | 최소 | 최대 | 에러 문구 |
|---|---|---|---|---|---|---|
| 회사명 | `profile.company` | `company-input` | O | 1 | 50 | 비었을 때 `회사명을 입력해 주세요.` / 초과 `회사명은 50자 이하로 입력해 주세요.` |
| 지원 직무 | `profile.role` | `role-input` | O | 1 | 50 | `지원 직무를 입력해 주세요.` / `지원 직무는 50자 이하로 입력해 주세요.` |
| 채용공고·인재상 | `profile.jobPosting` | `posting-input` | X | 0 | 3000 | `채용공고·인재상은 3,000자 이하로 입력해 주세요.` |
| 문항 내용 | `question.question` | `question-input` | O | 5 | 300 | `문항 내용을 5자 이상 입력해 주세요.` / `문항 내용은 300자 이하로 입력해 주세요.` |
| 글자수 제한 | `question.charLimit` | `char-limit-input` | O | 100 | 3000 | `글자수 제한은 100~3,000 사이의 숫자로 입력해 주세요.` (정수가 아니어도 같은 문구) |
| 세는 기준 | `question.countMode` | `count-mode-select` | O | — | — | `with_spaces` 또는 `without_spaces`만 허용 (선택창이라 에러 없음) |
| 소제목 포함 | `question.includeTitle` | `include-title-checkbox` | O | — | — | true/false |
| 상황·과제 | `question.experience.situation` | `exp-situation` | X | 0 | 1000 | `상황·과제는 1,000자 이하로 입력해 주세요.` |
| 행동 | `question.experience.action` | `exp-action` | O(초안 생성 시) | 10 | 1000 | `경험 메모의 [행동]을 10자 이상 입력해 주세요.` / `행동은 1,000자 이하로 입력해 주세요.` |
| 결과 | `question.experience.result` | `exp-result` | X | 0 | 1000 | `결과는 1,000자 이하로 입력해 주세요.` |
| 배운 점 | `question.experience.lesson` | `exp-lesson` | X | 0 | 1000 | `배운 점은 1,000자 이하로 입력해 주세요.` |
| 본문 (피드백) | `question.text` | `body-editor` | O | 50 | 5000 | `피드백을 받으려면 본문을 50자 이상 작성해 주세요.` / `본문은 5,000자 이하여야 해요.` |
| 본문 (다듬기) | `question.text` | `body-editor` | O | 20 | 5000 | `다듬으려면 본문을 20자 이상 작성해 주세요.` / `본문은 5,000자 이하여야 해요.` |
| 문항 개수 | `questions.length` | — | — | 1 | 5 | `문항은 최대 5개까지 추가할 수 있어요.` (토스트) |

**버튼별 검증 대상**

| 동작 | 검증하는 필드 |
|---|---|
| AI 초안 생성 | 회사명, 직무, 채용공고, 문항 내용, 글자수 제한, 경험 메모 4개(행동 필수) |
| AI 피드백 받기 | 회사명, 직무, 채용공고, 문항 내용, 글자수 제한, 본문(피드백) |
| 다듬기 3종 | 회사명, 직무, 문항 내용, 글자수 제한, 본문(다듬기) |
| 복사·내보내기·복원·예시 적용 | 검증 없음 |

**에러 표시 방법**: `docs/02` §9 — 입력창 아래 `#{입력창 id}-error`에 문구, `aria-invalid`, 첫 에러 입력창에 포커스. 에러가 있으면 서버 요청을 보내지 않는다. 다음 버튼 클릭 시 이전 에러를 모두 지우고 다시 검사한다.
경험 메모의 에러가 있는데 `<details id="experience-details">`가 닫혀 있으면 먼저 연다(`open = true`).
`exp-situation`, `exp-result`, `exp-lesson`, `posting-input`은 `maxlength` 때문에 초과 입력이 실제로는 불가능하지만, 검증 코드는 그대로 둔다(서버와 같은 규칙 유지).

---

## 3. 상태(state) 구조와 저장

### 3.1 저장되는 상태 (localStorage)

```js
{
  version: 1,
  profile: {
    company: '',
    role: '',
    jobPosting: ''
  },
  questions: [
    {
      id: 'b1c2…',                 // crypto.randomUUID()
      question: '',
      charLimit: 1000,             // 정수 또는 null(숫자가 아닌 값 입력 시)
      countMode: 'with_spaces',    // 'with_spaces' | 'without_spaces'
      includeTitle: true,
      experience: { situation: '', action: '', result: '', lesson: '' },
      text: '',                    // 본문
      prevText: null,              // 직전 버전 (문자열 또는 null)
      feedback: null,              // null 또는 { data, basedOnText, createdAt }
      updatedAt: '2026-11-23T07:00:00.000Z'
    }
  ],
  activeQuestionId: 'b1c2…'
}
```

- `feedback.data`는 `docs/04` §4.2 피드백 응답의 `data`를 그대로 저장
- `feedback.basedOnText`: 피드백을 요청할 때의 본문 (최신 여부 비교용)
- 새 문항 기본값: 위 예시와 동일 (`charLimit: 1000`, `countMode: 'with_spaces'`, `includeTitle: true`, 나머지 빈 값)
- 처음 접속 시 상태: 기본값 문항 1개, 그 문항이 `activeQuestionId`

### 3.2 저장되지 않는 상태 (실행 중에만)

```js
{ aiBusy: false, busyAction: null }   // busyAction: 'generate' | 'feedback' | 'revise' | null
```
새로고침하면 항상 `aiBusy: false`로 시작한다.

### 3.3 저장 규칙

| 항목 | 규칙 |
|---|---|
| 저장 키 | `jaso-workshop:v1` |
| 저장 시점 | 상태가 바뀔 때마다 예약, **마지막 변경 후 500ms** 뒤 1회 저장 (debounce) |
| 저장 성공 | `#save-status`에 `저장됨`, 2초 후 지움 |
| 저장 공간 부족 (`QuotaExceededError`) | 토스트 `브라우저 저장 공간이 부족해 자동 저장하지 못했어요.` (10초 안에 반복되면 다시 띄우지 않음) |
| 불러오기 | 페이지 시작 시 1회. `JSON.parse` 성공 + `version === 1` + `questions`가 길이 1~5 배열 + `activeQuestionId`가 그 안에 존재할 때만 사용 |
| 손상 데이터 | 위 조건 실패 시 원본 문자열을 `jaso-workshop:v1:backup`에 복사하고 기본 상태로 시작, 토스트 `저장된 내용을 불러오지 못해 새로 시작해요.` |
| 데이터 없음 | 기본 상태로 시작, 토스트 없음 |

### 3.4 입력과 화면 갱신 규칙 (중요)

- 입력창의 `input` 이벤트 → state만 바꾸고, **사용자가 입력 중인 그 입력창의 `value`는 다시 넣지 않는다** (커서가 튀는 문제 방지).
- 입력창 `value`를 state로 다시 채우는 경우는 4가지뿐: ① 첫 로드 ② 문항 전환 ③ 전체 초기화 ④ AI 결과·복원·예시 적용으로 본문이 바뀔 때.
- 그 외 갱신(카운터, 문항 목록 미리보기, 카드 제목, 버튼 상태, 피드백 패널)은 state가 바뀔 때마다 다시 그린다.
- `char-limit-input`은 `input` 이벤트에서 `Number(value)`가 정수면 그 값, 아니면 `null`을 저장한다. 범위 검사는 버튼 클릭 시 한다.

---

## 4. 기능별 명세

### 4.1 F-01 지원 정보 입력

| 항목 | 내용 |
|---|---|
| 화면 | 왼쪽 사이드바 "지원 정보" 카드 |
| 동작 | 3개 입력창의 `input` 이벤트마다 `profile` 갱신. 채용공고는 `#posting-input-count`에 `{n} / 3,000` 표시 |
| 숫자 표기 | 천 단위 쉼표: `n.toLocaleString('ko-KR')` |

**완료 기준**
- [ ] 입력 후 새로고침해도 세 값이 유지
- [ ] 채용공고 글자수 표시가 입력 즉시 갱신

### 4.2 F-02 문항 관리

| 동작 | 처리 순서 |
|---|---|
| 추가 (`add-question-btn`) | ① 5개면 토스트 `문항은 최대 5개까지 추가할 수 있어요.` 후 종료 (버튼은 5개일 때 비활성이므로 대비용) ② 기본값 문항을 목록 **끝**에 추가 ③ 새 문항을 선택 상태로 ④ 입력창 채우기 ⑤ `#question-input`에 포커스 |
| 선택 (목록 행 클릭) | ① `activeQuestionId` 변경 ② 입력창 채우기 ③ 피드백 패널을 해당 문항 기준으로 다시 그림 |
| 삭제 (`delete-question-btn`) | ① 문항 1개면 동작 안 함(버튼 비활성) ② 삭제 다이얼로그(`docs/02` §8) ③ 확인 시 삭제 ④ 삭제된 문항의 **앞** 문항 선택, 앞이 없으면 새 첫 문항 선택 |
| 번호 | 목록 순서대로 `문항 1` ~ `문항 5`. 삭제 시 번호 다시 매김. 카드 제목 `#editor-title`도 같은 번호 |
| 목록 미리보기 | `docs/02` §5.2 규칙 |
| 개수 배지 | `#question-count`에 `{개수} / 5` |

**완료 기준**
- [ ] 5개까지 추가, 5개일 때 추가 버튼 비활성
- [ ] 1개일 때 삭제 버튼 비활성
- [ ] 문항 전환 시 문항 내용·글자수 제한·기준·소제목·경험 메모·본문·피드백이 모두 해당 문항 것으로 바뀜
- [ ] 문항 2를 삭제하면 문항 1이 선택되고, 기존 문항 3이 `문항 2`로 표시

### 4.3 F-03 경험 메모 (STAR)

| 항목 | 내용 |
|---|---|
| 입력 | 상황·과제, 행동(초안 생성 시 필수), 결과, 배운 점 — 문항마다 따로 저장 |
| 글자수 표시 | 각 `#{id}-count`에 `{n} / 1,000` |
| 접기 | `<details>` 기본 열림. 열림 여부는 저장하지 않음 |

**완료 기준**
- [ ] 행동 9자 이하로 초안 생성 클릭 시 행동 입력창 에러·포커스
- [ ] 문항별로 다른 메모가 유지

### 4.4 F-04 AI 초안 생성

**처리 순서**
1. `aiBusy`면 무시
2. §2 "AI 초안 생성" 검증 → 실패 시 에러 표시 후 종료
3. 본문(`text.trim()`)이 비어 있지 않으면 덮어쓰기 다이얼로그. 취소 시 종료
4. `aiBusy = true`, `busyAction = 'generate'` → `docs/02` §7.1 로딩 표시
5. `POST /api/generate` (요청 형식 `docs/04` §4.1)
6. 성공 시
   - 현재 본문이 비어 있지 않으면 `prevText = 현재 본문`, 비어 있으면 `prevText`는 그대로 둔다
   - `text = data.text`, 에디터 `value` 갱신
   - `data.overLimit`이 true면 토스트 `글자수 제한을 넘었어요. [글자수 맞추기]를 눌러 보세요.`, 아니면 `초안을 만들었어요. 내용을 꼭 확인해 주세요.`
7. 실패 시 본문 변경 없음, 에러 코드에 맞는 토스트(`docs/04` §5)
8. 성공·실패와 관계없이 로딩 해제(`finally`)

**보내는 값**: 문자열은 `trim()`한 값. 비어 있는 선택 항목은 빈 문자열 `''`로 보낸다.

**완료 기준**
- [ ] 필수값 채운 뒤 클릭 → 60초 안에 본문에 초안 표시
- [ ] 본문이 있을 때 다이얼로그 표시, 취소하면 본문 그대로
- [ ] 요청 중 모든 AI 버튼·문항 전환 비활성, 에디터 읽기 전용
- [ ] 초안 생성 후 `직전 버전 복원`으로 이전 본문 복구(이전 본문이 있었을 때)

### 4.5 F-05 글자수 카운터

`public/js/counter.js` (그대로 사용, `lib/count.js`도 같은 함수)

```js
// 줄바꿈(\r\n)을 1글자(\n)로 통일한 뒤 센다. 이모지도 1자로 세기 위해 Array.from 사용.
export function countChars(text) {
  const normalized = String(text ?? '').replace(/\r\n?/g, '\n');
  return {
    withSpaces: Array.from(normalized).length,
    withoutSpaces: Array.from(normalized.replace(/\s/g, '')).length,
  };
}

export const PLACEHOLDER_PATTERN = /\[보완 필요:[^\]]*\]/g;

export function countPlaceholders(text) {
  return (String(text ?? '').match(PLACEHOLDER_PATTERN) || []).length;
}
```

| 항목 | 내용 |
|---|---|
| 표시 | `#count-with-spaces`: `공백 포함 {n} / {제한}자` (세는 기준이 공백 포함일 때) 또는 `공백 포함 {n}자` / `#count-without-spaces`도 같은 방식 |
| 제한이 null | 두 값 모두 `/ {제한}` 없이 표시 |
| 상태 | `docs/02` §7.2 (기준 90% 계산: `n >= Math.ceil(limit * 0.9)`) |
| 보완 필요 안내 | `countPlaceholders(text) > 0`이면 `#placeholder-notice` 표시, 0이면 숨김 |
| 갱신 시점 | 본문 `input` 이벤트, 문항 전환, 글자수 제한·기준 변경, AI 결과 반영 시 |
| 숫자 표기 | 천 단위 쉼표 |

**완료 기준**
- [ ] `가 나` → 공백 포함 3, 공백 제외 2
- [ ] `가\n나` → 공백 포함 3, 공백 제외 2
- [ ] `👍👍` → 공백 포함 2
- [ ] 제한 100, 기준 공백 포함, 본문 95자 → `적정` / 101자 → `1자 초과`

### 4.6 F-06·F-07 AI 피드백과 수정 예시 적용

**피드백 처리 순서**
1. `aiBusy`면 무시 → §2 "AI 피드백 받기" 검증
2. 로딩 (`busyAction = 'feedback'`)
3. `POST /api/feedback` (`docs/04` §4.2)
4. 성공 시 `question.feedback = { data, basedOnText: 요청 시점 본문, createdAt: new Date().toISOString() }` → 패널 표시, 토스트 `피드백을 받았어요.`
5. 실패 시 기존 피드백 유지(있으면 다시 표시), 에러 토스트

**패널 표시 규칙**
| 상태 | 표시 |
|---|---|
| 현재 문항 `feedback === null` | `#feedback-empty`만 |
| 피드백 요청 중 | `#feedback-loading`만 |
| 피드백 있음 | `#feedback-content`만. 요약, 점수 4개(`docs/02` §5.2 순서), 강점, 개선점, 수정 예시 |
| 현재 본문 ≠ `basedOnText` | `#feedback-stale` 배지 표시 |
| 강점·개선점·수정 예시가 빈 배열 | 해당 목록에 `없음` 한 줄 표시 (`--color-ink-muted`) |

**수정 예시 적용 (F-07)**
- 버튼 활성 조건: 현재 본문에 `before` 문자열이 **그대로** 포함 (`text.includes(before)`)
- 클릭 시: `prevText = 현재 본문` → 처음 나오는 `before` 1곳만 `after`로 교체 → 에디터 갱신 → 토스트 `수정 예시를 본문에 적용했어요.`
- 교체는 `indexOf` + `slice`로 한다. `String.replace(before, after)` 금지 (`after`에 `$&` 같은 특수 패턴이 있으면 결과가 깨짐)

```js
function applyExample(text, before, after) {
  const index = text.indexOf(before);
  if (index === -1) return null;
  return text.slice(0, index) + after + text.slice(index + before.length);
}
```

**완료 기준**
- [ ] 본문 49자 → 피드백 클릭 시 에러 / 50자 이상 → 피드백 표시
- [ ] 피드백 후 본문 한 글자 수정 → `본문 수정됨` 배지
- [ ] 예시 적용 → 본문 교체, `직전 버전 복원` 가능
- [ ] 본문에서 `before` 문장을 지우면 해당 예시 버튼 비활성 + 문구 변경

### 4.7 F-08 AI 다듬기

| 버튼 | mode 값 | 목적 |
|---|---|---|
| `revise-concise-btn` | `concise` | 군더더기 표현·중복 제거, 문장 짧게 (내용 유지) |
| `revise-specific-btn` | `specific` | 추상적 표현을 본문·경험 메모 안의 사실로 구체화, 부족하면 `[보완 필요: …]` 표시 |
| `revise-fit-btn` | `fit_length` | 글자수 제한의 90~100%로 늘리거나 줄이기 |

**처리 순서**: F-04와 같되 ① 검증은 "다듬기 3종" ② 덮어쓰기 다이얼로그 없음 ③ 성공 시 **항상** `prevText = 현재 본문` ④ 성공 토스트는 overLimit이면 초과 경고, 아니면 `본문을 다듬었어요. 마음에 들지 않으면 [직전 버전 복원]을 누르세요.` ⑤ `busyAction = 'revise'`, 누른 버튼에만 로딩 표시.
요청에는 현재 문항의 경험 메모도 함께 보낸다 (`specific` 모드에서 사실 근거로 사용).

**완료 기준**
- [ ] 3개 모드 각각 본문이 바뀜
- [ ] 1,000자 제한에 600자 본문 → `글자수 맞추기` 후 900~1,000자 범위 (AI 특성상 벗어날 수 있으며, 초과 시 경고 토스트)

### 4.8 F-09 직전 버전 복원

- 클릭 시: `text = prevText`, `prevText = null`, 에디터 갱신, 토스트 `직전 버전으로 되돌렸어요.`
- **1단계만** 보관 (다시 실행·여러 단계 기록 없음)
- `prevText`는 AI 초안 생성(기존 본문이 있었을 때), 다듬기, 예시 적용 때만 바뀐다. 사용자가 직접 타이핑할 때는 바뀌지 않는다.

**완료 기준**
- [ ] 다듬기 → 복원 → 원래 본문, 복원 버튼 비활성
- [ ] 새로고침 후에도 `prevText` 유지되어 복원 가능

### 4.9 F-10 자동 저장·초기화

- 자동 저장: §3.3
- 전체 초기화(`reset-btn`): 초기화 다이얼로그 → 확인 시 `localStorage.removeItem('jaso-workshop:v1')` → 기본 상태로 교체 → 모든 입력창 채우기 → 토스트 `모든 내용을 지웠어요.`
- AI 요청 중에는 초기화 버튼도 비활성

**완료 기준**
- [ ] 입력 후 탭을 닫았다 열어도 모든 문항 유지
- [ ] 개발자 도구에서 저장값을 `{abc`로 바꾸고 새로고침 → 토스트 + 기본 상태 + `jaso-workshop:v1:backup`에 원본 존재
- [ ] 초기화 후 새로고침해도 빈 상태

### 4.10 F-11 복사·TXT 내보내기

**복사 (`copy-btn`)**: 현재 문항 본문 그대로(소제목 줄 포함) 복사.
1. `navigator.clipboard.writeText(text)` 시도
2. 실패하면 에디터를 `select()` 후 `document.execCommand('copy')` 시도
3. 둘 다 실패하면 실패 토스트. 성공 시 성공 토스트

**TXT 내보내기 (`export-btn`)**
- 파일명: `자소서_{회사명}_{YYYYMMDD}.txt`
  - 회사명: `trim()` 후 `/[\\/:*?"<>|\s]+/g`를 `_`로 바꾸고 30자에서 자름, 비어 있으면 `이름없음`
  - 날짜: 사용자 컴퓨터 기준 오늘
- 인코딩: UTF-8, 맨 앞에 BOM(`﻿`) 추가 (Windows 메모장 한글 깨짐 방지)
- 생성: `new Blob([내용], { type: 'text/plain;charset=utf-8' })` → `URL.createObjectURL` → 임시 `<a download>` 클릭 → `URL.revokeObjectURL`
- 내용 형식 (문항 순서대로, 문항 사이 빈 줄 1개):

```
[{회사명}] {직무} 자기소개서
작성일: 2026-11-23

1. {문항 내용} ({글자수 제한}자, {공백 포함|공백 제외} 기준)
{본문 — 비어 있으면 "(작성된 본문 없음)"}
(공백 포함 {n}자 / 공백 제외 {m}자)

2. ...
```
- 회사명·직무가 비어 있으면 그 자리에 `미입력`
- 글자수 제한이 null이면 `({기준} 기준)`만 표시
- 완료 토스트 `TXT 파일을 저장했어요.`

**완료 기준**
- [ ] 복사 후 메모장에 붙여넣으면 본문과 동일
- [ ] 내보낸 파일을 Windows 메모장·macOS 텍스트 편집기에서 열어 한글이 깨지지 않음
- [ ] 문항 3개면 파일에 3개 모두 순서대로 포함

### 4.11 F-12 공통 처리 (api.js)

```js
// 모든 서버 요청은 이 함수 하나로 보낸다.
export async function postJson(path, payload) { /* 아래 규칙 */ }
```

| 상황 | 처리 | 에러 코드 |
|---|---|---|
| 60초(`CLIENT_TIMEOUT_MS = 60000`) 초과 | `AbortController`로 중단 | `CLIENT_TIMEOUT` |
| 네트워크 끊김 (`fetch`가 `TypeError`) | — | `NETWORK_ERROR` |
| 응답이 JSON이 아님 (예: Vercel 기본 에러 페이지) | HTTP 504면 `AI_TIMEOUT`, 그 외 `INTERNAL_ERROR` | — |
| 응답 JSON의 `ok === false` | `error.code` 사용 | 서버가 준 코드 |
| 응답 `ok === true` | `data` 반환 | — |

- 에러는 `class ApiError extends Error { constructor(code) }` 형태로 던지고, 화면에서는 `docs/04` §5의 "사용자 문구"로 바꿔 토스트에 표시한다.
- 서버가 `INVALID_INPUT`과 함께 `error.field`를 주면 해당 필드 에러도 입력창 아래에 표시 (필드명 → 입력창 id 매핑은 §2 표).

---

## 5. 브라우저 모듈별 역할

| 파일 | 내보내는 함수/값 | 하는 일 |
|---|---|---|
| `constants.js` | `LIMITS`, `MAX_QUESTIONS = 5`, `DEFAULT_CHAR_LIMIT = 1000`, `STORAGE_KEY`, `BACKUP_KEY`, `SAVE_DEBOUNCE_MS = 500`, `CLIENT_TIMEOUT_MS = 60000`, `TOAST_DURATION_MS = 3000` | 제한값 (§2와 동일) |
| `state.js` | `getState()`, `getActiveQuestion()`, `subscribe(fn)`, `updateProfile(patch)`, `addQuestion()`, `removeQuestion(id)`, `setActiveQuestion(id)`, `updateQuestion(id, patch)`, `updateExperience(id, patch)`, `replaceState(next)`, `resetState()`, `getRuntime()`, `setBusy(action \| null)` | 상태 보관·변경. 변경 시 구독 함수 호출, `updatedAt` 갱신 |
| `storage.js` | `loadState()` → `{ state, status: 'ok' \| 'empty' \| 'corrupt' }`, `saveState(state)` → `'ok' \| 'quota' \| 'error'`, `clearState()` | localStorage 읽기·쓰기 |
| `counter.js` | `countChars`, `countPlaceholders`, `PLACEHOLDER_PATTERN` | §4.5 |
| `validate.js` | `validateFor(action, profile, question)` → `[{ field, inputId, message }]` | §2 |
| `api.js` | `postJson`, `requestGenerate`, `requestFeedback`, `requestRevise`, `ApiError` | §4.11 |
| `render.js` | `renderAll()`, `fillInputs()`, `renderQuestionList()`, `renderCounters()`, `renderFeedback()`, `renderControls()` | 상태 → 화면. `fillInputs`만 입력창 `value`를 바꿈 (§3.4) |
| `ui.js` | `showToast(message, type)`, `confirmDialog({ title, message, okLabel, danger })` → `Promise<boolean>`, `setButtonLoading(button, text \| null)`, `showFieldErrors(errors)`, `clearFieldErrors()` | 공통 UI 도구 |
| `export.js` | `copyText(text)` → `Promise<boolean>`, `downloadTxt(state)` | §4.10 |
| `main.js` | (없음) | 시작: 불러오기 → `renderAll` → 이벤트 연결, 버튼 동작 함수(`handleGenerate` 등) |

---

## 6. 전체 완료 기준

- [ ] §4의 모든 기능별 완료 기준 통과
- [ ] `docs/07-qa-checklist.md` 기능 테스트 케이스(TC-F) 전부 통과
- [ ] `public/js/constants.js`와 `lib/constants.js`의 제한값이 §2와 동일
