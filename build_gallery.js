// ============================================================
// build_gallery.js — Gera/atualiza o galeria.html (acervo completo) do GBN 3D
// Uso:  node build_gallery.js
// Relê a pasta "imagens" e recria o acervo completo,
// categorizando e titulando automaticamente cada imagem.
// ============================================================
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const IMG_DIR = path.join(ROOT, 'imagens');
const OUT_FILE = path.join(ROOT, 'galeria.html');

// ---------- Metadados ----------
const CATS = {
  personagens: 'Personagens & Criaturas',
  cenas: 'Cenas & Ambientes',
  objetos: 'Produtos & Objetos',
  escultura: 'Escultura Digital',
  renders: 'Renders & Estudos'
};
const CHIP = {
  personagens: 'Personagem',
  cenas: 'Cena',
  objetos: 'Produto',
  escultura: 'ZBrush',
  renders: 'Render'
};

// Remove extensão, número de frame (".268") e marcador ".bip"
function cleanBase(file) {
  return file
    .replace(/\.(jpe?g|png|webp)$/i, '')
    .replace(/\.\d{2,3}$/, '')
    .replace(/\.bip$/i, '');
}

// Títulos amigáveis por família de arquivo
const TITLE_RULES = [
  [/img_hermes/i,         'Hermes — escultura clássica'],
  [/img_fenix/i,          'Fênix — criatura fantástica'],
  [/pux_sabia/i,          'Sabiá — ave esculpida em 3D'],
  [/^dogimg/i,            'Cão — modelo 3D'],
  [/guerreira/i,          'Guerreira — personagem'],
  [/escultura_gabriela/i, 'Escultura Gabriela'],
  [/garrafacranio/i,      'Garrafa Crânio — design de produto'],
  [/^vazoimg/i,           'Vaso — design de produto'],
  [/^cena_chav/i,         'Cena — ambientação 3D'],
  [/cena_velariseira/i,   'Cena — ambientação 3D'],
  [/^ks_img/i,            'Render KeyShot — produto'],
  [/^print\d*/i,          'Registro de processo'],
  [/^psimg/i,             'Pós-produção de imagem'],
  [/ZBrush/i,             'Escultura digital em ZBrush'],
  [/^(zb|z0)/i,           'Escultura digital em ZBrush'],
  [/^img\d/i,             'Render — série de estudos'],
  [/trabalhos_.*ACD/i,    'Compilação de trabalhos'],
  [/^[0-9a-f]{8}-[0-9a-f]{4}/i, 'Trabalho 3D']
];

function titleFor(base) {
  for (let i = 0; i < TITLE_RULES.length; i++) {
    if (TITLE_RULES[i][0].test(base)) return TITLE_RULES[i][1];
  }
  // Séries numéricas: "01", "05a", "01 (2)", "088", "22"...
  const m = base.match(/^(\d+[a-z]*)(?:\s*\((\d+)\))?$/i);
  if (m) {
    return 'Estudo 3D — ' + m[1] + (m[2] ? ' — variante ' + m[2] : '');
  }
  const pretty = base.replace(/[_\-]+/g, ' ').trim();
  return pretty.charAt(0).toUpperCase() + pretty.slice(1);
}

function catFor(base) {
  if (/^cena_|velariseira/i.test(base)) return 'cenas';
  if (/garrafacranio|^vazoimg|^ks_img/i.test(base)) return 'objetos';
  if (/hermes|fenix|pux_sabia|^dogimg|guerreira|gabriela/i.test(base)) return 'personagens';
  if (/ZBrush|^(zb|z0)/i.test(base)) return 'escultura';
  return 'renders';
}

// ---------- Montagem dos itens ----------
const files = fs.readdirSync(IMG_DIR)
  .filter(function (f) { return /\.(jpe?g|png|webp)$/i.test(f); })
  .sort(function (a, b) { return a.localeCompare(b, 'pt-BR'); });

if (!files.length) {
  console.error('Nenhuma imagem encontrada em: ' + IMG_DIR);
  process.exit(1);
}

const items = files.map(function (f) {
  const base = cleanBase(f);
  return { f: f, t: titleFor(base), c: catFor(base) };
});

