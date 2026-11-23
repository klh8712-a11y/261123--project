# 01. 프로젝트 생성 지침

> 대상 마일스톤: **M1**
> 이 문서대로 만들면 `npm run dev` 한 줄로 내 컴퓨터에서 서비스를 실행할 수 있습니다.

---

## 1. 이 문서의 목적

- 폴더 구조와 설정 파일을 **정확히 이 형태로** 만든다.
- 로컬(내 컴퓨터)에서도 Vercel과 **같은 방식**으로 API가 동작하게 한다.
- 이 문서에 없는 파일·폴더·패키지를 추가하지 않는다 (`AGENTS.md` M-9, N-1).

---

## 2. 사전 준비물

| 준비물 | 버전/조건 | 쉬운 설명 | 확인 명령 |
|---|---|---|---|
| Node.js | **24 이상** (LTS) | 자바스크립트를 내 컴퓨터에서 실행하는 프로그램 | `node -v` → `v24.x.x` 이상 |
| npm | Node.js와 함께 설치됨 | 패키지(남이 만든 코드)를 설치하는 도구 | `npm -v` |
| OpenAI API 키 | platform.openai.com에서 발급 | AI를 쓰기 위한 비밀 열쇠 | — |
| Git | 최신 | 코드 변경 기록·업로드 도구 (배포 시 필요) | `git --version` |
| Vercel 계정 | GitHub 로그인 권장 | 배포 서비스 (M6에서 사용) | — |

> Node.js 24 이상이 필요한 이유: `.env` 파일을 별도 패키지 없이 읽는 `--env-file-if-exists` 옵션을 쓰기 때문.

---

## 3. 폴더 구조

```
jaso-workshop/
├─ AGENTS.md                 # 에이전트 작업 규칙
├─ PRD.md                    # 제품 요구사항
├─ docs/                     # 세부 구현 문서 (01~07)
├─ public/                   # 브라우저로 그대로 전달되는 파일 (프론트엔드)
│  ├─ index.html             # 유일한 HTML 페이지
│  ├─ favicon.svg            # 탭 아이콘 (단색 사각형 + "자" 글자, 02 문서 §6.9)
│  ├─ css/
│  │  ├─ fonts.css           # Paperozi 웹폰트 선언 (02 문서 §2.1 그대로)
│  │  ├─ tokens.css          # 디자인 토큰 (CSS 변수)
│  │  ├─ base.css            # 기본 스타일 (body, 링크, 포커스 등)
│  │  ├─ layout.css          # 헤더·3단 레이아웃·반응형
│  │  └─ components.css      # 버튼, 입력창, 카드, 다이얼로그, 토스트 등
│  └─ js/
│     ├─ main.js             # 시작점: 초기화, 이벤트 연결
│     ├─ constants.js        # 제한값·문구 키 등 상수
│     ├─ state.js            # 앱 상태와 상태 변경 함수
│     ├─ storage.js          # localStorage 저장/불러오기
│     ├─ counter.js          # 글자수 계산
│     ├─ validate.js         # 브라우저 입력 검증
│     ├─ api.js              # 서버 API 호출 (타임아웃·에러 정리)
│     ├─ render.js           # 상태 → 화면 반영
│     ├─ ui.js               # 토스트, 다이얼로그, 로딩 표시
│     └─ export.js           # 복사, TXT 내보내기
├─ api/                      # Vercel 서버리스 함수 (파일 1개 = 주소 1개)
│  ├─ generate.js            # POST /api/generate  초안 생성
│  ├─ feedback.js            # POST /api/feedback  피드백
│  └─ revise.js              # POST /api/revise    다듬기
├─ lib/                      # 서버 공통 코드 (주소로 노출되지 않음)
│  ├─ constants.js           # 서버 제한값 (public/js/constants.js와 같은 값)
│  ├─ http.js                # 응답 헬퍼, 메서드 검사, 에러 응답
│  ├─ validate.js            # 서버 입력 검증
│  ├─ count.js               # 글자수 계산 (public/js/counter.js와 같은 로직)
│  ├─ openai-client.js       # OpenAI 호출 함수, 출력 정리, 에러 변환
│  ├─ prompts.js             # 프롬프트 생성 함수, 피드백 JSON 스키마
│  └─ draft-service.js       # 초안·다듬기 공통 흐름 (글자수 검사, 1회 자동 축약)
├─ dev-server.js             # 로컬 개발용 서버 (Vercel에는 배포되지만 사용되지 않음)
├─ package.json
├─ package-lock.json         # npm install 시 자동 생성
├─ vercel.json
├─ .env.example              # 환경 변수 예시 (커밋 O)
├─ .env                      # 실제 비밀값 (커밋 X, 직접 생성)
└─ .gitignore
```

