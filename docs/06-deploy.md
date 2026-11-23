# 06. 배포 지침 (Vercel)

> 대상 마일스톤: **M6**
> 내 컴퓨터에서 만든 서비스를 인터넷 주소(`https://프로젝트이름.vercel.app`)로 공개하는 절차입니다.
> 비밀값(API 키)을 다루는 단계(§4)는 **사용자가 직접** 하고, 에이전트는 키를 요구하거나 입력하지 않습니다.

---

## 1. 배포 구조 (비전공자용)

```
GitHub 저장소 ──(코드 push 시 자동)──▶ Vercel
                                       ├─ public/ → 화면 파일 제공
                                       └─ api/*.js → 서버리스 함수 (요청 올 때만 실행)
                                                  └─ 환경 변수 OPENAI_API_KEY로 OpenAI 호출
```
- `dev-server.js`, `docs/`, `*.md`는 배포되어도 사용되지 않는다.
- 빌드 과정이 없다 (`package.json`에 `build` 스크립트 없음).

---

## 2. 배포 전 점검

- [ ] `docs/07-qa-checklist.md`의 M1~M5 항목 전부 통과
- [ ] `.gitignore`에 `.env` 포함, `git status`에 `.env` 없음
- [ ] `AGENTS.md` §9 금지 패턴 검사 0건
- [ ] `package.json`의 `engines.node`가 `>=24`

---

## 3. GitHub에 올리기

1. GitHub에서 새 저장소 생성 (이름 예: `jaso-workshop`, **Private** 권장, README 추가 안 함)
2. 프로젝트 폴더에서 터미널 실행:

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/{내 아이디}/jaso-workshop.git
git push -u origin main
```

3. GitHub 저장소 화면에서 `.env` 파일이 **없는지** 확인. 있으면 즉시 저장소를 삭제하고 OpenAI 대시보드에서 해당 키를 폐기(Revoke) 후 새로 발급.

---

## 4. Vercel 프로젝트 만들기 (사용자가 직접)

1. vercel.com 로그인 (GitHub 계정 연결)
2. **Add New → Project** → GitHub 저장소 `jaso-workshop` 선택 → **Import**
3. 설정 화면

| 항목 | 값 |
|---|---|
| Framework Preset | **Other** |
| Root Directory | `./` (기본값) |
| Build Command | 비워 둠 (Override 끔) |
| Output Directory | 비워 둠 (`vercel.json`의 `public` 사용) |
| Install Command | 기본값 (`npm install`) |

4. **Environment Variables**에 2개 추가 (Production, Preview 모두 체크)

| Key | Value |
|---|---|
| `OPENAI_API_KEY` | OpenAI에서 발급한 키 (`sk-`로 시작) |
| `OPENAI_MODEL` | `.env`와 같은 값 (예: `gpt-6-luna`) |

5. **Deploy** 클릭 → 1~2분 후 완료 화면의 주소 접속

---

## 5. 수정 후 다시 배포하기

| 상황 | 방법 |
|---|---|
| 코드를 고쳤을 때 | `git add . && git commit -m "변경 내용" && git push` → Vercel이 자동 배포 |
| 환경 변수를 바꿨을 때 | Vercel 프로젝트 → **Settings → Environment Variables** 수정 → **Deployments**에서 최신 배포의 `…` → **Redeploy** (환경 변수는 새 배포부터 적용) |
| 배포가 잘못됐을 때 | **Deployments**에서 이전 정상 배포의 `…` → **Promote to Production** (되돌리기) |

---

## 6. 비용 안전장치 (반드시 설정)

이 서비스에는 로그인·요청 횟수 제한이 없어서, 주소가 퍼지면 누구나 AI 버튼을 눌러 요금이 나갈 수 있다 (`PRD.md` §6.2).

1. OpenAI 대시보드 → **Settings → Limits**(또는 Billing의 사용 한도 메뉴)에서 **월 예산 한도** 설정 (예: 10달러)
2. 이 프로젝트 전용 API 키를 따로 발급해 사용 (문제 시 이 키만 폐기)
3. 배포 주소는 필요한 사람에게만 공유

---

## 7. 배포 후 문제 해결

로그 확인: Vercel 프로젝트 → **Logs** (또는 Deployments → 해당 배포 → Functions). 로그에는 에러 코드만 남는다 (`[api/generate] SERVER_CONFIG missing_env` 형태).

| 증상 | 로그/원인 | 해결 |
|---|---|---|
| 화면이 404 | `outputDirectory` 미설정 | `vercel.json` 확인 후 재배포 |
| 글꼴이 기본 글꼴로 보임 | jsDelivr 차단 또는 `fonts.css` 경로 오류 | Network 탭에서 woff2 요청 확인 |
| AI 버튼 → "서버 설정에 문제가 있어요" | `SERVER_CONFIG missing_env` | 환경 변수 2개 입력 후 Redeploy |
| 같은 문구 + `openai_401` | API 키 오류·폐기됨 | 새 키 입력 후 Redeploy |
| 같은 문구 + `openai_404` | 모델 ID 오류 | `OPENAI_MODEL`을 모델 목록의 ID로 수정 후 Redeploy |
| 같은 문구 + `insufficient_quota` | OpenAI 크레딧 소진·한도 도달 | OpenAI 결제·한도 확인 |
| "AI 응답이 늦어지고 있어요" 반복 | 모델 응답 지연 | 잠시 후 재시도, 지속되면 더 빠른 모델로 `OPENAI_MODEL` 변경 (사용자 결정) |
| `Cannot find module 'openai'` | `package.json`에 `openai` 없음 | 로컬에서 `npm install openai` 후 push |

---

## 8. 완료 기준 (M6)

- [ ] 배포 주소 접속 시 로컬과 같은 화면 (글꼴 포함)
- [ ] `docs/07-qa-checklist.md` §5 배포 후 점검 전부 통과
- [ ] GitHub 저장소에 `.env` 없음
- [ ] OpenAI 월 사용 한도 설정 완료 (사용자 확인)
