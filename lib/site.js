// DEEPSCAN — interacciones del sitio (scroll suave, hero, reveal, cursor, órbita, formulario…)
// Se ejecuta una sola vez en el cliente desde <SiteScripts />.
export function initSite(Lenis) {

(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = () => innerWidth <= 760;

  // Scroll suave
  let lenis = null;
  if (!reduced && Lenis) {
    lenis = new Lenis({ lerp: .1 });
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

  // Hero DEEP / SCAN: escaneo que llena el nombre, parallax con el mouse y fondo que sigue al cursor
  (() => {
    const hero = document.getElementById('hero'), mark = document.getElementById('dshMark'), beam = document.getElementById('dshBeam'), foot = document.getElementById('dshFoot');
    if (!hero || !mark) return;
    const lines = mark.querySelectorAll('.ln'), follow = hero.querySelector('.dsh-aurora .follow');
    let visible = true, t0 = performance.now();
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) requestAnimationFrame(scan); }).observe(hero);
    const scan = t => {
      if (!visible) return;
      const cycle = reduced ? .5 : ((t - t0) % 5600) / 5600, p = Math.min(1, cycle / .75);
      const e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2, s = -18 + e * 136;
      const r = mark.getBoundingClientRect(), hr = hero.getBoundingClientRect();
      mark.style.setProperty('--s', s + '%');
      beam.style.setProperty('--by', (r.top - hr.top + r.height * s / 100) + 'px');
      beam.style.setProperty('--bo', (!reduced && cycle < .75 && s > -4 && s < 104) ? 1 : 0);
      requestAnimationFrame(scan);
    };
    requestAnimationFrame(scan);
    if (!reduced && matchMedia('(hover:hover) and (pointer:fine)').matches) {
      hero.addEventListener('pointermove', ev => {
        const x = ev.clientX / innerWidth - .5, y = ev.clientY / innerHeight - .5;
        lines[0].style.transform = lines[2].style.transform = `translate3d(${-x * 26}px,${-y * 10}px,0)`;
        lines[1].style.transform = lines[3].style.transform = `translate3d(${x * 26}px,${y * 10}px,0)`;
        follow.style.setProperty('--fx', ev.clientX + 'px'); follow.style.setProperty('--fy', ev.clientY + 'px');
      });
      hero.addEventListener('pointerleave', () => lines.forEach(l => l.style.transform = ''));
    }
    const onScroll = () => {
      if (reduced) return;
      const k = Math.min(1, scrollY / (innerHeight * .8));
      mark.style.transform = `translate3d(0,${-k * 70}px,0)`; mark.style.opacity = 1 - k * .9;
      foot.style.transform = `translate3d(0,${-k * 30}px,0)`; foot.style.opacity = 1 - k;
    };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
  })();

  // Marquee de clientes
  const logos = [['sony.webp','Sony'],['panasonic.webp','Panasonic'],['ofero.png','Ofero'],['directv.webp','DirecTV'],['dg.webp','Diane & Geordi'],['vodafone.webp','Vodafone'],['touche.webp','Touché']];
  const cell = ([f, a]) => `<div class="logo-cell"><img src="assets/logos/${f}" alt="${a}"></div>`;
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
  const startPage = () => { body.classList.remove('loading'); lenis && lenis.start(); };
  if (reduced || seen || innerWidth <= 760) { loader.remove(); startPage(); }
  else {
    lenis && lenis.stop(); scrollTo(0, 0);
    const n = document.getElementById('ldn'), bar = document.getElementById('ldbar'), t0 = performance.now(), dur = 750;
    const step = now => {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      n.textContent = String(Math.round(e * 100)).padStart(3, '0'); bar.style.transform = `scaleX(${e})`;
      if (p < 1) return requestAnimationFrame(step);
      try { sessionStorage.setItem('ds-intro', '1'); } catch (e) {}
      setTimeout(() => { loader.classList.add('out'); setTimeout(startPage, 380); setTimeout(() => loader.remove(), 1100); }, 150);
    };
    requestAnimationFrame(step);
  }



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

  // Formulario por pasos: al final envía los datos a /api/contacto (crea el prospecto en Notion)
  const form = document.getElementById('form'), steps = [...form.querySelectorAll('.step')], bars = [...form.querySelectorAll('.progress > div')];
  const back = document.getElementById('back'), next = document.getElementById('next'), errBox = document.getElementById('formError');
  const waLink = document.querySelector('#done a')?.href || 'https://wa.me/573212035766';
  let cur = 0, sending = false;
  const show = i => {
    cur = i; steps.forEach((s, k) => s.classList.toggle('on', k === i)); bars.forEach((b, k) => b.classList.toggle('on', k <= i));
    back.hidden = i === 0; next.firstChild.textContent = i === steps.length - 1 ? 'Enviar ' : 'Continuar ';
  };
  const showError = msg => { errBox.innerHTML = `${msg} <a href="${waLink}" target="_blank" rel="noopener">Escríbenos por WhatsApp</a>.`; errBox.hidden = false; };
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (sending) return;
    errBox.hidden = true;
    const bad = [...steps[cur].querySelectorAll('input[required]')].find(f => !f.checkValidity());
    if (bad) { bad.focus(); bad.reportValidity(); return; }
    if (cur < steps.length - 1) return show(cur + 1);
    const fd = new FormData(form), chosen = form.querySelector('input[name="inversion"]:checked');
    const data = Object.fromEntries(fd.entries());
    data.inversion = chosen ? chosen.nextElementSibling.textContent.trim() : '';
    sending = true; next.setAttribute('aria-busy', 'true'); next.firstChild.textContent = 'Enviando… ';
    try {
      const res = await fetch('/api/contacto', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || !out.ok) throw new Error(out.error || 'No pudimos enviar tu información.');
      steps.forEach(s => s.classList.remove('on')); document.getElementById('navbtns').hidden = true; document.getElementById('done').hidden = false;
    } catch (err) {
      showError(err.message || 'No pudimos enviar tu información.');
      next.firstChild.textContent = 'Enviar ';
    } finally { sending = false; next.removeAttribute('aria-busy'); }
  });
  back.addEventListener('click', () => show(cur - 1));
})();

}
