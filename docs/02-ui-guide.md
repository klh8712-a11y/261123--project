# 02. UI 구현 지침

> 대상 마일스톤: **M1**(뼈대), **M5**(반응형·접근성 마감)
> 참고 자료: 사용자 제공 `DESIGN-notion.md` (Notion 디자인 언어 분석). 이 문서는 그 내용을 이 서비스에 맞게 **확정한 값**입니다.
> 에이전트는 참고 파일이 아니라 **이 문서의 값**을 구현합니다. 참고 파일에 없는 값은 이 문서에 "추가 정의"로 표시했습니다.

---

## 0. 참고 디자인 요약 (비전공자용)

Notion 디자인을 한 문장으로 요약하면 **"햇빛 드는 정돈된 책상"** 입니다.

- 바탕은 새하얀색이 아니라 **따뜻한 종이색**(`#f6f5f4`)
- 카드·입력창은 **흰색**, 경계는 아주 옅은 **회색 실선**(`#e6e6e6`)
- 글자는 거의 검정, 색으로 강조하는 건 **파란색 한 가지**(`#0075de`)뿐 — 주요 버튼, 링크, 선택 표시에만 사용
- 알록달록한 색(보라·주황·청록 등)은 **작은 점·장식에만** 사용, 버튼이나 배경에는 절대 사용하지 않음
- 그림자는 거의 안 보일 만큼 옅게, 모서리는 카드 12px · 버튼 8px · 입력창 4px · 주요 버튼은 알약 모양

---

## 1. 디자인 원칙

| # | 원칙 | 이 서비스에서의 적용 |
|---|---|---|
| P-1 | 글쓰기에 집중 | 본문 에디터가 화면에서 가장 넓은 영역을 차지 |
| P-2 | 색은 파란색 하나 | 파란색은 주요 버튼(`AI 초안 생성`), 링크, 선택된 문항, 포커스 표시에만 사용 |
| P-3 | 장식 색은 점으로만 | STAR 항목·피드백 점수 항목 앞의 8px 원형 점에만 장식 색 사용 |
| P-4 | 여백으로 묶기 | 구분선보다 여백으로 그룹을 나눔, 카드 테두리는 옅은 실선 |
| P-5 | 조용한 깊이 | 기본 카드는 그림자 없음(실선만), 떠 있는 요소(토스트·다이얼로그)만 옅은 그림자 |
| P-6 | 단 한 번의 어두운 띠 | 진한 남색(`#213183`) 띠는 페이지 상단 소개 영역 1곳에만 사용 |

---

## 2. 글꼴

### 2.1 fonts.css (그대로 사용, 수정 금지)

`public/css/fonts.css`에 아래 내용을 **그대로** 넣는다. (font-family 이름은 `Paperozi`, 파일명은 `Paperlogy`로 서로 다르지만 정상이다.)

```css
@font-face {
  font-family: 'Paperozi';
  src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/2408-3@1.0/Paperlogy-1Thin.woff2') format('woff2');
  font-weight: 100;
  font-display: swap;
}
@font-face {
  font-family: 'Paperozi';
  src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/2408-3@1.0/Paperlogy-2ExtraLight.woff2') format('woff2');
  font-weight: 200;
  font-display: swap;
}
@font-face {
  font-family: 'Paperozi';
  src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/2408-3@1.0/Paperlogy-3Light.woff2') format('woff2');
  font-weight: 300;
  font-display: swap;
}
@font-face {
  font-family: 'Paperozi';
  src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/2408-3@1.0/Paperlogy-4Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}
@font-face {
  font-family: 'Paperozi';
  src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/2408-3@1.0/Paperlogy-5Medium.woff2') format('woff2');
  font-weight: 500;
  font-display: swap;
}
@font-face {
  font-family: 'Paperozi';
  src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/2408-3@1.0/Paperlogy-6SemiBold.woff2') format('woff2');
  font-weight: 600;
  font-display: swap;
}
@font-face {
  font-family: 'Paperozi';
  src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/2408-3@1.0/Paperlogy-7Bold.woff2') format('woff2');
  font-weight: 700;
  font-display: swap;
}
@font-face {
  font-family: 'Paperozi';
  src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/2408-3@1.0/Paperlogy-8ExtraBold.woff2') format('woff2');
  font-weight: 800;
  font-display: swap;
}
@font-face {
  font-family: 'Paperozi';
  src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/2408-3@1.0/Paperlogy-9Black.woff2') format('woff2');
  font-weight: 900;
  font-display: swap;
}
```

> 9개 굵기를 모두 선언해도 브라우저는 **실제로 쓰는 굵기 파일만** 내려받는다. 이 서비스는 400·500·600·700만 사용한다.

### 2.2 글꼴 순서 (대체 글꼴)

```css
font-family: 'Paperozi', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, 'Segoe UI', sans-serif;
```
웹폰트가 늦게 로드되거나 실패해도 시스템 한글 글꼴로 표시된다.

### 2.3 글자 크기 체계 (참고 파일 typography 기반)

참고 파일의 64px·54px·40px 대형 제목은 마케팅 페이지용이라 **사용하지 않는다.**

| 토큰 | 크기 | 굵기 | 줄 간격 | 자간 | 사용처 |
|---|---|---|---|---|---|
| `heading-2` | 26px | 700 | 1.23 | -0.625px | 상단 소개 띠 제목 |
| `heading-3` | 22px | 700 | 1.27 | -0.25px | (모바일) 소개 띠 제목 |
| `title` | 20px | 600 | 1.4 | -0.125px | 카드 제목 (지원 정보, 문항 N, AI 피드백) |
| `body-md` | 16px | 400 | 1.5 | 0 | 기본 본문, 입력창 글자 |
| `editor` *(추가 정의)* | 16px | 400 | **1.8** | 0 | 본문 에디터 (긴 글 가독성) |
| `body-sm` | 15px | 400 | 1.33 | 0 | 문항 목록, 보조 설명 |
| `button` | 16px | 500 | 1.5 | 0 | 주요 버튼 글자 |
| `button-sm` *(추가 정의)* | 14px | 500 | 1.43 | 0 | 보조(utility) 버튼 글자 |
| `caption` | 14px | 400 | 1.43 | 0 | 라벨 아래 안내문, 글자수, 푸터 |
| `eyebrow` | 12px | 600 | 1.33 | 0.125px | 배지, 소개 띠 위 작은 문구 |
| `label` *(추가 정의)* | 14px | 600 | 1.43 | 0 | 입력창 라벨 |

