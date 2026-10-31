
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
