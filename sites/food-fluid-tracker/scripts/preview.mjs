import { createServer } from 'node:http';
import { readFile, realpath } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, sep, extname } from 'node:path';

const root = await realpath(fileURLToPath(new URL('../dist/', import.meta.url)));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };
createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end('Method not allowed'); return; }
  try {
    const path = decodeURIComponent((req.url ?? '/').split('?')[0]);
    if (path === '/__preview/mobile') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(req.method === 'HEAD' ? undefined : '<!doctype html><html lang="en"><meta charset="utf-8"><title>Mobile layout preview</title><style>body{margin:0;background:#343a40;color:#fff;font:14px system-ui;display:grid;justify-content:center;gap:12px;padding:16px}p{margin:0}iframe{width:390px;height:844px;border:0;border-radius:14px;background:#141719}</style><p>390 × 844 · local mobile layout check</p><iframe title="Tracker mobile viewport" src="/"></iframe></html>');
      return;
    }
    const candidate = resolve(root, `.${path === '/' ? '/index.html' : path}`);
    if (!candidate.startsWith(root + sep)) { res.writeHead(403); res.end('Forbidden'); return; }
    const target = await realpath(candidate);
    if (!target.startsWith(root + sep)) { res.writeHead(403); res.end('Forbidden'); return; }
    const body = await readFile(target);
    res.writeHead(200, { 'Content-Type': types[extname(target)] ?? 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch (error) {
    res.writeHead(error instanceof URIError ? 400 : 404);
    res.end(error instanceof URIError ? 'Bad request' : 'Not found');
  }
}).listen(8000, '127.0.0.1', () => process.stdout.write('Local: http://127.0.0.1:8000/\n'));
