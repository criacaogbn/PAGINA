// Servidor HTTP estático simples para servir E:\gbn3d\site2
// Uso: node server.js   ->  http://localhost:8000/   (abre o index.html gerado)
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = process.env.PORT || 8000;
const HOST = '127.0.0.1';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);

  // Raiz abre a página principal
  if (urlPath === '/' || urlPath === '') urlPath = '/index.html';

  const filePath = path.normalize(path.join(ROOT, urlPath));

  // Proteção contra directory traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('403 - Acesso negado');
  }

  fs.stat(filePath, (err, stat) => {
    let target = filePath;
    if (!err && stat.isDirectory()) target = path.join(target, 'index.html');

    fs.readFile(target, (readErr, data) => {
      if (readErr) {
        const safeMsg = String(urlPath).replace(/[&<>"']/g, function (c) {
          return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'X-Content-Type-Options': 'nosniff' });
        return res.end('<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>404</title>' +
          '<body style="margin:0;height:100vh;display:grid;place-items:center;background:#0d0f14;color:#e8eaf2;font-family:system-ui">' +
          '<div style="text-align:center"><h1 style="font-size:3rem;margin:0">404</h1>' +
          '<p style="color:#9aa3b8">P&aacute;gina n&atilde;o encontrada: ' + safeMsg + '</p>' +
          '<p><a href="/" style="color:#f5a524">&larr; Voltar ao in&iacute;cio</a></p></div>');
      }
      const ext = path.extname(target).toLowerCase();
      const isAsset = /\.(jpe?g|png|gif|webp|svg|ico|woff2?)$/.test(ext);
      res.writeHead(200, {
        'Content-Type': MIME[ext] || 'text/plain; charset=utf-8',
        'Cache-Control': isAsset ? 'public, max-age=3600' : 'no-cache',
        'X-Content-Type-Options': 'nosniff'
      });
      res.end(data);
    });
  });
}).listen(PORT, HOST, () => {
  console.log(`Servidor rodando: http://localhost:${PORT}/`);
  console.log(`Raiz servida: ${ROOT}`);
  console.log('Feche esta janela (ou Ctrl+C) para encerrar o servidor.');
});
