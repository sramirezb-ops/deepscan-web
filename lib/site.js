// DEEPSCAN — interacciones del sitio (scroll suave, hero, reveal, cursor, órbita, formulario…)
// Se ejecuta una sola vez en el cliente desde <SiteScripts />.
export function initSite(Lenis) {

(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = () => innerWidth <= 760;

  // Scroll suave
  let lenis = null;
  if (!reduced && Lenis) {
    lenis = new Lenis({ lerp: .1 }); window.__lenis = lenis;
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf);
    document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href'); if (id.length < 2) return;
      e.preventDefault(); closeMenu(); lenis.scrollTo(id === '#top' ? 0 : id, { offset: -70 });
    }));
  }

  // Header + menú móvil
  const hdr = document.getElementById('hdr'), burger = document.getElementById('burger');
  const onScrollHdr = () => hdr.classList.toggle('solid', scrollY > 40);
  addEventListener('scroll', onScrollHdr, { passive: true }); onScrollHdr();
  function closeMenu(){ document.body.classList.remove('menu-open'); burger.setAttribute('aria-expanded','false'); lenis && lenis.start(); }
  burger.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', open); open ? lenis && lenis.stop() : lenis && lenis.start();
  });
  document.querySelectorAll('.mmenu a').forEach(a => a.addEventListener('click', closeMenu));

  // Reveal
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('.rv,.lines').forEach((el, i) => { el.style.transitionDelay = (el.classList.contains('badge') ? [...el.parentNode.children].indexOf(el) * .1 : 0) + 's'; io.observe(el); });

  // Contadores
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, to = +el.dataset.count, dec = +(el.dataset.dec || 0), pre = el.dataset.pre || '', suf = el.dataset.suf || '';
    const t0 = performance.now(), dur = reduced ? 1 : 1600;
    const tick = now => { const p = Math.min(1, (now - t0) / dur), v = to * (1 - Math.pow(1 - p, 3)); el.textContent = pre + v.toFixed(dec) + suf; if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }), { threshold: .6 });
  document.querySelectorAll('[data-count]').forEach(el => cio.observe(el));

  // Hero: cuadrícula de puntos con haz de escaneo
  const cv = document.getElementById('grid'), cx = cv.getContext('2d');
  let W, H, dpr, mx = -999, my = -999, heroVisible = true;
  const size = () => { dpr = Math.min(devicePixelRatio, 2); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  size(); addEventListener('resize', size);
  cv.parentElement.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
  cv.parentElement.addEventListener('pointerleave', () => { mx = my = -999; });
  new IntersectionObserver(([e]) => heroVisible = e.isIntersecting).observe(cv);
  const draw = t => {
    if (heroVisible) {
      cx.clearRect(0, 0, W, H);
      const gap = mobile() ? 22 : 28, beam = ((t / 5200) % 1) * (H + 200) - 100;
      // Momento firma: con el scroll, la cuadrícula se llena como barras de crecimiento
      const gs = reduced ? 0 : Math.min(1, scrollY / (H * .65)), gi = body.classList.contains('loading') || !window.__heroT ? 0 : Math.min(1, (t - window.__heroT) / 2200);
      const ge = Math.max(.32 * (1 - Math.pow(1 - gi, 3)), 1 - Math.pow(1 - gs, 3));
      for (let y = gap / 2; y < H; y += gap) {
        const b = reduced ? 0 : Math.exp(-((y - beam) ** 2) / 1800);
        for (let x = gap / 2, col = 0; x < W; x += gap, col++) {
          const u = x / W, noise = Math.sin(col * 12.9898) * 43758.5453 % 1;
          const level = H - H * .78 * (.12 + .88 * Math.pow(u, 1.5) + Math.abs(noise) * .12) * ge;
          const lit = ge > 0 && y > level ? (.38 + .6 * Math.exp(-(y - level) / 22)) * Math.min(1, ge * 2.2) : 0;
          const dm = Math.hypot(x - mx, y - my), m = dm < 160 ? (1 - dm / 160) : 0;
          const a = Math.min(1, .1 + b * .55 + m * .5 + lit);
          cx.fillStyle = `rgba(255,255,255,${a})`;
          const r = 1 + b * .6 + m * 1.2 + lit * 1.3;
          cx.fillRect(x - r / 2, y - r / 2, r, r);
        }
      }
      if (!reduced) { const g = cx.createLinearGradient(0, beam - 60, 0, beam + 2); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,.06)'); cx.fillStyle = g; cx.fillRect(0, beam - 60, W, 62); }
    }
    requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);

  // Marquee de clientes
  const logos = [['sony.webp','Sony'],['panasonic.webp','Panasonic'],['ofero.png','Ofero'],['directv.webp','DirecTV'],['dg.webp','Diane & Geordi'],['vodafone.webp','Vodafone'],['touche.webp','Touché']];
  const cell = ([f, a]) => `<div class="logo-cell"><img src="assets/logos/${f}" alt="${a}"><small class="todo" data-todo="Mercado · canal · año">País · Canal · Año</small></div>`;
  const fill = (el, list) => { const html = list.map(cell).join(''); el.innerHTML = html + html.replace(/alt="[^"]*"/g, 'alt="" aria-hidden="true"'); };
  fill(document.getElementById('mq1'), logos); fill(document.getElementById('mq2'), [...logos.slice(3), ...logos.slice(0, 3)]);

  // Servicios: mazo apilado con escala
  const cards = [...document.querySelectorAll('.card')];
  const stackTop = () => (mobile() ? 80 : 104);
  cards.forEach((c, i) => c.style.top = (stackTop() + i * 14) + 'px');
  const stack = () => {
    cards.forEach((c, i) => {
      const next = cards[i + 1]; if (!next) return;
      const r = c.getBoundingClientRect(), nr = next.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, 1 - (nr.top - r.top) / r.height));
      c.style.transform = `scale(${1 - p * .06})`;
      c.style.filter = `brightness(${1 - p * .35})`;
    });
  };
  addEventListener('scroll', stack, { passive: true }); stack();
  // video UGC: carga diferida
  const ugc = document.querySelector('.phone iframe');
  new IntersectionObserver(([e], o) => { if (e.isIntersecting) { ugc.src = ugc.dataset.src; o.disconnect(); } }, { rootMargin: '400px' }).observe(ugc);

  // Respaldo: texto que se ilumina con el scroll
  const scrub = document.getElementById('scrub');
  scrub.innerHTML = scrub.textContent.split(' ').map(w => `<span class="w">${w}</span>`).join(' ');
  const words = [...scrub.querySelectorAll('.w')];
  const scrubF = () => {
    const r = scrub.getBoundingClientRect(), vh = innerHeight;
    const p = Math.min(1, Math.max(0, (vh * .85 - r.top) / (r.height + vh * .45)));
    const n = reduced ? words.length : Math.round(p * words.length);
    words.forEach((w, i) => w.style.opacity = i < n ? 1 : .14);
  };
  addEventListener('scroll', scrubF, { passive: true }); scrubF();

  // Video: póster, zoom con scroll y reproducción con sonido
  const stage = document.getElementById('stage');
  const posters = { d: 'https://i.vimeocdn.com/video/2010049384-331777ca4cfcaee03d06670dabcd2ebca9b93aa40f2a80cc333d8d4cfc9c5dc6-d_1280?region=us', m: 'https://i.vimeocdn.com/video/2010033281-555579968b53bdf5973c4f53c33482b6756526f8dfb499ec1766cfa21fdd6501-d_640?region=us' };
  const setPoster = () => stage.style.backgroundImage = `url(${matchMedia('(max-width:900px)').matches ? posters.m : posters.d})`;
  setPoster(); addEventListener('resize', setPoster);
  document.getElementById('play').addEventListener('click', () => {
    const id = matchMedia('(max-width:900px)').matches ? '1079592621?h=e540621dcb' : '1079605546?h=ad47a5886e';
    stage.insertAdjacentHTML('beforeend', `<iframe src="https://player.vimeo.com/video/${id}&title=0&byline=0&portrait=0&badge=0&autoplay=1" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Por qué somos diferentes"></iframe>`);
  });
  const zoom = () => {
    if (reduced) return;
    const r = stage.getBoundingClientRect(), vh = innerHeight;
    const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * .75)));
    stage.style.transform = `scale(${.86 + p * .14})`;
  };
  addEventListener('scroll', zoom, { passive: true }); zoom();

  // Tilt de capturas
  document.querySelectorAll('.case').forEach(c => {
    const b = c.querySelector('.tilt');
    c.addEventListener('pointermove', e => { if (reduced) return; const r = b.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; b.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`; });
    c.addEventListener('pointerleave', () => b.style.transform = '');
  });

  // Botones magnéticos
  if (!reduced && matchMedia('(hover:hover)').matches) document.querySelectorAll('.mag').forEach(b => {
    b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px,${(e.clientY - r.top - r.height / 2) * .28}px)`; });
    b.addEventListener('pointerleave', () => b.style.transform = '');
  });


  // ===== Capa "más increíble" =====
  const body = document.body;
  // Pantalla de entrada (solo la primera vez por sesión)
  const loader = document.getElementById('loader');
  let seen = false; try { seen = sessionStorage.getItem('ds-intro') === '1'; } catch (e) {}
  const startPage = () => { body.classList.remove('loading'); lenis && lenis.start(); window.__heroT = performance.now() + 900; };
  if (reduced || seen) { loader.remove(); startPage(); }
  else {
    lenis && lenis.stop(); scrollTo(0, 0);
    const n = document.getElementById('ldn'), bar = document.getElementById('ldbar'), t0 = performance.now(), dur = 1150;
    const step = now => {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      n.textContent = String(Math.round(e * 100)).padStart(3, '0'); bar.style.transform = `scaleX(${e})`;
      if (p < 1) return requestAnimationFrame(step);
      try { sessionStorage.setItem('ds-intro', '1'); } catch (e) {}
      setTimeout(() => { loader.classList.add('out'); setTimeout(startPage, 380); setTimeout(() => loader.remove(), 1100); }, 150);
    };
    requestAnimationFrame(step);
  }



  // ===== Hero: el texto se va, suben los datos y entra "VENTAS" =====
  (() => {
    const st = document.querySelector('.hx-sticky'), sec = document.getElementById('hero');
    const word = document.getElementById('hxWord'), v1 = word.querySelector('.v1'), v2 = word.querySelector('.v2');
    const smP = word.querySelector('.pre'), smQ = word.querySelector('.post');
    const top = document.getElementById('hxTop');
    const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    const F = () => {
      const r = sec.getBoundingClientRect(), span = sec.offsetHeight - innerHeight;
      const p = reduced ? 0 : Math.min(1, Math.max(0, -r.top / span));
      const c = 1 - sm(.02, .32, p);
      top.style.opacity = c; top.style.transform = `translate3d(0,calc(-50% + ${-50 * (1 - c)}px),0)`;
      st.style.setProperty('--ro', String(1 - sm(.1, .5, p) * .6));
      const e2 = sm(.25, .7, p);
      word.style.opacity = e2;
      v1.style.transform = `translate3d(${-50 * (1 - e2)}vw,0,0)`; v2.style.transform = `translate3d(${50 * (1 - e2)}vw,0,0)`;
      const e4 = sm(.58, .78, p);
      smP.style.opacity = e4; smP.style.transform = `translate3d(0,${24 * (1 - e4)}px,0)`;
      smQ.style.opacity = e4; smQ.style.transform = `translate3d(0,${-24 * (1 - e4)}px,0)`;
    };
    addEventListener('scroll', F, { passive: true }); addEventListener('resize', F); F();
  })();

  // Línea de progreso en el header
  const prog = document.getElementById('prog');
  const progF = () => { const max = document.documentElement.scrollHeight - innerHeight; prog.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`; };
  addEventListener('scroll', progF, { passive: true }); progF();

  // Cursor propio (solo mouse)
  if (!reduced && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    const cur = document.getElementById('cur'), lab = document.getElementById('curl');
    let x = -100, y = -100, cx2 = x, cy2 = y;
    body.classList.add('has-cur');
    addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; cur.classList.add('on'); });
    document.addEventListener('pointerleave', () => cur.classList.remove('on'));
    const loop = () => { cx2 += (x - cx2) * .22; cy2 += (y - cy2) * .22; cur.style.transform = `translate3d(${cx2}px,${cy2}px,0)`; requestAnimationFrame(loop); }; loop();
    document.addEventListener('pointerover', e => {
      const l = e.target.closest('[data-cur]'), a = e.target.closest('a,button,label,.logo-cell');
      if (l && !e.target.closest('iframe')) { cur.classList.add('lab'); cur.classList.remove('big'); lab.textContent = l.dataset.cur; }
      else if (a) { cur.classList.add('big'); cur.classList.remove('lab'); }
      else cur.classList.remove('big', 'lab');
    });
  }

  // Etiquetas que se decodifican
  const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&/·';
  document.querySelectorAll('.eyebrow').forEach(el => {
    const tn = [...el.childNodes].reverse().find(nd => nd.nodeType === 3 && nd.textContent.trim());
    if (!tn) return;
    const span = document.createElement('span'); span.className = 'dec'; span.textContent = tn.textContent; span.dataset.t = tn.textContent.trim(); tn.replaceWith(span);
    const final = span.textContent;
    const run = () => {
      if (reduced) return;
      const t0 = performance.now(), dur = 900;
      const f = now => {
        const p = Math.min(1, (now - t0) / dur), k = Math.floor(p * final.length);
        span.textContent = final.split('').map((c, i) => i < k || c === ' ' ? c : glyphs[(Math.random() * glyphs.length) | 0]).join('');
        if (p < 1) requestAnimationFrame(f); else span.textContent = final;
      };
      requestAnimationFrame(f);
    };
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { o.disconnect(); setTimeout(run, el.closest('.hero') && body.classList.contains('loading') ? 1500 : 0); } }, { rootMargin: '0px 0px -10% 0px' });
    o.observe(el);
  });

  // Secciones claras que se expanden desde una tarjeta
  const lights = [...document.querySelectorAll('.light')];
  lights.forEach(l => l.classList.add('grow'));
  const growF = () => {
    if (reduced) return;
    const vh = innerHeight, maxI = Math.min(36, innerWidth * .04);
    lights.forEach(l => {
      const r = l.getBoundingClientRect();
      if (r.top > vh || r.bottom < 0) return;
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * .7)));
      const i = (1 - p) * maxI, rad = (1 - p) * 36;
      l.style.clipPath = p >= 1 ? 'none' : `inset(0 ${i}px 0 ${i}px round ${rad}px ${rad}px 0 0)`;
    });
  };
  addEventListener('scroll', growF, { passive: true }); addEventListener('resize', growF); growF();

  // Revelado de capturas
  const rio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }), { rootMargin: '0px 0px -15% 0px' });
  document.querySelectorAll('.reveal-img').forEach(el => rio.observe(el));

  // Logos que aceleran con el scroll
  const tracks = [...document.querySelectorAll('.track')];
  let lastY = scrollY, vel = 0;
  const mqLoop = () => {
    const d = scrollY - lastY; lastY = scrollY; vel += (Math.min(60, Math.abs(d)) - vel) * .08;
    tracks.forEach(t => { const a = t.getAnimations()[0]; if (a) a.playbackRate = 1 + vel * .12; });
    requestAnimationFrame(mqLoop);
  };
  if (!reduced) mqLoop();

  // Tarjeta del hero: inclinación con el mouse + lectura de la curva
  const rep = document.querySelector('.report'), hero = document.querySelector('.hero');
  if (rep && !reduced && matchMedia('(hover:hover)').matches && innerWidth > 1024) {
    hero.addEventListener('pointermove', e => {
      const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      rep.classList.add('live-tilt'); rep.style.transform = `perspective(1000px) rotateY(${-8 + x * 14}deg) rotateX(${4 - y * 10}deg) translateZ(0)`;
    });
    hero.addEventListener('pointerleave', () => rep.style.transform = '');
  }
  const hp = document.getElementById('hp'), sx = document.getElementById('sx'), dd = document.getElementById('dd'), dh = document.getElementById('dh');
  if (hp && !reduced) {
    const L = hp.getTotalLength(), pts = [];
    for (let i = 0; i <= 200; i++) { const q = hp.getPointAtLength(L * i / 200); pts.push([q.x, q.y]); }
    const yAt = x => { let i = pts.findIndex(q => q[0] >= x); if (i <= 0) return pts[Math.max(0, i)][1]; const [a, b] = [pts[i - 1], pts[i]]; return a[1] + (b[1] - a[1]) * ((x - a[0]) / (b[0] - a[0] || 1)); };
    const t0 = performance.now() + 3200;
    const read = now => {
      const t = now - t0;
      if (t > 0) {
        const p = (t % 4200) / 4200, x = p * 300, y = yAt(x), fade = Math.min(1, Math.min(p, 1 - p) * 10);
        sx.setAttribute('x1', x); sx.setAttribute('x2', x); dd.setAttribute('cx', x); dd.setAttribute('cy', y); dh.setAttribute('cx', x); dh.setAttribute('cy', y);
        sx.setAttribute('opacity', fade); dd.setAttribute('opacity', fade); dh.setAttribute('opacity', fade);
      }
      requestAnimationFrame(read);
    };
    requestAnimationFrame(read);
  }


  // ===== Auditoría: moneda, dashboard y pendientes =====
  document.querySelectorAll('.cur-toggle button').forEach(b => b.addEventListener('click', () => {
    const c = b.dataset.cur;
    document.querySelectorAll('.cur-toggle button').forEach(x => x.setAttribute('aria-pressed', x === b));
    document.querySelectorAll('#pills span').forEach(sp => sp.textContent = sp.dataset[c.toLowerCase()]);
  }));
  const dash = document.getElementById('dash');
  const dxT = document.getElementById('dxTheme');
  dxT.addEventListener('click', () => { const lm = dash.classList.toggle('lm'); dxT.textContent = lm ? '☾' : '☀'; });
  new IntersectionObserver(([e], o) => { if (e.isIntersecting) { dash.classList.add('in'); o.disconnect(); } }, { threshold: .35 }).observe(dash);

  const todoBtn = document.getElementById('todoBtn'), list = document.getElementById('todoList');
  const buildTodo = () => {
    const seen = new Set(), items = [];
    document.querySelectorAll('.todo').forEach(el => {
      const k = el.dataset.todo; if (!k || seen.has(k)) return; seen.add(k);
      const sec = el.closest('section,footer,header'), eb = sec && sec.querySelector('.eyebrow .dec'), where = !sec ? 'General' : sec.classList.contains('hero') ? 'Hero' : sec.tagName === 'FOOTER' ? 'Footer' : sec.tagName === 'HEADER' ? 'Header' : (eb ? eb.dataset.t : 'Sección');
      items.push([k, where, el]);
    });
    document.getElementById('todoN').textContent = items.length;
    list.innerHTML = '';
    items.forEach(([k, w, el]) => { const b = document.createElement('button'); b.innerHTML = `<span>${w}</span>${k}`; b.onclick = () => { lenis ? lenis.scrollTo(el, { offset: -140 }) : el.scrollIntoView({ block: 'center' }); }; list.appendChild(b); });
  };
  setTimeout(buildTodo, 50);
  todoBtn.addEventListener('click', () => { const on = body.classList.toggle('show-todo'); todoBtn.setAttribute('aria-expanded', on); });


  // ===== Concepto plataforma: anillo, creatividad, órbita, carrusel =====
  const NS = 'http://www.w3.org/2000/svg';
  const rings = [...document.querySelectorAll('[data-ring]')].map((el, k) => {
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '-100 -100 200 200');
    svg.innerHTML = `<defs><radialGradient id="sweepg${k}" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse"></radialGradient></defs>`;
    const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'rot');
    const n = 144, act0 = 8, act1 = 30;
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2, long = i % 6 === 0, r1 = long ? 86 : 90, r2 = 96;
      const ln = document.createElementNS(NS, 'line');
      ln.setAttribute('x1', (Math.cos(a) * r1).toFixed(2)); ln.setAttribute('y1', (Math.sin(a) * r1).toFixed(2));
      ln.setAttribute('x2', (Math.cos(a) * r2).toFixed(2)); ln.setAttribute('y2', (Math.sin(a) * r2).toFixed(2));
      ln.setAttribute('class', 'tk' + (i >= act0 && i < act1 ? ' a' : long ? ' l' : ''));
      g.appendChild(ln);
    }
    const inner = document.createElementNS(NS, 'circle'); inner.setAttribute('r', '72'); inner.setAttribute('fill', 'none'); inner.setAttribute('class', 'tk'); inner.setAttribute('stroke-dasharray', '1 3');
    g.appendChild(inner); svg.appendChild(g); el.appendChild(svg);
    return { el, g, dir: k % 2 ? -1 : 1 };
  });
  const ringF = () => {
    if (reduced) return;
    rings.forEach(r => { const rect = r.el.getBoundingClientRect(); if (rect.bottom < -200 || rect.top > innerHeight + 200) return; r.g.style.transform = `rotate(${(scrollY * .06 + performance.now() * .002) * r.dir}deg)`; });
    requestAnimationFrame(ringF);
  };
  requestAnimationFrame(ringF);

  // Reel creativo: duplica para bucle y carga el video real al verse
  const reel = document.getElementById('reelTrack');
  reel.insertAdjacentHTML('beforeend', reel.innerHTML.replace(/class="([^"]*)todo([^"]*)"/g, 'class="$1$2" aria-hidden="true"').replace(/<iframe[^>]*><\/iframe>/, '<iframe data-src="https://player.vimeo.com/video/1100406578?muted=1&autoplay=1&loop=1&background=1" title="" allow="autoplay" tabindex="-1"></iframe>'));
  new IntersectionObserver(([e], o) => { if (e.isIntersecting) { reel.querySelectorAll('iframe[data-src]').forEach(f => f.src = f.dataset.src); o.disconnect(); } }, { rootMargin: '300px' }).observe(reel);

  // Órbita: los servicios convergen en uno solo
  const orbitEl = document.getElementById('orbit'), circles = [...orbitEl.querySelectorAll('.c')], core = orbitEl.querySelector('.core'), halo = orbitEl.querySelector('.halo');
  const orbitF = () => {
    const w = orbitEl.clientWidth, h = orbitEl.clientHeight, d = Math.min(w * (mobile() ? .42 : .26), h * .5, 260);
    orbitEl.style.setProperty('--d', d + 'px');
    const r = orbitEl.getBoundingClientRect(), vh = innerHeight;
    const p = reduced ? 1 : Math.min(1, Math.max(0, (vh * .85 - r.top) / (vh * .7)));
    const e = p * p * (3 - 2 * p), R = Math.min(w * .36, h * .42) * (1 - e * .82);
    circles.forEach((c, i) => {
      const a = -Math.PI / 2 + i / circles.length * Math.PI * 2;
      c.style.transform = `translate(${Math.cos(a) * R}px,${Math.sin(a) * R}px)`;
      c.querySelector('span').style.opacity = 1 - Math.min(1, Math.max(0, (e - .4) / .3));
    });
    core.style.opacity = Math.max(0, (e - .78) / .22); halo.style.opacity = Math.max(0, (e - .8) / .2);
  };
  addEventListener('scroll', orbitF, { passive: true }); addEventListener('resize', orbitF); orbitF();

  // Carrusel de funciones
  const feats = document.getElementById('feats');
  const stepF = dir => feats.scrollBy({ left: dir * (feats.querySelector('.feat').offsetWidth + 16), behavior: reduced ? 'auto' : 'smooth' });
  document.getElementById('fPrev').addEventListener('click', () => stepF(-1));
  document.getElementById('fNext').addEventListener('click', () => stepF(1));

  // Formulario por pasos (prototipo: no envía datos)
  const form = document.getElementById('form'), steps = [...form.querySelectorAll('.step')], bars = [...form.querySelectorAll('.progress > div')];
  const back = document.getElementById('back'), next = document.getElementById('next');
  let cur = 0;
  const show = i => {
    cur = i; steps.forEach((s, k) => s.classList.toggle('on', k === i)); bars.forEach((b, k) => b.classList.toggle('on', k <= i));
    back.hidden = i === 0; next.firstChild.textContent = i === steps.length - 1 ? 'Enviar ' : 'Continuar ';
  };
  form.addEventListener('submit', e => {
    e.preventDefault();
    const bad = [...steps[cur].querySelectorAll('input[required]')].find(f => !f.checkValidity());
    if (bad) { bad.focus(); bad.reportValidity(); return; }
    if (cur < steps.length - 1) return show(cur + 1);
    steps.forEach(s => s.classList.remove('on')); document.getElementById('navbtns').hidden = true; document.getElementById('done').hidden = false;
  });
  back.addEventListener('click', () => show(cur - 1));
})();

}