**왜 `public/js/constants.js`와 `lib/constants.js`가 따로 있나요?**
브라우저는 `public/` 밖의 파일을 읽을 수 없어서, 같은 제한값을 양쪽에 둡니다. 두 파일 맨 위에 `// docs/03 §2 입력값 제한표와 동일하게 유지` 주석을 적고, 값이 다르면 안 됩니다 (docs/07 TC-S05에서 확인).

---

## 4. 생성 순서

1. 폴더 생성: `jaso-workshop` 및 §3의 하위 폴더
2. `package.json` 작성 (§5) → 터미널에서 `npm install openai`
3. `vercel.json`, `.gitignore`, `.env.example` 작성 (§6~8)
4. `.env.example`을 복사해 `.env`를 만들고 실제 키 입력 (사용자가 직접)
5. `dev-server.js` 작성 (§9)
6. `public/` 정적 파일 작성 (docs/02 기준)
7. `npm run dev` 실행 후 확인 (§10)

---

## 5. package.json

```json
{
  "name": "jaso-workshop",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "node --env-file-if-exists=.env dev-server.js"
  },
  "engines": {
    "node": ">=24"
  }
}
```

- `dependencies`는 **직접 쓰지 않는다.** `npm install openai` 명령을 실행하면 설치 시점의 최신 버전이 자동으로 기록된다.
- `"type": "module"`: `import/export` 문법을 쓰겠다는 선언.
- `build` 스크립트는 만들지 않는다 (빌드 과정 없는 프로젝트).

---

## 6. vercel.json

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "outputDirectory": "public",
  "functions": {
    "api/*.js": {
      "maxDuration": 60
    }
  }
}
```

- `outputDirectory`: 화면 파일이 `public` 폴더에 있다고 Vercel에 알려줌
- `maxDuration`: 서버 함수 1회 최대 실행 시간 60초 (AI 응답 대기용)

---

## 7. .env.example

```
# OpenAI 대시보드(platform.openai.com > API keys)에서 발급한 키
# 절대 다른 사람에게 보여주거나 GitHub에 올리지 마세요.
OPENAI_API_KEY=

# 사용할 모델 ID (docs/05-ai-prompt.md §1 참고)
OPENAI_MODEL=gpt-6-luna
```

`.env`는 이 파일을 복사해서 만들고 `OPENAI_API_KEY=` 뒤에 실제 키를 붙여 넣는다.

---

## 8. .gitignore

```
node_modules/
.env
.env.*
!.env.example
.vercel/
.DS_Store
Thumbs.db
```

---

## 9. dev-server.js (전체 코드 — 그대로 사용)

로컬에서 `public/` 파일을 보여주고, `/api/...` 요청은 `api/` 폴더의 함수로 연결한다.
Vercel이 제공하는 `req.body`, `res.status()`, `res.json()`을 똑같이 흉내 내서, **API 코드를 로컬과 배포 환경에서 수정 없이** 쓰게 한다.

```js
// 로컬 개발 전용 서버. Vercel 배포 환경에서는 사용되지 않는다.
// Vercel의 Node.js 함수 헬퍼(req.body, res.status, res.json)를 흉내 낸다.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import generate from './api/generate.js';
import feedback from './api/feedback.js';
import revise from './api/revise.js';

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = join(process.cwd(), 'public');
const ROUTES = {
  '/api/generate': generate,
  '/api/feedback': feedback,
  '/api/revise': revise,
};
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

function addResponseHelpers(res) {
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(data));
    return res;
  };
}

