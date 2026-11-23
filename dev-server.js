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