- 제목만 700, 본문은 400 유지 (참고 파일 Don't: 본문을 굵게 쓰지 않기)

---

## 3. 디자인 토큰 — `public/css/tokens.css` (그대로 사용)

```css
/* 참고: DESIGN-notion.md. "추가 정의"는 참고 파일에 없어 이 프로젝트에서 정한 값 */
:root {
  /* ── 기본 색 ── */
  --color-primary: #0075de;          /* 유일한 강조색: 주요 버튼, 링크, 선택, 포커스 */
  --color-primary-active: #005bab;   /* 주요 버튼 hover/누름 */
  --color-secondary: #213183;        /* 상단 소개 띠 배경 (1곳만) */
  --color-on-primary: #ffffff;
  --color-canvas: #ffffff;           /* 상단 내비게이션 바 */
  --color-canvas-soft: #f6f5f4;      /* 페이지 바탕, 푸터 */
  --color-surface: #ffffff;          /* 카드, 입력창 */

  /* ── 글자 색 ── */
  --color-ink: rgba(0, 0, 0, 0.95);  /* 제목·본문 (참고 파일: 검정 95%) */
  --color-ink-secondary: #31302e;    /* 보조 본문, 푸터 글자 */
  --color-ink-muted: #615d59;        /* 안내문, 글자수 */
  --color-ink-faint: #a39e98;        /* 입력창 placeholder, 비활성 */

  /* ── 선 ── */
  --color-hairline: #e6e6e6;         /* 카드 테두리, 구분선 */
  --color-input-border: #dddddd;     /* 입력창 테두리 (참고 파일 rgb(221,221,221)) */

  /* ── 장식 전용 색 (점·막대 장식에만, 버튼·배경 금지) ── */
  --color-accent-sky: #62aef0;
  --color-accent-purple: #d6b6f6;
  --color-accent-orange: #dd5b00;
  --color-accent-teal: #2a9d99;
  --color-accent-green: #1aae39;

  /* ── 상태 색 (추가 정의: 참고 파일에 상태 색 없음, 흰 바탕 대비 4.5:1 이상으로 정함) ── */
  --color-success: #127a2b;          /* 글자수 적정 */
  --color-warning: #793400;          /* 보완 필요 안내 (참고 파일 accent-orange-deep) */
  --color-danger: #c9372c;           /* 에러, 글자수 초과, 삭제 */
  --color-danger-soft: #fdf0ef;      /* 에러 입력창 배경 */
  --color-selected: #f1f0ee;         /* 선택된 문항 행 배경 (추가 정의) */

  /* ── 글꼴 ── */
  --font-family-base: 'Paperozi', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, 'Segoe UI', sans-serif;

  /* ── 간격 (참고 파일 spacing, 기본 단위 8px) ── */
  --space-xxs: 4px;
  --space-xs: 8px;
  --space-sm: 12px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 28px;
  --space-xxl: 32px;
  --space-section: 48px;             /* 추가 정의: 큰 영역 사이 */

  /* ── 모서리 ── */
  --radius-xs: 4px;                  /* 입력창, 작은 태그 */
  --radius-sm: 5px;                  /* 목록 행 */
  --radius-md: 8px;                  /* 보조 버튼 */
  --radius-lg: 12px;                 /* 카드 */
  --radius-xl: 16px;                 /* 다이얼로그, 토스트, 빈 상태 */
  --radius-full: 9999px;             /* 주요·보조 버튼, 배지 */

  /* ── 그림자 (참고 파일 Elevation) ── */
  --shadow-1:
    0 0.175px 1.041px rgba(0, 0, 0, 0.01),
    0 0.8px 2.925px rgba(0, 0, 0, 0.02),
    0 2.025px 7.847px rgba(0, 0, 0, 0.027),
    0 4px 18px rgba(0, 0, 0, 0.04);
  --shadow-2:
    0 0.175px 1.041px rgba(0, 0, 0, 0.01),
    0 0.8px 2.925px rgba(0, 0, 0, 0.02),
    0 2.025px 7.847px rgba(0, 0, 0, 0.027),
    0 4px 18px rgba(0, 0, 0, 0.04),
    0 23px 52px rgba(0, 0, 0, 0.05);

  /* ── 레이아웃 (추가 정의) ── */
  --container-max: 1300px;
  --nav-height: 56px;
  --sidebar-width: 280px;
  --feedback-width: 360px;
  --z-nav: 100;
  --z-toast: 300;
  --transition-fast: 120ms ease;
}
```

**사용 규칙**
- CSS에서 색상·간격·모서리·그림자는 반드시 `var(--...)`로만 쓴다. `#0075de` 같은 값을 직접 쓰지 않는다 (tokens.css 제외).
- 레이아웃 계산용 `px`(예: `max-height: calc(100vh - 96px)`)과 테두리 두께 `1px`, `2px`, `3px`는 직접 써도 된다.

---

## 4. 레이아웃과 반응형

### 4.1 페이지 구조 (위 → 아래)

| 순서 | 영역 | 배경 | 높이/여백 |
|---|---|---|---|
| 1 | 내비게이션 바 (`nav-bar`) | `--color-canvas` (흰색), 아래 1px `--color-hairline` | 높이 `--nav-height`, 스크롤 시 상단 고정(`position: sticky`) |
| 2 | 소개 띠 (`intro-band`) | `--color-secondary` (진한 남색), 글자 흰색 | 위아래 패딩 `--space-xxl` |
| 3 | 작업 공간 (`workspace`) | `--color-canvas-soft` (종이색) | 위아래 패딩 `--space-lg` |
| 4 | 푸터 (`footer`) | `--color-canvas-soft`, 위 1px `--color-hairline` | 패딩 `--space-xxl` |

모든 영역의 내용은 `.container`(최대 너비 `--container-max`, 좌우 패딩 `--space-lg`, 가운데 정렬) 안에 둔다. 소개 띠와 푸터의 **배경색은** 화면 끝까지 꽉 채운다.

### 4.2 화면 너비별 배치 (breakpoint)

| 이름 | 너비 | 작업 공간 배치 |
|---|---|---|
| 데스크톱 | **1080px 이상** | 3단: 왼쪽 사이드바 `--sidebar-width` · 가운데 에디터 (나머지) · 오른쪽 피드백 `--feedback-width`, 단 간격 `--space-lg` |
| 태블릿 | **601px ~ 1079px** | 2단: 왼쪽 사이드바 240px · 오른쪽에 에디터, 그 아래 피드백 패널 |
| 모바일 | **600px 이하** | 1단: 지원 정보 → 문항 목록(가로 스크롤 칩) → 에디터 → 피드백 순, 좌우 패딩 `--space-md` |

CSS Grid로 구현한다. 미디어 쿼리는 아래 2개만 사용한다.

```css
@media (max-width: 1079px) { /* 태블릿 */ }
@media (max-width: 600px)  { /* 모바일 */ }
```

### 4.3 와이어프레임

**데스크톱 (1080px 이상)**
```
┌────────────────────────────────────────────────────────────────────────┐
│ 자소서 작업실                          저장됨  [TXT 내보내기] [전체 초기화] │ ← nav-bar (흰색, 고정)
├────────────────────────────────────────────────────────────────────────┤
│▓ AI 자기소개서 작성 도구                                                ▓│
│▓ 경험 메모에서 시작하는 자소서                                           ▓│ ← intro-band (남색)
│▓ 지원 정보와 경험을 적으면 ...                                          ▓│
├────────────────────────────────────────────────────────────────────────┤
│ ┌지원 정보──────┐ ┌문항 1─────────────────[문항 삭제]┐ ┌AI 피드백────────┐│
│ │회사명 [     ] │ │문항 내용 [                     ]│ │                 ││
│ │직무   [     ] │ │글자수 제한 [1000] 기준[공백 포함▾]│ │ (빈 상태 안내)   ││
│ │채용공고·인재상 │ │☑ 소제목 포함                     │ │                 ││
│ │[            ] │ │▾ 경험 메모 (STAR)                │ │                 ││
│ └───────────────┘ │ ● 상황·과제 [                  ]│ │                 ││
│ ┌문항 목록 1/5──┐ │ ● 행동      [                  ]│ │                 ││
│ │▌문항 1 지원.. │ │ ● 결과      [                  ]│ │                 ││
│ │ 문항 2 입사.. │ │ ● 배운 점   [                  ]│ │                 ││
│ │[+ 문항 추가]  │ └──────────────────────────────────┘ │                 ││
│ └───────────────┘ ┌본문──────────────────────────────┐ │                 ││
│                   │                                  │ │                 ││
│                   │  (본문 에디터, 16줄)              │ │                 ││
│                   │                                  │ │                 ││
│                   ├──────────────────────────────────┤ │                 ││
│                   │공백 포함 950 / 1,000자 · 공백 제외 720자│ │              ││
│                   │(AI 초안 생성) (AI 피드백 받기)      │ │                 ││
│                   │다듬기 [간결하게][구체적으로][글자수 맞추기]│ │             ││
│                   │[복사] [직전 버전 복원]              │ │                 ││
│                   └──────────────────────────────────┘ └─────────────────┘│
├────────────────────────────────────────────────────────────────────────┤
│ 입력한 내용은 이 브라우저에만 저장되며 ...                                │ ← footer
└────────────────────────────────────────────────────────────────────────┘
```
`( )` = 알약 모양 버튼, `[ ]` = 8px 모서리 보조 버튼, `●` = 장식 색 점, `▌` = 선택 표시 막대

- 데스크톱에서 피드백 패널은 `position: sticky; top: calc(var(--nav-height) + var(--space-md));`, `max-height: calc(100vh - 96px); overflow-y: auto;`
- 사이드바도 같은 방식으로 sticky

---

## 5. HTML 구조와 id (그대로 사용)

JS는 아래 **id로만** 요소를 찾는다 (`AGENTS.md` §6). class 이름은 BEM 형식(`block__element--modifier`)을 따른다.
**역할 분리:** id는 JS 전용, class는 CSS 전용. CSS 파일에서 `#id` 선택자를 쓰지 않는다 (§11 색상 코드 검사가 오작동하지 않게 하기 위함이기도 함).

### 5.1 `public/index.html` 전체 뼈대

```html
<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>자소서 작업실</title>
  <meta name="description" content="경험 메모로 시작하는 AI 자기소개서 작성 도구">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
  <link rel="stylesheet" href="/css/fonts.css">
  <link rel="stylesheet" href="/css/tokens.css">
  <link rel="stylesheet" href="/css/base.css">
  <link rel="stylesheet" href="/css/layout.css">
  <link rel="stylesheet" href="/css/components.css">
  <script type="module" src="/js/main.js"></script>
</head>
<body>
  <a class="skip-link" href="#editor-section">본문 작성으로 건너뛰기</a>

  <header class="nav-bar">
    <div class="container nav-bar__inner">
      <span class="nav-bar__logo">자소서 작업실</span>
      <div class="nav-bar__actions">
        <span class="nav-bar__status" id="save-status" aria-live="polite"></span>
        <button type="button" class="btn btn--utility" id="export-btn">TXT 내보내기</button>
        <button type="button" class="btn btn--utility" id="reset-btn">전체 초기화</button>
      </div>
    </div>
  </header>

  <section class="intro-band" aria-labelledby="intro-title">
    <div class="container">
      <p class="intro-band__eyebrow">AI 자기소개서 작성 도구</p>
      <h1 class="intro-band__title" id="intro-title">경험 메모에서 시작하는 자소서</h1>
      <p class="intro-band__desc">지원 정보와 경험을 적으면 글자수에 맞춘 초안, 피드백, 다듬기를 도와드려요.</p>
    </div>
  </section>

  <main class="workspace">
    <div class="container workspace__grid">

      <!-- 왼쪽: 지원 정보 + 문항 목록 -->
      <aside class="workspace__sidebar" aria-label="지원 정보와 문항 목록">
        <section class="card" aria-labelledby="profile-title">
          <h2 class="card__title" id="profile-title">지원 정보</h2>
          <div class="field">
            <label class="field__label" for="company-input">회사명 <span class="field__required">필수</span></label>
            <input class="input" id="company-input" type="text" maxlength="50" autocomplete="organization" placeholder="예: 한국전력거래소">
            <p class="field__error" id="company-input-error" hidden></p>
          </div>
          <div class="field">
            <label class="field__label" for="role-input">지원 직무 <span class="field__required">필수</span></label>
            <input class="input" id="role-input" type="text" maxlength="50" placeholder="예: 전력계통 운영">
            <p class="field__error" id="role-input-error" hidden></p>
          </div>
          <div class="field">
            <label class="field__label" for="posting-input">채용공고·인재상 <span class="field__optional">선택</span></label>
            <textarea class="input input--textarea" id="posting-input" rows="5" maxlength="3000" placeholder="채용공고의 직무 설명이나 인재상을 붙여 넣으면 초안에 반영돼요."></textarea>
            <p class="field__count" id="posting-input-count">0 / 3,000</p>
            <p class="field__error" id="posting-input-error" hidden></p>
          </div>
        </section>

        <section class="card" aria-labelledby="question-list-title">
          <div class="card__header">
            <h2 class="card__title" id="question-list-title">문항 목록</h2>
            <span class="badge-pill" id="question-count">1 / 5</span>
          </div>
          <ul class="question-list" id="question-list"></ul>
          <button type="button" class="btn btn--utility btn--block" id="add-question-btn">+ 문항 추가</button>
        </section>
      </aside>

      <!-- 가운데: 문항 설정 + 본문 에디터 -->
      <section class="workspace__editor" id="editor-section" aria-labelledby="editor-title" tabindex="-1">
        <div class="card">
          <div class="card__header">
            <h2 class="card__title" id="editor-title">문항 1</h2>
            <button type="button" class="btn btn--text-danger" id="delete-question-btn">문항 삭제</button>
          </div>
          <div class="field">
            <label class="field__label" for="question-input">문항 내용 <span class="field__required">필수</span></label>
            <textarea class="input input--textarea" id="question-input" rows="2" maxlength="300" placeholder="예: 지원 직무와 관련된 경험을 바탕으로 본인의 강점을 기술해 주세요."></textarea>
            <p class="field__count" id="question-input-count">0 / 300</p>
            <p class="field__error" id="question-input-error" hidden></p>
          </div>
          <div class="field-row">
            <div class="field">
              <label class="field__label" for="char-limit-input">글자수 제한</label>
              <input class="input" id="char-limit-input" type="number" min="100" max="3000" step="10" inputmode="numeric">
              <p class="field__error" id="char-limit-input-error" hidden></p>
            </div>
            <div class="field">
              <label class="field__label" for="count-mode-select">세는 기준</label>
              <select class="input input--select" id="count-mode-select">
                <option value="with_spaces">공백 포함</option>
                <option value="without_spaces">공백 제외</option>
              </select>
            </div>
            <div class="field field--checkbox">
              <input type="checkbox" id="include-title-checkbox">
              <label for="include-title-checkbox">소제목 포함</label>
            </div>
          </div>

          <details class="star" id="experience-details" open>
            <summary class="star__summary">경험 메모 (STAR)</summary>
            <p class="star__help">AI는 여기 적은 사실만 사용해요. 숫자·기간·역할을 구체적으로 적을수록 좋아요.</p>
            <div class="field">
              <label class="field__label" for="exp-situation"><span class="dot dot--sky" aria-hidden="true"></span>상황·과제 <span class="field__optional">선택</span></label>
              <textarea class="input input--textarea" id="exp-situation" rows="3" maxlength="1000" placeholder="언제, 어디서, 어떤 문제나 목표가 있었나요?"></textarea>
              <p class="field__count" id="exp-situation-count">0 / 1,000</p>
            </div>
            <div class="field">
              <label class="field__label" for="exp-action"><span class="dot dot--orange" aria-hidden="true"></span>행동 <span class="field__required">필수</span></label>
              <textarea class="input input--textarea" id="exp-action" rows="3" maxlength="1000" placeholder="내가 직접 한 일은 무엇인가요?"></textarea>
              <p class="field__count" id="exp-action-count">0 / 1,000</p>
              <p class="field__error" id="exp-action-error" hidden></p>
            </div>
            <div class="field">
              <label class="field__label" for="exp-result"><span class="dot dot--green" aria-hidden="true"></span>결과 <span class="field__optional">선택</span></label>
              <textarea class="input input--textarea" id="exp-result" rows="3" maxlength="1000" placeholder="어떤 변화가 있었나요? 숫자가 있으면 함께 적어 주세요."></textarea>
              <p class="field__count" id="exp-result-count">0 / 1,000</p>
            </div>
            <div class="field">
              <label class="field__label" for="exp-lesson"><span class="dot dot--purple" aria-hidden="true"></span>배운 점 <span class="field__optional">선택</span></label>
              <textarea class="input input--textarea" id="exp-lesson" rows="2" maxlength="1000" placeholder="이 경험으로 무엇을 배웠고, 입사 후 어떻게 쓸 수 있나요?"></textarea>
              <p class="field__count" id="exp-lesson-count">0 / 1,000</p>
            </div>
          </details>
        </div>

        <div class="card editor-card">
          <label class="card__title" for="body-editor">본문</label>
          <textarea class="input input--editor" id="body-editor" rows="16" maxlength="5000" placeholder="직접 쓰거나, 아래 [AI 초안 생성]을 눌러 시작하세요."></textarea>
          <p class="counter" id="char-counter" aria-live="polite">
            <span id="count-with-spaces"></span>
            <span class="counter__divider" aria-hidden="true">·</span>
            <span id="count-without-spaces"></span>
            <span class="counter__status" id="count-status"></span>
          </p>
          <p class="notice notice--warning" id="placeholder-notice" hidden></p>
          <div class="toolbar">
            <div class="toolbar__row">
              <button type="button" class="btn btn--primary" id="generate-btn">AI 초안 생성</button>
              <button type="button" class="btn btn--secondary" id="feedback-btn">AI 피드백 받기</button>
            </div>
            <div class="toolbar__row" role="group" aria-labelledby="revise-label">
              <span class="toolbar__label" id="revise-label">다듬기</span>
              <button type="button" class="btn btn--utility" id="revise-concise-btn">간결하게</button>
              <button type="button" class="btn btn--utility" id="revise-specific-btn">구체적으로</button>
              <button type="button" class="btn btn--utility" id="revise-fit-btn">글자수 맞추기</button>
            </div>
            <div class="toolbar__row">
              <button type="button" class="btn btn--utility" id="copy-btn">복사</button>
              <button type="button" class="btn btn--utility" id="restore-btn">직전 버전 복원</button>
            </div>
          </div>
          <p class="ai-status" id="ai-status" aria-live="polite"></p>
        </div>
      </section>

      <!-- 오른쪽: AI 피드백 -->
      <aside class="workspace__feedback" id="feedback-panel" aria-labelledby="feedback-title">
        <div class="card">
          <div class="card__header">
            <h2 class="card__title" id="feedback-title">AI 피드백</h2>
            <span class="badge-pill badge-pill--warning" id="feedback-stale" hidden>본문 수정됨</span>
          </div>
          <div class="empty-state" id="feedback-empty">
            <p class="empty-state__title">아직 피드백이 없어요</p>
            <p class="empty-state__desc">본문을 50자 이상 작성한 뒤 [AI 피드백 받기]를 눌러 보세요.</p>
          </div>
          <div class="skeleton" id="feedback-loading" hidden aria-hidden="true">
            <div class="skeleton__line"></div><div class="skeleton__line"></div><div class="skeleton__line skeleton__line--short"></div>
          </div>
          <div class="feedback" id="feedback-content" hidden>
            <p class="feedback__summary" id="feedback-summary"></p>
            <ul class="score-list" id="feedback-scores"></ul>
            <h3 class="feedback__heading">강점</h3>
            <ul class="feedback__list" id="feedback-strengths"></ul>
            <h3 class="feedback__heading">개선점</h3>
            <ul class="feedback__list" id="feedback-improvements"></ul>
            <h3 class="feedback__heading">수정 예시</h3>
            <ul class="example-list" id="feedback-examples"></ul>
          </div>
        </div>
      </aside>

    </div>
  </main>

  <footer class="footer">
    <div class="container">
      <p>입력한 내용은 이 브라우저에만 저장되며, AI 기능을 사용할 때만 OpenAI로 전송돼요.</p>
      <p>주민등록번호, 연락처 같은 민감한 개인정보는 입력하지 마세요. AI 결과는 반드시 직접 확인 후 사용하세요.</p>
    </div>
  </footer>

  <dialog class="dialog" id="confirm-dialog" aria-labelledby="confirm-title" aria-describedby="confirm-message">
    <form method="dialog" class="dialog__body">
      <h2 class="dialog__title" id="confirm-title"></h2>
      <p class="dialog__message" id="confirm-message"></p>
      <div class="dialog__actions">
        <button class="btn btn--secondary" id="confirm-cancel-btn" value="cancel">취소</button>
        <button class="btn btn--primary" id="confirm-ok-btn" value="ok">확인</button>
      </div>
    </form>
  </dialog>

  <div class="toast-region" id="toast-region" aria-live="polite" aria-atomic="true"></div>
</body>
</html>
```

### 5.2 JS가 동적으로 만드는 요소

아래 요소는 `document.createElement` + `textContent`로 만든다 (`innerHTML` 금지).

**문항 목록 행** (`#question-list` 안)
```html
<li>
  <button type="button" class="question-list__item" data-id="{문항 id}" aria-current="true">
    <span class="question-list__number">문항 1</span>
    <span class="question-list__preview">지원 직무와 관련된 경험을…</span>
  </button>
</li>
```
- `aria-current="true"`는 선택된 문항에만 붙인다.
- preview: 문항 내용 앞 20자 + `…`(20자 초과 시). 비어 있으면 `문항 내용을 입력하세요`.

**점수 행** (`#feedback-scores` 안, 4개 고정 순서)
```html
<li class="score">
  <span class="score__label"><span class="dot dot--sky" aria-hidden="true"></span>문항 적합성</span>
  <span class="score__bar" role="img" aria-label="5점 만점에 4점"><span class="score__fill" style="width:80%"></span></span>
  <span class="score__value">4 / 5</span>
</li>
```
| 순서 | 키 | 표시 이름 | 점 색 |
|---|---|---|---|
| 1 | `relevance` | 문항 적합성 | `dot--sky` |
| 2 | `specificity` | 구체성 | `dot--orange` |
| 3 | `jobFit` | 직무 연관성 | `dot--teal` |
| 4 | `readability` | 가독성 | `dot--purple` |

`style="width:80%"`는 JS에서 `el.style.width = (score * 20) + '%'`로 지정한다.

**개선점 행**: `<li><strong class="feedback__issue">{issue}</strong><p>{suggestion}</p></li>`

**수정 예시 행**
```html
<li class="example">
  <p class="example__label">원문</p>
  <p class="example__before">{before}</p>
  <p class="example__label">수정안</p>
  <p class="example__after">{after}</p>
  <button type="button" class="btn btn--utility example__apply">본문에 적용</button>
</li>
```

**토스트** (`#toast-region` 안, 한 번에 1개만): `<div class="toast toast--{success|error|info}">{문구}</div>`

---

## 6. 컴포넌트 명세

### 6.1 버튼

| 클래스 | 용도 | 배경 | 글자 | 테두리 | 모서리 | 높이·패딩 | 글자 토큰 |
|---|---|---|---|---|---|---|---|
| `.btn--primary` | 주요 행동 (AI 초안 생성, 다이얼로그 확인) | `--color-primary` | `--color-on-primary` | 없음 | `--radius-full` | 44px · 0 20px | `button` |
| `.btn--secondary` | 두 번째 행동 (AI 피드백 받기, 취소) | `--color-surface` | `--color-ink` | 없음, `--shadow-1` | `--radius-full` | 44px · 0 20px | `button` |
| `.btn--utility` | 도구 버튼 (다듬기, 복사, 복원, 내보내기, 초기화, 문항 추가) | `--color-surface` | `--color-ink` | 1px `--color-hairline` | `--radius-md` | 36px · 4px 14px | `button-sm` |
| `.btn--text-danger` | 문항 삭제 | 투명 | `--color-danger` | 없음 | `--radius-md` | 32px · 0 8px | `button-sm` |
| `.btn--danger` | 위험 확인 (초기화·삭제 다이얼로그의 확인) | `--color-surface` | `--color-danger` | 1px `--color-danger` | `--radius-full` | 44px · 0 20px | `button` |
| `.btn--block` | 너비 100% 보조 클래스 | — | — | — | — | — | — |

> 참고 파일 Don't: "강조색을 두 개 쓰지 않는다" → 위험 버튼도 빨간 **배경**이 아니라 흰 배경 + 빨간 글자·테두리.

**상태**
| 상태 | 표현 |
|---|---|
| hover | primary → 배경 `--color-primary-active` / secondary·utility → 배경 `--color-canvas-soft` / text-danger → 배경 `--color-danger-soft` |
| 누름(active) | `transform: scale(0.97)` (참고 파일은 0.9이나 작업 도구 특성상 0.97로 조정) |
| 포커스 | `outline: 2px solid var(--color-primary); outline-offset: 2px;` (`:focus-visible`에만) |
| 비활성(disabled) | `opacity: 0.4; cursor: not-allowed;` hover·누름 효과 없음 |
| 로딩 | 글자 앞에 14px 회전 원(`.spinner`) + 문구 변경(§8), `aria-busy="true"`, 비활성 처리 |

모바일(600px 이하)에서 utility 버튼 높이도 **44px**로 늘린다 (터치 영역 확보).

### 6.2 입력창

| 클래스 | 모양 |
|---|---|
| `.input` | 배경 `--color-surface`, 글자 `--color-ink` 16px(`body-md`), 테두리 1px `--color-input-border`, 모서리 `--radius-xs`, 패딩 `6px 10px`, 높이 40px(한 줄) |
| `.input--textarea` | 패딩 `10px`, `resize: vertical`, 최소 높이는 `rows` 속성 기준 |
| `.input--editor` *(본문 에디터)* | 패딩 `--space-md`, 글자 `editor` 토큰(16px/1.8), 최소 높이 400px(모바일 300px), `resize: vertical` |
| `.input--select` | `.input`과 동일, 오른쪽 기본 화살표 유지 |
| placeholder | `--color-ink-faint` |
| 포커스 | 테두리 `--color-primary`, `box-shadow: var(--shadow-1)` (참고 파일: 포커스 시 Level-1 그림자) |
| 에러 | 테두리 `--color-danger`, 배경 `--color-danger-soft`, `aria-invalid="true"` |
| 읽기 전용(AI 요청 중 에디터) | 배경 `--color-canvas-soft`, `readonly` 속성 |

> 입력창 16px 미만이면 아이폰에서 자동 확대가 일어나므로 16px 고정.

**필드 묶음**
- `.field`: 세로 배치, 라벨과 입력창 간격 `--space-xxs`, 필드 간 간격 `--space-md`
- `.field__label`: `label` 토큰, `--color-ink`
- `.field__required`: `eyebrow` 토큰, `--color-primary` / `.field__optional`: `eyebrow` 토큰, `--color-ink-muted`
- `.field__count`: `caption` 토큰, `--color-ink-muted`, 오른쪽 정렬. 최대치 도달 시 `--color-danger`
- `.field__error`: `caption` 토큰, `--color-danger`
- `.field-row`: 데스크톱 가로 배치(gap `--space-md`, 체크박스는 아래쪽 정렬), 모바일 세로 배치

### 6.3 카드

| 항목 | 값 |
|---|---|
| 배경 | `--color-surface` |
| 테두리 | 1px `--color-hairline` |
| 그림자 | 없음 (참고 파일 Level 0) |
| 모서리 | `--radius-lg` |
| 패딩 | `--space-lg` (모바일 `--space-md`) |
| 카드 간 간격 | `--space-md` |
| `.card__header` | 제목과 오른쪽 요소 가로 배치(`justify-content: space-between`), 아래 여백 `--space-md` |
| `.card__title` | `title` 토큰 |

### 6.4 문항 목록 (참고 파일 `ex-app-shell-row`)

| 상태 | 표현 |
|---|---|
| 기본 | 배경 투명, 모서리 `--radius-sm`, 패딩 `--space-sm --space-md`, 너비 100%, 왼쪽 정렬 |
| hover | 배경 `--color-canvas-soft` |
| 선택(`aria-current="true"`) | 배경 `--color-selected`, 왼쪽 3px `--color-primary` 막대(`box-shadow: inset 3px 0 0 var(--color-primary)`), 번호 글자 `--color-primary` |
| 번호 | `body-sm` + 굵기 600 / preview: `body-sm`, `--color-ink-muted`, 한 줄 말줄임 |

모바일: `#question-list`를 가로 스크롤(`display:flex; overflow-x:auto; gap: var(--space-xs)`)로 바꾸고 각 행은 preview를 숨긴 칩(`문항 1`) 형태, 모서리 `--radius-full`.

### 6.5 상단 영역

**내비게이션 바 (`nav-bar`)**: 흰 배경, 아래 1px 실선, 높이 56px, 패딩 0 `--space-md`. 로고 텍스트 `title` 토큰. 저장 상태(`#save-status`)는 `caption`·`--color-ink-muted`, 모바일에서 숨김.
모바일에서 `TXT 내보내기`, `전체 초기화` 버튼은 그대로 두되 `button-sm`, 높이 36px 유지 (가로 넘침 시 로고 글자 `body-sm`로 축소).

**소개 띠 (`intro-band`)**: 배경 `--color-secondary`, 패딩 `--space-xxl` 0.
- `.intro-band__eyebrow`: `eyebrow` 토큰, 흰색 70% 투명도(`rgba(255,255,255,0.7)`)
- `.intro-band__title`: `heading-2` 토큰, 흰색 (모바일 `heading-3`)
- `.intro-band__desc`: `body-md`, 흰색 80% 투명도, 위 여백 `--space-xs`
- 별·스티커 그림 등 장식 **넣지 않는다**.

### 6.6 배지 (`badge-pill`)

흰 배경, 1px `--color-hairline` 테두리, 글자 `--color-primary`, `eyebrow` 토큰, `--radius-full`, 패딩 `4px 8px`.
`.badge-pill--warning`: 글자 `--color-warning`.

### 6.7 피드백 패널

- `.feedback__summary`: `body-md`, 아래 여백 `--space-md`
- 점수 행 `.score`: 가로 배치 `라벨(110px) · 막대(나머지) · 값(44px)`, 행 간격 `--space-xs`
- `.score__bar`: 높이 6px, 배경 `--color-hairline`, 모서리 `--radius-full` / `.score__fill`: 배경 `--color-primary`
- `.feedback__heading`: `body-sm` + 굵기 600, 위 여백 `--space-lg`
- `.feedback__list`: 글머리 기호 `disc`, 왼쪽 패딩 `--space-md`, 항목 간격 `--space-xs`
- `.example`: 배경 `--color-canvas-soft`, 모서리 `--radius-md`, 패딩 `--space-sm`, 예시 간 간격 `--space-sm`
- `.example__label`: `eyebrow`, `--color-ink-muted` / `.example__before`: `body-sm`, `--color-ink-muted`, `text-decoration: line-through` / `.example__after`: `body-sm`, `--color-ink`
- 적용 불가 예시의 버튼: 비활성 + 버튼 문구 `본문이 바뀌어 적용할 수 없어요`

### 6.8 떠 있는 요소

| 요소 | 배경 | 모서리 | 패딩 | 그림자 | 위치 |
|---|---|---|---|---|---|
| 다이얼로그 `.dialog` | `--color-surface` | `--radius-xl` | `--space-lg` | `--shadow-2` | 화면 가운데, 너비 `min(420px, calc(100vw - 32px))`, 배경막 `rgba(0,0,0,0.3)` (`::backdrop`), 테두리 없음 |
| 토스트 `.toast` | `--color-surface` | `--radius-xl` | `--space-sm --space-md` | `--shadow-2` | 화면 하단 가운데, 아래 여백 `--space-lg`, `z-index: var(--z-toast)` |
| 빈 상태 `.empty-state` | `--color-canvas-soft` | `--radius-xl` | `--space-xxl` | 없음 | 패널 안, 가운데 정렬. 제목 `body-md`+600, 설명 `caption` `--color-ink-muted` |
| 스켈레톤 `.skeleton__line` | `--color-hairline` | `--radius-xs` | — | — | 높이 12px, 간격 `--space-xs`, short는 너비 60% |

- 토스트 종류: `toast--success`는 왼쪽 8px 점 `--color-accent-green`, `toast--error`는 글자 `--color-danger`, `toast--info`는 점 없음. 3초 후 사라짐, 새 토스트가 오면 이전 것을 즉시 교체.
- 다이얼로그 `.dialog__actions`: 오른쪽 정렬, 버튼 간격 `--space-xs`, 위 여백 `--space-lg`.

### 6.9 기타

- `.dot`: 8px 원(`border-radius: 50%`), 라벨 글자 앞 간격 `--space-xs`, `dot--sky|orange|green|teal|purple` → 각 `--color-accent-*`
- `.star__summary`: `body-md`+600, 커서 pointer, 기본 삼각형 표시 유지 / `.star__help`: `caption`, `--color-ink-muted`
- `.counter`: `caption`, `--color-ink-muted`, 에디터 아래 오른쪽 정렬, 위 여백 `--space-xs`. 상태 글자는 §7.2
- `.notice--warning`: `caption`, 글자 `--color-warning`, 배경 없음
- `.ai-status`: `caption`, `--color-ink-muted`, 툴바 아래
- `.toolbar__row`: 가로 배치·줄바꿈 허용(`flex-wrap: wrap`), 간격 `--space-xs`, 행 간격 `--space-sm` / `.toolbar__label`: `caption`+600, `--color-ink-muted`
- `.skip-link`: 평소 화면 밖, 포커스 시 왼쪽 위에 표시
- `.spinner`: 14px 원, 2px 테두리 `currentColor`, 위쪽만 투명, 0.8초 회전
- 파비콘 `favicon.svg`: 32×32, 모서리 8px 사각형 `#0075de` 위에 흰색 "자" 글자 (`font-family: sans-serif; font-weight: 700`)
- 링크: `--color-primary`, 밑줄 없음, hover 시 밑줄

---

## 7. 상태별 화면 표현

### 7.1 AI 요청 중
1. 누른 버튼: 로딩 표시(§6.1) + 문구 변경(§8)
2. **모든 AI 버튼**(`generate`, `feedback`, `revise-*`, 예시 적용) 비활성 — 동시에 2개 요청 불가
3. 본문 에디터 `readonly` + 배경 `--color-canvas-soft`
4. `#ai-status`에 대기 안내 문구
5. 피드백 요청이면 `#feedback-loading` 표시, `#feedback-empty`·`#feedback-content` 숨김
6. 문항 전환·추가·삭제 버튼도 비활성 (요청 결과가 다른 문항에 들어가는 사고 방지)

### 7.2 글자수 카운터 색
기준값 = 문항의 "세는 기준"에 해당하는 글자수 / 제한

| 조건 | `#count-status` 문구 | 색 |
|---|---|---|
| 기준값 = 0 | (없음) | `--color-ink-muted` |
| 0 < 기준값 < 제한의 90% | (없음) | `--color-ink-muted` |
| 90% ≤ 기준값 ≤ 100% | `적정` | `--color-success` |
| 기준값 > 제한 | `{초과 글자수}자 초과` | `--color-danger` |

기준이 되는 쪽 글자수(`#count-with-spaces` 또는 `#count-without-spaces`)는 굵기 600으로 표시한다.

### 7.3 버튼 비활성 조건
| 버튼 | 비활성 조건 |
|---|---|
| `restore-btn` | 현재 문항의 `prevText`가 `null` |
| `delete-question-btn` | 문항이 1개뿐 |
| `add-question-btn` | 문항이 5개 |
| `copy-btn` | 본문이 비어 있음 |
| 그 외 AI 버튼 | AI 요청 중일 때만 (입력 부족은 클릭 후 검증 메시지로 안내) |

---

## 8. 문구 목록 (그대로 사용)

| 키 | 문구 |
|---|---|
| 저장 상태 | `저장됨` (저장 직후 표시, 2초 후 빈 문자열) |
| 생성 버튼 로딩 | `초안 작성 중…` |
| 피드백 버튼 로딩 | `피드백 분석 중…` |
| 다듬기 버튼 로딩 | `다듬는 중…` |
| AI 대기 안내 (`#ai-status`) | `AI가 작업하고 있어요. 최대 1분 정도 걸릴 수 있어요.` |
| 초안 생성 완료 토스트 | `초안을 만들었어요. 내용을 꼭 확인해 주세요.` |
| 피드백 완료 토스트 | `피드백을 받았어요.` |
| 다듬기 완료 토스트 | `본문을 다듬었어요. 마음에 들지 않으면 [직전 버전 복원]을 누르세요.` |
| 글자수 초과 경고 토스트(overLimit) | `글자수 제한을 넘었어요. [글자수 맞추기]를 눌러 보세요.` |
| 복원 완료 토스트 | `직전 버전으로 되돌렸어요.` |
| 예시 적용 토스트 | `수정 예시를 본문에 적용했어요.` |
| 복사 완료 토스트 | `본문을 복사했어요.` |
| 복사 실패 토스트 | `복사하지 못했어요. 본문을 직접 선택해 복사해 주세요.` |
| 내보내기 완료 토스트 | `TXT 파일을 저장했어요.` |
| 문항 5개 초과 시도 | `문항은 최대 5개까지 추가할 수 있어요.` |
| 초기화 완료 토스트 | `모든 내용을 지웠어요.` |
| 저장 데이터 손상 토스트 | `저장된 내용을 불러오지 못해 새로 시작해요.` |
| 저장 공간 부족 토스트 | `브라우저 저장 공간이 부족해 자동 저장하지 못했어요.` |
| 보완 필요 안내 (`#placeholder-notice`) | `본문에 [보완 필요] 표시가 {N}개 있어요. 실제 내용으로 바꿔 주세요.` |
| 피드백 최신 아님 배지 | `본문 수정됨` |
| 덮어쓰기 다이얼로그 | 제목 `초안으로 바꿀까요?` / 내용 `지금 본문은 [직전 버전 복원]으로 되돌릴 수 있어요.` / 확인 `바꾸기` |
| 문항 삭제 다이얼로그 | 제목 `이 문항을 삭제할까요?` / 내용 `문항 내용, 경험 메모, 본문이 모두 삭제되며 되돌릴 수 없어요.` / 확인 `삭제` (`.btn--danger`) |
| 전체 초기화 다이얼로그 | 제목 `모든 내용을 지울까요?` / 내용 `지원 정보와 모든 문항이 삭제되며 되돌릴 수 없어요.` / 확인 `전체 초기화` (`.btn--danger`) |
| 입력 에러 문구 | `docs/03-feature-spec.md` §2 표의 "에러 문구" 열 |
| API 에러 문구 | `docs/04-api-spec.md` §5 표의 "사용자 문구" 열 |

---

## 9. 접근성

- 모든 입력창은 `<label for>`로 연결 (§5.1 그대로)
- 에러 시 입력창에 `aria-invalid="true"`, `aria-describedby="{id}-error"` 추가, 해결되면 둘 다 제거
- 검증 실패 시 **첫 번째 에러 입력창에 포커스** 이동
- 키보드만으로 모든 기능 사용 가능 (Tab 순서 = 화면 순서, `tabindex` 양수 금지)
- `:focus-visible` 포커스 표시를 지우지 않는다 (`outline: none` 단독 사용 금지)
- 다이얼로그는 `<dialog>.showModal()` 사용 → Esc로 닫힘, 포커스 가둠 자동 처리. 닫힌 뒤 원래 버튼으로 포커스 복귀
- 문항 전환 후 `#editor-section`에 포커스 이동하지 않는다 (클릭한 문항 버튼에 포커스 유지)
- 장식 점(`.dot`)은 `aria-hidden="true"`
- `prefers-reduced-motion: reduce`일 때 스피너 회전·버튼 누름 축소·전환 효과 제거
- 글자 대비: 본문·버튼·에러 문구 4.5:1 이상 (§3 토큰은 기준 충족하도록 정함). `--color-ink-faint`는 placeholder·비활성 외 글자에 사용 금지

---

## 10. 금지 사항 ("AI가 만든 티" 배제 포함)

| 금지 | 이유 |
|---|---|
| 그라데이션 배경·글자 | 참고 디자인에 없음, AI 생성물 느낌 |
| 이모지, ✨·🤖 같은 아이콘, 아이콘 폰트·라이브러리 | 버튼은 글자로만 표현 |
| 장식 색(`--color-accent-*`)을 버튼·카드 배경·글자에 사용 | 참고 파일 Don't |
| 파란색 외 두 번째 강조색 | 참고 파일 Don't |
| 입력창에 알약 모양(`--radius-full`) | 참고 파일 Don't |
| 진한 그림자(`--shadow-1`, `--shadow-2` 외 그림자) | 참고 파일 Don't |
| 소개 띠 외 남색 배경 | 참고 파일: 어두운 띠는 1곳 |
| 페이지 전체를 순백(`#ffffff`) 바탕으로 | 바탕은 `--color-canvas-soft` |
| 유리 효과(`backdrop-filter`), 네온, 글자 그림자 | 과한 장식 |
| "마법처럼", "단 1초 만에" 같은 과장 문구 | §8 문구만 사용 |
| 일러스트·스톡 이미지 | 범위 외 |

---

## 11. 완료 기준

**M1 (뼈대)**
- [ ] §5.1 HTML 구조가 그대로 존재 (모든 id 존재)
- [ ] §3 토큰 파일이 그대로 존재, 다른 CSS 파일에 색상 코드 직접 사용 0건
  - 확인: `grep -nE "#[0-9a-fA-F]{3,8}\b" public/css/base.css public/css/layout.css public/css/components.css` → 0건
- [ ] 웹폰트 적용: 개발자 도구 Network 탭에서 `Paperlogy-4Regular.woff2` 로드 확인
- [ ] 1280px 너비에서 3단, 900px에서 2단, 375px에서 1단 배치

**M5 (마감)**
- [ ] §7 상태별 표현이 모두 동작
- [ ] §8 문구가 글자 하나까지 일치
- [ ] §9 접근성 항목 충족, Chrome Lighthouse 접근성 점수 90 이상
- [ ] 375px·768px·1280px·1920px에서 가로 스크롤 없음
- [ ] §10 금지 사항 위반 0건