// JSON 본문을 읽는다. 해석에 실패하면 null을 넣어 핸들러가 INVALID_JSON으로 응답하게 한다.
async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function serveStatic(pathname, res) {
  const relativePath = pathname === '/' ? '/index.html' : pathname;
  const filePath = normalize(join(PUBLIC_DIR, decodeURIComponent(relativePath)));
  // public 폴더 밖의 파일을 읽지 못하게 막는다.
  if (!filePath.startsWith(PUBLIC_DIR + sep)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }
  try {
    const data = await readFile(filePath);
    res.setHeader('Content-Type', MIME_TYPES[extname(filePath)] || 'application/octet-stream');
    res.end(data);
  } catch {
    res.statusCode = 404;
    res.end('Not Found');
  }
}

const server = http.createServer(async (req, res) => {
  addResponseHelpers(res);
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);

  if (pathname.startsWith('/api/')) {
    const handler = ROUTES[pathname];
    if (!handler) {
      res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: '요청한 주소를 찾을 수 없어요.' } });
      return;
    }
    req.body = await readJsonBody(req);
    try {
      await handler(req, res);
    } catch (error) {
      console.error('[dev-server] handler error:', error?.name);
      if (!res.headersSent) {
        res.status(500).json({ ok: false, error: { code: 'INTERNAL_ERROR', message: '일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요.' } });
      }
    }
    return;
  }

  await serveStatic(pathname, res);
});

server.listen(PORT, () => {
  console.log(`로컬 서버 실행 중: http://localhost:${PORT}`);
  if (!process.env.OPENAI_API_KEY) {
    console.warn('주의: OPENAI_API_KEY가 없어요. .env 파일을 확인하세요. (AI 기능만 동작하지 않음)');
  }
});
```

**M1 단계 주의:** M1에서는 `api/*.js`가 아직 없으므로, 각 파일에 아래 임시 코드를 넣어 서버가 실행되게 한다. M3·M4에서 실제 코드로 교체한다.

```js
// 임시 코드 (M3/M4에서 교체)
export default async function handler(req, res) {
  res.status(501).json({ ok: false, error: { code: 'NOT_IMPLEMENTED', message: '아직 준비 중인 기능이에요.' } });
}
```

---

## 10. 실행 방법

```bash
# 1) 패키지 설치 (처음 한 번)
npm install

# 2) 환경 변수 파일 만들기 (처음 한 번)
#    macOS/Linux
cp .env.example .env
#    Windows PowerShell
Copy-Item .env.example .env
#    → .env 파일을 열어 OPENAI_API_KEY= 뒤에 키 입력

# 3) 실행
npm run dev

# 4) 브라우저에서 접속
#    http://localhost:3000
```

종료: 터미널에서 `Ctrl + C`

---

## 11. 자주 나는 문제

| 증상 | 원인 | 해결 |
|---|---|---|
| `bad option: --env-file-if-exists` | Node.js 버전이 낮음 | Node.js 24 이상 설치 |
| `EADDRINUSE: address already in use :::3000` | 3000번 포트를 다른 프로그램이 사용 중 | 다른 터미널의 서버 종료, 또는 `PORT=3001 npm run dev` |
| 화면은 뜨는데 AI 버튼 누르면 "서버 설정에 문제가 있어요" | `.env`에 키가 없음 | `.env` 확인 후 서버 재시작 |
| `Cannot use import statement outside a module` | `package.json`에 `"type": "module"` 누락 | §5대로 수정 |
| CSS·JS가 적용 안 됨 (404) | 경로가 `/css/...`, `/js/...`로 시작하지 않음 | HTML에서 절대경로 사용 |

---

## 12. 완료 기준 (M1)

- [ ] §3 폴더 구조와 실제 폴더가 일치 (`docs/` 제외 파일 추가 없음)
- [ ] `npm install` 후 `package.json`의 `dependencies`에 `openai`만 존재
- [ ] `npm run dev` 실행 시 "로컬 서버 실행 중" 메시지 출력
- [ ] `http://localhost:3000` 접속 시 docs/02 §4의 레이아웃 뼈대 표시 (기능 동작은 M2 이후)
- [ ] `http://localhost:3000/api/generate`에 POST 요청 시 JSON 응답 (임시 501 응답 가능)
- [ ] `curl --path-as-is http://localhost:3000/../package.json` 실행 시 파일 내용이 아닌 `Forbidden` 또는 `Not Found` 응답 (public 밖 파일 차단)
- [ ] `.env`가 `.gitignore`에 포함됨 (`git status`에 `.env`가 나타나지 않음)