const esc = function (s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};
const imgUrl = function (f) { return 'imagens/' + encodeURIComponent(f); };

const figures = items.map(function (it, i) {
  return '          <figure class="card" data-cat="' + it.c + '">\n' +
    '            <button class="thumb" type="button" data-i="' + i + '" aria-label="Ampliar: ' + esc(it.t) + '">\n' +
    '              <img src="' + imgUrl(it.f) + '" alt="' + esc(it.t) + '" loading="lazy" decoding="async">\n' +
    '              <span class="zoom" aria-hidden="true">+</span>\n' +
    '            </button>\n' +
    '            <figcaption><span class="chip">' + CHIP[it.c] + '</span>' + esc(it.t) + '</figcaption>\n' +
    '          </figure>';
}).join('\n');

const filterKeys = ['todos', 'personagens', 'cenas', 'objetos', 'escultura', 'renders'];
const filterButtons = filterKeys.map(function (k) {
  return '          <button class="filter' + (k === 'todos' ? ' active' : '') +
    '" type="button" data-filter="' + k + '">' +
    (k === 'todos' ? 'Todos' : CATS[k]) + '</button>';
}).join('\n');

const PAGE_HEAD = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
<title>GBN 3D — Modelagem, Escultura Digital e Rendering</title>
<meta name="description" content="Portfólio de modelagem 3D, escultura digital (ZBrush), texturização e rendering — personagens, criaturas, cenários e produtos.">
<meta property="og:type" content="website">
<meta property="og:title" content="GBN 3D — Portfólio 3D">
<meta property="og:description" content="Modelagem 3D, escultura digital e rendering: personagens, criaturas, cenários e produtos.">
<meta property="og:image" content="imagens/${encodeURIComponent(items[0].f)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="icon" type="image/png" href="logo/logocircularpng2.png">
<title>GBN 3D — Acervo Completo de Trabalhos</title>
<style>
:root{--bg:#0d0d0d;--panel:#111111;--line:#1a1a1a;--tx:#ffffff;--mut:#a0a0a0;--acc:#ffffff;--acc2:#ffffff}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
html{background-color:#0d0d0d}
body{background:var(--bg);color:var(--tx);font:16px/1.5 'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,sans-serif}
.luz-canvas{position:fixed;inset:0;z-index:-1;pointer-events:none;opacity:.9}
body.no-scroll{overflow:hidden}
img{max-width:100%}
.wrap{max-width:1100px;margin:0 auto;padding:0 20px}
header{display:flex;justify-content:space-between;align-items:center;padding:1.5rem 0;border-bottom:1px solid var(--line)}
.brand-container{display:flex;align-items:center;gap:15px}
.brand-logo{width:70px;height:70px;object-fit:contain;background:#000;padding:4px;border-radius:4px}
.brand-name{font-size:1.6rem;font-weight:800;letter-spacing:2px;color:#fff;text-transform:uppercase}
.nav{display:flex;align-items:center;gap:14px;padding:10px 0}
.nav img{width:42px;height:42px;border-radius:50%;border:1px solid var(--line)}
.brand{font-weight:700;font-size:1.1rem;letter-spacing:.5px}
.brand span{color:var(--acc)}
nav.links{margin-left:auto;display:flex;gap:18px;flex-wrap:wrap}
nav.links a{color:var(--mut);text-decoration:none;font-size:.95rem}
nav.links a:hover{color:var(--tx)}
#hero{padding:88px 0 68px;text-align:center;background:radial-gradient(60% 80% at 50% 0%,#1b2136 0%,var(--bg) 72%)}
#hero h1{font-size:clamp(2rem,6vw,3.4rem);line-height:1.15}
#hero h1 span{color:var(--acc)}
#hero p{max-width:640px;margin:16px auto 28px;color:var(--mut);font-size:1.08rem}
.cta{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.btn{display:inline-block;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:600;border:1px solid transparent;cursor:pointer;font-size:.98rem}
.btn.primary{background:var(--acc);color:#14161c}
.btn.primary:hover{background:var(--acc2)}
.btn.ghost{border-color:var(--line);color:var(--tx)}
.btn.ghost:hover{border-color:var(--acc)}
section{padding:64px 0;border-top:1px solid var(--line)}
section:first-of-type{border-top:0}
h2{font-size:1.6rem;margin-bottom:6px}
.sub{color:var(--mut);margin-bottom:26px}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px}
.svc{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:18px}
.svc .ico{display:inline-flex;align-items:center;justify-content:center;color:var(--tx)}
.svc h3{margin:8px 0 4px;font-size:1.02rem}
.svc p{color:var(--mut);font-size:.92rem}
.filters{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px}
.filter{background:var(--panel);border:1px solid var(--line);color:var(--mut);padding:8px 14px;border-radius:999px;cursor:pointer;font-size:.9rem}
.filter:hover{color:var(--tx);border-color:var(--acc)}
.filter.active{background:var(--acc);border-color:var(--acc);color:#14161c;font-weight:700}
#count{color:var(--mut);font-size:.9rem;margin-bottom:14px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:14px;overflow:hidden;transition:transform .18s,border-color .18s}
.card:hover{transform:translateY(-3px);border-color:var(--acc)}
.card.hide{display:none}
.thumb{display:block;width:100%;aspect-ratio:4/3;border:0;background:#0a0c10;cursor:zoom-in;position:relative;padding:0}
.thumb img{width:100%;height:100%;object-fit:cover;display:block;filter:grayscale(100%) contrast(110%) brightness(95%);transition:filter .3s ease,transform .25s}
.card:hover .thumb img,.card:focus-within .thumb img{transform:scale(1.04);filter:grayscale(0%) contrast(100%) brightness(100%)}
.zoom{position:absolute;right:10px;top:10px;background:rgba(0,0,0,.55);color:#fff;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;font-weight:700;opacity:0;transition:opacity .18s}
.card:hover .zoom,.thumb:focus-visible .zoom{opacity:1}
.card figcaption{display:flex;align-items:center;gap:8px;padding:10px 12px;font-size:.86rem;color:var(--mut)}
.chip{background:#232939;color:var(--acc2);font-size:.68rem;font-weight:700;letter-spacing:.5px;text-transform:uppercase;padding:2px 8px;border-radius:999px;white-space:nowrap}
.about p{color:var(--mut);max-width:780px}
.contact{display:flex;gap:12px;flex-wrap:wrap;margin-top:6px}
.note{margin-top:14px;font-size:.85rem}
footer{border-top:1px solid var(--line);padding:26px 0;color:var(--mut);font-size:.9rem;text-align:center}
#lb{position:fixed;inset:0;z-index:100;display:none;align-items:center;justify-content:center;background:rgba(5,6,9,.93)}
#lb.open{display:flex}
#lbImg{max-width:min(92vw,1200px);max-height:76vh;border-radius:10px;box-shadow:0 12px 60px rgba(0,0,0,.65)}
#lb .bar{position:absolute;left:0;right:0;bottom:18px;display:flex;justify-content:center;align-items:center;gap:16px;color:var(--mut);font-size:.95rem}
#lb button{background:var(--panel);border:1px solid var(--line);color:var(--tx);width:44px;height:44px;border-radius:50%;font-size:1.15rem;cursor:pointer;line-height:1}
#lb button:hover{border-color:var(--acc)}
#lbClose{position:absolute;top:16px;right:16px}
#lbCap{position:absolute;top:24px;left:18px;right:74px;font-weight:600;text-shadow:0 1px 4px #000}
:focus-visible{outline:2px solid var(--acc);outline-offset:2px}
@media (prefers-reduced-motion:reduce){*{transition:none!important}html{scroll-behavior:auto}}
</style>
</head>
<body>
<canvas id="luzCosmica" class="luz-canvas" aria-hidden="true"></canvas>
<header>
  <div class="brand-container">
    <img src="logo/logocircularpng2.png" class="brand-logo" alt="GBN3D Logo" onerror="this.style.display='none'">
    <div class="brand-name">GBN3D</div>
  </div>
  <nav>
    <a href="index.html">Início</a>
    <a href="galeria.html" class="active">Galeria</a>
    <a href="index.html#sobre">Sobre</a>
    <a href="index.html#contato">Contato</a>
  </nav>
</header>

<section id="hero">
  <div class="wrap">
    <h1>Dê forma às suas ideias em <span>3D</span></h1>
    <p>Modelagem, escultura digital e rendering de personagens, criaturas, cenários e produtos — do conceito à imagem final.</p>
    <div class="cta">
      <a class="btn primary" href="#galeria">Ver galeria</a>
      <a class="btn ghost" href="#contato">Falar comigo</a>
    </div>
  </div>
</section>

<section id="servicos">
  <div class="wrap">
    <h2>Serviços</h2>
    <p class="sub">O que eu posso produzir para o seu projeto</p>
    <div class="cards">
      <div class="svc"><div class="ico"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.27 6.96 12 12.01l8.73-5.05"/><path d="M12 22.08V12"/></svg></div><h3>Modelagem 3D</h3><p>Modelos poligonais limpos e otimizados para render, animação ou jogos.</p></div>
      <div class="svc"><div class="ico"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="7" r="4"/><path d="M19 20v-1.5a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4V20"/><path d="M4 20h16"/></svg></div><h3>Escultura Digital</h3><p>Esculturas de alta resolução em ZBrush: personagens, criaturas e orgânicos.</p></div>
      <div class="svc"><div class="ico"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/><circle cx="13.5" cy="6.5" r=".75" fill="currentColor" stroke="none"/><circle cx="17.5" cy="10.5" r=".75" fill="currentColor" stroke="none"/><circle cx="8.5" cy="7.5" r=".75" fill="currentColor" stroke="none"/><circle cx="6.5" cy="12.5" r=".75" fill="currentColor" stroke="none"/></svg></div><h3>Texturização</h3><p>Materiais PBR, pintura procedural e mapas de alta qualidade.</p></div>
      <div class="svc"><div class="ico"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg></div><h3>Iluminação &amp; Render</h3><p>Iluminação, câmera e composição para imagens finais de impacto.</p></div>
      <div class="svc"><div class="ico"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg></div><h3>Impressão 3D</h3><p>Preparação de malhas para impressão: espessura, corte e suportes.</p></div>
      <div class="svc"><div class="ico"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></div><h3>Correção de Malhas</h3><p>Retopologia, otimização e conserto de modelos para produção.</p></div>
    </div>
  </div>
</section>
`;
const PAGE_FOOT = `
<section id="galeria">
  <div class="wrap">
    <h2>Galeria</h2>
    <p class="sub">__COUNT__ trabalhos — clique em uma imagem para ampliar</p>
    <div class="filters" role="group" aria-label="Filtrar galeria por categoria">
__FILTERS__
    </div>
    <p id="count" aria-live="polite"></p>
    <div class="grid" id="grid">
__FIGURES__
    </div>
  </div>
</section>

<section id="sobre">
  <div class="wrap about">
    <h2>Sobre</h2>
    <p>Artista 3D focado em modelagem e escultura digital. Trabalho do conceito à entrega: esculpo personagens e criaturas em alta resolução, modelo produtos e cenários, texturizo com materiais PBR e entrego renders finais prontos para uso. Use os filtros da galeria para navegar por categoria.</p>
  </div>
</section>

<section id="contato">
  <div class="wrap">
    <h2>Contato</h2>
    <p class="sub">Vamos conversar sobre o seu projeto</p>
    <div class="contact">
      <a class="btn primary" href="https://wa.me/5519971043891" target="_blank" rel="noopener">WhatsApp — (19) 9 7104-3891</a>
      <a class="btn ghost" href="mailto:criacaogbn@gmail.com">criacaogbn@gmail.com</a>
    </div>
  </div>
</section>

<footer>
  <div class="wrap">© 2026 GBN 3D — Todos os direitos reservados.</div>
</footer>

<div id="lb" role="dialog" aria-modal="true" aria-label="Visualizador de imagens">
  <button id="lbClose" type="button" aria-label="Fechar (tecla Esc)">✕</button>
  <div id="lbCap"></div>
  <img id="lbImg" alt="">
  <div class="bar">
    <button id="lbPrev" type="button" aria-label="Imagem anterior (seta à esquerda)">‹</button>
    <span id="lbCnt"></span>
    <button id="lbNext" type="button" aria-label="Próxima imagem (seta à direita)">›</button>
  </div>
</div>

<script>
var G = "__DATA__";
(function () {
  'use strict';
  var grid = document.getElementById('grid');
  if (!grid || !G.length) return;
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.card'));
  var lb = document.getElementById('lb');
  var lbImg = document.getElementById('lbImg');
  var lbCap = document.getElementById('lbCap');
  var lbCnt = document.getElementById('lbCnt');
  var countEl = document.getElementById('count');
  var vis = [];
  var cur = 0;
  var lastFocus = null;

  function posInVis(i) {
    for (var k = 0; k < vis.length; k++) { if (vis[k] === i) return k; }
    return -1;
  }
  function updateLb() {
    var it = G[cur];
    var card = cards[cur];
    var thumb = card ? card.querySelector('img') : null;
    lbImg.src = thumb ? thumb.src : '';
    lbImg.alt = it.t;
    lbCap.textContent = it.t;
    lbCnt.textContent = (posInVis(cur) + 1) + ' / ' + vis.length;
  }
  function openLb(i) {
    cur = i;
    lastFocus = document.activeElement;
    updateLb();
    lb.classList.add('open');
    document.body.classList.add('no-scroll');
    document.getElementById('lbClose').focus();
  }
  function closeLb() {
    lb.classList.remove('open');
    lbImg.src = '';
    document.body.classList.remove('no-scroll');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function step(d) {
    if (!vis.length) return;
    var p = posInVis(cur);
    p = (p + d + vis.length) % vis.length;
    cur = vis[p];
    updateLb();
  }

  grid.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.thumb') : null;
    if (b) openLb(parseInt(b.getAttribute('data-i'), 10));
  });
  document.getElementById('lbClose').addEventListener('click', closeLb);
  document.getElementById('lbPrev').addEventListener('click', function () { step(-1); });
  document.getElementById('lbNext').addEventListener('click', function () { step(1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
  });

  var btns = Array.prototype.slice.call(document.querySelectorAll('.filter'));
  function applyFilter(f) {
    vis = [];
    cards.forEach(function (c, i) {
      var show = (f === 'todos') || (c.getAttribute('data-cat') === f);
      c.classList.toggle('hide', !show);
      if (show) vis.push(i);
    });
    countEl.textContent = vis.length + (vis.length === 1 ? ' trabalho exibido' : ' trabalhos exibidos');
  }
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      btns.forEach(function (x) { x.classList.remove('active'); });
      b.classList.add('active');
      applyFilter(b.getAttribute('data-filter'));
    });
  });
  applyFilter('todos');
})();
</script>
<script>
    // ===== Constelação Luminosa — luz volumétrica em canvas (atrás do conteúdo) =====
    (function () {
      const canvas = document.getElementById('luzCosmica');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      let W = 0, H = 0, DPR = 1;
      let particles = [];
      let pulses = [];
      let pulsesEnabled = true;
      let running = false;
      let lastT = 0;
      let slowFrames = 0;
      const LINK_DIST = 150;
      const CURSOR_DIST = 190;
      const MAX_PULSES = 7;
      const mouse = { x: -9999, y: -9999, active: false };

      // Sprite de luz pré-renderizado: núcleo quente + halo com queda gaussiana
      const SPR = 64;
      const sprite = document.createElement('canvas');
      sprite.width = sprite.height = SPR;
      (function () {
        const s = sprite.getContext('2d');
        const g = s.createRadialGradient(SPR / 2, SPR / 2, 0, SPR / 2, SPR / 2, SPR / 2);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(0.22, 'rgba(255,255,255,0.6)');
        g.addColorStop(0.55, 'rgba(255,255,255,0.14)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        s.fillStyle = g;
        s.fillRect(0, 0, SPR, SPR);
      })();

      function targetCount() {
        return Math.max(45, Math.min(110, Math.round((W * H) / 15500)));
      }

      function makeParticle() {
        const depth = 0.35 + Math.random() * 0.65; // 0,35 = fundo | 1 = frente
        return {
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.14,
          vy: (Math.random() - 0.5) * 0.14,
          r: 0.7 + depth * 1.5,
          depth: depth,
          tw: Math.random() * Math.PI * 2,
          ts: 0.5 + Math.random() * 1.1,
          fl: Math.random() * Math.PI * 2
        };
      }

      function syncPopulation() {
        const alvo = targetCount();
        while (particles.length < alvo) particles.push(makeParticle());
        if (particles.length > alvo) particles.length = alvo;
      }

      function resize() {
        DPR = Math.min(window.devicePixelRatio || 1, 1.75);
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = Math.round(W * DPR);
        canvas.height = Math.round(H * DPR);
        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        syncPopulation();
        if (reduceMotion) render(16, 0); // um único quadro estático
      }

      function wrapY(y) {
        return ((y % H) + H) % H;
      }

      // Vento orgânico: senóides sobrepostas — trajetórias curvas, nunca retas
      function applyFlow(p, t, k) {
        p.vx += Math.sin(p.y * 0.0021 + t * 0.00021 + p.fl) * 0.016 * k;
        p.vy += Math.cos(p.x * 0.0018 - t * 0.00017 + p.fl * 1.7) * 0.014 * k;
      }

      function update(dt, t) {
        const k = dt / 16.66;
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          applyFlow(p, t, k);

          // A mão de luz: atração suave com redemoinho tangencial
          if (mouse.active) {
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < CURSOR_DIST * CURSOR_DIST) {
              const d = Math.sqrt(d2) || 1;
              const f = (1 - d / CURSOR_DIST) * 0.011 * p.depth * k;
              p.vx += (dx / d) * f - (dy / d) * f * 0.7;
              p.vy += (dy / d) * f + (dx / d) * f * 0.7;
            }
          }

          p.vx *= 0.986;
          p.vy *= 0.986;
          const sp = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (sp > 0.85) { p.vx = (p.vx / sp) * 0.85; p.vy = (p.vy / sp) * 0.85; }

          p.x += p.vx * k;
          p.y += p.vy * k;
          p.tw += 0.02 * p.ts * k;

          if (p.x < -24) p.x = W + 24; else if (p.x > W + 24) p.x = -24;
          if (p.y < -24) p.y = H + 24; else if (p.y > H + 24) p.y = -24;
        }

        // Pulsos de luz percorrendo os fios (sinais de fibra óptica)
        if (pulsesEnabled && pulses.length < MAX_PULSES && Math.random() < 0.05) {
          const a = particles[(Math.random() * particles.length) | 0];
          if (a) {
            let melhor = null, melhorD = LINK_DIST * LINK_DIST;
            for (let j = 0; j < particles.length; j++) {
              const b = particles[j];
              if (b === a) continue;
              const dx = b.x - a.x, dy = b.y - a.y;
              const d2 = dx * dx + dy * dy;
              if (d2 < melhorD) { melhorD = d2; melhor = b; }
            }
            if (melhor) pulses.push({ a: a, b: melhor, t: 0, v: 0.009 + Math.random() * 0.008 });
          }
        }
        for (let i = pulses.length - 1; i >= 0; i--) {
          pulses[i].t += pulses[i].v * k;
          if (pulses[i].t >= 1) pulses.splice(i, 1);
        }
      }

      function render(dt, t) {
        ctx.clearRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'lighter';

        const scrollY = window.scrollY;
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.px = p.x;
          p.py = wrapY(p.y - (p.depth - 0.62) * 0.12 * scrollY); // paralaxe de profundidade
        }

        // Fios de luz: halo largo + núcleo fino (a luz se acumula nas junções)
        for (let i = 0; i < particles.length; i++) {
          const a = particles[i];
          for (let j = i + 1; j < particles.length; j++) {
            const b = particles[j];
            const dx = b.px - a.px, dy = b.py - a.py;
            if (dx > LINK_DIST || dx < -LINK_DIST || dy > LINK_DIST || dy < -LINK_DIST) continue;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d >= LINK_DIST) continue;
            const alfa = (1 - d / LINK_DIST) * Math.min(a.depth, b.depth) * 0.55;
            ctx.strokeStyle = 'rgba(255,255,255,' + (alfa * 0.28).toFixed(3) + ')';
            ctx.lineWidth = 2.8;
            ctx.beginPath();
            ctx.moveTo(a.px, a.py);
            ctx.lineTo(b.px, b.py);
            ctx.stroke();
            ctx.strokeStyle = 'rgba(255,255,255,' + alfa.toFixed(3) + ')';
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(a.px, a.py);
            ctx.lineTo(b.px, b.py);
            ctx.stroke();
          }
        }

        // Fios até a mão de luz + halo da lanterna do cursor
        if (mouse.active) {
          let ligados = 0;
          for (let i = 0; i < particles.length && ligados < 6; i++) {
            const p = particles[i];
            const dx = mouse.x - p.px, dy = mouse.y - p.py;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < CURSOR_DIST) {
              ligados++;
              ctx.strokeStyle = 'rgba(255,255,255,' + ((1 - d / CURSOR_DIST) * 0.4).toFixed(3) + ')';
              ctx.lineWidth = 0.8;
              ctx.beginPath();
              ctx.moveTo(p.px, p.py);
              ctx.lineTo(mouse.x, mouse.y);
              ctx.stroke();
            }
          }
          ctx.globalAlpha = 0.05;
          ctx.drawImage(sprite, mouse.x - 130, mouse.y - 130, 260, 260);
          ctx.globalAlpha = 0.14;
          ctx.drawImage(sprite, mouse.x - 45, mouse.y - 45, 90, 90);
          ctx.globalAlpha = 1;
        }

        // Partículas: cintilação individual (cada estrela respira)
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const brilho = 0.55 + 0.45 * Math.sin(p.tw);
          const s = p.r * 9 * (0.75 + 0.45 * brilho);
          ctx.globalAlpha = Math.min(1, brilho * (0.35 + 0.65 * p.depth));
          ctx.drawImage(sprite, p.px - s / 2, p.py - s / 2, s, s);
        }
        ctx.globalAlpha = 1;

        // Pulsos viajando pelos fios
        for (let i = 0; i < pulses.length; i++) {
          const pu = pulses[i];
          const x = pu.a.px + (pu.b.px - pu.a.px) * pu.t;
          const y = pu.a.py + (pu.b.py - pu.a.py) * pu.t;
          ctx.globalAlpha = 0.5;
          ctx.drawImage(sprite, x - 11, y - 11, 22, 22);
          ctx.globalAlpha = 0.95;
          ctx.drawImage(sprite, x - 5, y - 5, 10, 10);
          ctx.globalAlpha = 1;
        }

        ctx.globalCompositeOperation = 'source-over';
      }

      function loop(t) {
        if (!running) return;
        const dt = Math.min(50, t - lastT || 16);
        lastT = t;

        // Qualidade adaptativa: se o quadro pesar, reduz a população uma única vez
        if (dt > 40) slowFrames++; else slowFrames = Math.max(0, slowFrames - 2);
        if (slowFrames > 90 && particles.length > 55) {
          particles.length = Math.round(particles.length * 0.7);
          pulsesEnabled = false;
          slowFrames = 0;
        }

        update(dt, t);
        render(dt, t);
        requestAnimationFrame(loop);
      }

      function start() {
        if (running || reduceMotion) return;
        running = true;
        lastT = 0;
        requestAnimationFrame(loop);
      }

      function stop() { running = false; }

      window.addEventListener('pointermove', function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;
      }, { passive: true });
      window.addEventListener('pointerdown', function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;
      }, { passive: true });
      document.documentElement.addEventListener('pointerleave', function () { mouse.active = false; });
      document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
      window.addEventListener('resize', resize);

      resize();
      start();
    })();
</script>
</body>
</html>
`;

// ---------- Montagem final e gravação ----------
let html = PAGE_HEAD + PAGE_FOOT;
html = html.split('__COUNT__').join(String(items.length));
html = html.split('__FILTERS__').join(filterButtons);
html = html.split('__FIGURES__').join(figures);
html = html.split('"__DATA__"').join(JSON.stringify(items));

fs.writeFileSync(OUT_FILE, html, 'utf8');

console.log('OK: galeria.html gerado com ' + items.length + ' imagens.');
const byCat = {};
items.forEach(function (it) { byCat[it.c] = (byCat[it.c] || 0) + 1; });
Object.keys(CATS).forEach(function (k) {
  console.log('   ' + CATS[k] + ': ' + (byCat[k] || 0));
});

