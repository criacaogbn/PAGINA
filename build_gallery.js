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
    .replace(/\.jpe?g$/i, '')
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
  .filter(function (f) { return /\.jpe?g$/i.test(f); })
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
<title>GBN 3D — Modelagem, Escultura Digital e Rendering</title>
<meta name="description" content="Portfólio de modelagem 3D, escultura digital (ZBrush), texturização e rendering — personagens, criaturas, cenários e produtos.">
<meta property="og:type" content="website">
<meta property="og:title" content="GBN 3D — Portfólio 3D">
<meta property="og:description" content="Modelagem 3D, escultura digital e rendering: personagens, criaturas, cenários e produtos.">
<meta property="og:image" content="imagens/guerreira_ks01.177.jpg">
<meta name="theme-color" content="#0d0f14">
<link rel="icon" type="image/png" href="logo/logocircularpng2.png">
<title>GBN 3D — Acervo Completo de Trabalhos</title>
<style>
:root{--bg:#0d0f14;--panel:#151823;--line:#252a3a;--tx:#e8eaf2;--mut:#9aa3b8;--acc:#f5a524;--acc2:#ffc46b}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--tx);font:16px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
img{max-width:100%}
.wrap{max-width:1100px;margin:0 auto;padding:0 20px}
header{position:sticky;top:0;z-index:50;background:rgba(13,15,20,.82);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
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
.svc .ico{font-size:1.6rem}
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
.thumb img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .25s}
.card:hover .thumb img{transform:scale(1.04)}
.zoom{position:absolute;right:10px;top:10px;background:rgba(0,0,0,.55);color:#fff;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;font-weight:700;opacity:0;transition:opacity .18s}
.card:hover .zoom,.thumb:focus-visible .zoom{opacity:1}
.card figcaption{display:flex;align-items:center;gap:8px;padding:10px 12px;font-size:.86rem;color:var(--mut)}
.chip{background:#232939;color:var(--acc2);font-size:.68rem;font-weight:700;letter-spacing:.5px;text-transform:uppercase;padding:2px 8px;border-radius:999px;white-space:nowrap}
.about p{color:var(--mut);max-width:780px}
.contact{display:flex;gap:12px;flex-wrap:wrap;margin-top:6px}
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
<header>
  <div class="wrap nav">
    <img src="logo/logocircularpng2.png" alt="Logotipo GBN 3D">
    <div class="brand">GBN<span>3D</span></div>
    <nav class="links">
      <a href="#servicos">Serviços</a>
      <a href="#galeria">Galeria</a>
      <a href="#sobre">Sobre</a>
      <a href="#contato">Contato</a>
    </nav>
  </div>
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
      <div class="svc"><div class="ico">🧊</div><h3>Modelagem 3D</h3><p>Modelos poligonais limpos e otimizados para render, animação ou jogos.</p></div>
      <div class="svc"><div class="ico">🗿</div><h3>Escultura Digital</h3><p>Esculturas de alta resolução em ZBrush: personagens, criaturas e orgânicos.</p></div>
      <div class="svc"><div class="ico">🎨</div><h3>Texturização</h3><p>Materiais PBR, pintura procedural e mapas de alta qualidade.</p></div>
      <div class="svc"><div class="ico">💡</div><h3>Iluminação &amp; Render</h3><p>Iluminação, câmera e composição para imagens finais de impacto.</p></div>
      <div class="svc"><div class="ico">🖨️</div><h3>Impressão 3D</h3><p>Preparação de malhas para impressão: espessura, corte e suportes.</p></div>
      <div class="svc"><div class="ico">🔧</div><h3>Correção de Malhas</h3><p>Retopologia, otimização e conserto de modelos para produção.</p></div>
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
      <a class="btn primary" href="https://wa.me/5500000000000">WhatsApp — (00) 00000-0000</a>
      <a class="btn ghost" href="mailto:seuemail@exemplo.com">E-mail</a>
    </div>
    <p class="sub" style="margin-top:14px;font-size:.85rem">* Edite os contatos acima no arquivo galeria.html (procure por "wa.me" e "mailto:").</p>
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
    lbImg.src = 'imagens_trabalhos/' + encodeURIComponent(it.f);
    lbImg.alt = it.t;
    lbCap.textContent = it.t;
    lbCnt.textContent = (posInVis(cur) + 1) + ' / ' + vis.length;
  }
  function openLb(i) {
    cur = i;
    lastFocus = document.activeElement;
    updateLb();
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.getElementById('lbClose').focus();
  }
  function closeLb() {
    lb.classList.remove('open');
    lbImg.src = '';
    document.body.style.overflow = '';
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

