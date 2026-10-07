// DEEPSCAN — recorrido 3D de "Respaldo oficial" (Three.js)
export function initJourney(THREE) {

// ===== Momento Cartier: recorrido 3D con el anillo de escaneo como protagonista =====
const sec = document.getElementById('respaldo');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const okGL = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } })();
if (reduced || !okGL) { sec.classList.add('j-off'); }
else try {
  const mobile = innerWidth <= 760;
  const L = 150, AHEAD = 11;
  const pathX = z => Math.sin(z * .018) * 3.2 + Math.sin(z * .041) * 1.1;
  const canvas = document.getElementById('jgl');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2));
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050505);
  scene.fog = new THREE.Fog(0x050505, 14, 80);
  const camera = new THREE.PerspectiveCamera(mobile ? 66 : 52, 1, .1, 200);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x000000, .35));
  const VIOLET = new THREE.Color('#8b5cf6');

  // Suelo de puntos con onda de escaneo violeta
  const U = { uRing: { value: new THREE.Vector3() }, uWave: { value: 0 }, uViolet: { value: VIOLET } };
  {
    const pts = [], st = mobile ? 1.3 : 1;
    for (let z = -20; z < L + 60; z += st) for (let x = -34; x <= 34; x += st) pts.push(x, 0, -z);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    scene.add(new THREE.Points(g, new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false,
      vertexShader: `uniform vec3 uRing; uniform float uWave; varying float vA; varying float vW;
        void main(){ vec4 wp = modelMatrix*vec4(position,1.); float d = distance(wp.xz, uRing.xz);
          float glow = smoothstep(14.,0.,d); float w = smoothstep(.9,0.,abs(d-uWave))*smoothstep(32.,4.,uWave);
          vec4 mv = viewMatrix*wp; float dep = -mv.z; vW = w;
          vA = (.12 + glow*.45 + w*.9) * smoothstep(80.,10.,dep);
          gl_PointSize = min(6., (1.1 + w*2.2 + glow) * (24./dep) * ${renderer.getPixelRatio().toFixed(2)});
          gl_Position = projectionMatrix*mv; }`,
      fragmentShader: `uniform vec3 uViolet; varying float vA; varying float vW;
        void main(){ float r = length(gl_PointCoord-.5); if(r>.5) discard; gl_FragColor = vec4(mix(vec3(1.), uViolet*1.4, vW), vA*smoothstep(.5,.2,r)); }`
    })));
  }

  // Monolitos
  {
    let a = 9; const rand = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const items = [], dens = mobile ? 2 : 3;
    for (let z = -8; z < L + 50; z += 2.3) for (const side of [-1, 1]) for (let k = 0; k < dens; k++) {
      const gap = 4.4 + rand() * 1.6 + k * (3.5 + rand() * 6);
      items.push({ x: pathX(z) + side * gap, z: -z - rand() * 1.4, h: .8 + rand() * 3 + rand() * rand() * 12 * (.5 + k * .35), w: .45 + rand() * 1.1, cap: rand(), });
    }
    const box = new THREE.BoxGeometry(1, 1, 1); box.translate(0, .5, 0);
    const mono = new THREE.InstancedMesh(box, new THREE.MeshStandardMaterial({ color: 0x2c2c2c, roughness: .34, metalness: .6 }), items.length);
    const capsW = items.filter(i => i.cap > .45 && i.cap < .95), capsV = items.filter(i => i.cap >= .95);
    const cw = new THREE.InstancedMesh(box, new THREE.MeshBasicMaterial({ color: 0xffffff }), capsW.length);
    const cv = new THREE.InstancedMesh(box, new THREE.MeshBasicMaterial({ color: VIOLET }), Math.max(1, capsV.length));
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3();
    items.forEach((it, i) => { m.compose(v.set(it.x, 0, it.z), q, sc.set(it.w, it.h, it.w)); mono.setMatrixAt(i, m); });
    capsW.forEach((it, i) => { m.compose(v.set(it.x, it.h, it.z), q, sc.set(it.w, .045, it.w)); cw.setMatrixAt(i, m); });
    capsV.forEach((it, i) => { m.compose(v.set(it.x, it.h, it.z), q, sc.set(it.w, .06, it.w)); cv.setMatrixAt(i, m); });
    scene.add(mono, cw, cv);
  }

  // Protagonista: anillo de escaneo en 3D
  const ring = new THREE.Group();
  {
    const n = 120, tick = new THREE.BoxGeometry(.035, .22, .035), tickL = new THREE.BoxGeometry(.05, .36, .05);
    const white = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .85 });
    const vio = new THREE.MeshBasicMaterial({ color: VIOLET });
    for (let i = 0; i < n; i++) {
      const ang = i / n * Math.PI * 2, long = i % 6 === 0, act = i >= 6 && i < 28;
      const t = new THREE.Mesh(long ? tickL : tick, act ? vio : white);
      t.position.set(Math.cos(ang) * 1.55, Math.sin(ang) * 1.55, 0); t.rotation.z = ang - Math.PI / 2; ring.add(t);
    }
    const inner = new THREE.Mesh(new THREE.TorusGeometry(1.18, .008, 6, 160), new THREE.MeshBasicMaterial({ color: VIOLET, transparent: true, opacity: .8 }));
    ring.add(inner);
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(167,139,250,.9)'); gr.addColorStop(.3, 'rgba(139,92,246,.3)'); gr.addColorStop(1, 'rgba(139,92,246,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    halo.scale.set(5.5, 5.5, 1); ring.add(halo);
    ring.userData.inner = inner;
    ring.add(new THREE.PointLight(VIOLET, 70, 28, 1.5));
    const wl = new THREE.PointLight(0xffffff, 26, 18, 1.6); wl.position.set(0, 2, 3); ring.add(wl);
  }
  scene.add(ring);

  // Tarjetas ancladas al mundo
  const cards = [...document.querySelectorAll('#jcards .jc')].map(el => ({ el, z: +el.dataset.z, side: +el.dataset.side, y: el.dataset.y ? +el.dataset.y : 2.6, end: !!el.dataset.end }));
  const pv = new THREE.Vector3();
  const place = (camZ, W, H) => {
    const off = mobile ? 0 : 5;
    for (const c of cards) {
      const d = c.z - camZ;
      pv.set(pathX(c.z) + c.side * off, mobile && c.side ? -1.6 : c.y, -c.z).project(camera);
      if (d < .6 || d > 80 || pv.z > 1) { c.el.style.opacity = 0; c.el.style.visibility = 'hidden'; continue; }
      const sx = (pv.x * .5 + .5) * W, sy = (-pv.y * .5 + .5) * H;
      const k = c.el.classList.contains('head') ? (mobile ? 9 : 12) : (mobile ? 11 : 13);
      const scale = Math.min(1.1, k / d);
      const op = Math.min(1, Math.max(0, (60 - d) / 22)) * (c.end ? 1 : Math.min(1, Math.max(0, (d - 2.5) / 6)));
      const rot = (mobile ? 0 : c.side) * -16 * (1 - Math.min(1, Math.max(0, (d - 6) / 24)));
      c.el.style.visibility = op > .01 ? 'visible' : 'hidden';
      c.el.style.opacity = op.toFixed(3);
      c.el.style.zIndex = String(1000 - Math.round(d));
      c.el.style.transform = `translate3d(${sx}px,${sy}px,0) translate(-50%,-50%) perspective(900px) rotateY(${rot}deg) scale(${scale})`;
    }
  };

  // Sonido opcional (generado, sin archivos)
  let audio = null, wantSound = false;
  const sBtn = document.getElementById('jsound');
  const startAudio = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 420; f.Q.value = 3; f.connect(master);
    [[55, 'sawtooth', .045], [55.3, 'sawtooth', .045], [82.4, 'sine', .07], [164.8, 'sine', .02]].forEach(([fr, ty, gn]) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = ty; o.frequency.value = fr; g.gain.value = gn; o.connect(g).connect(f); o.start(); });
    audio = { ctx, master, f };
  };
  const ping = () => {
    if (!audio || !wantSound) return;
    const { ctx, master } = audio, o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
    o.frequency.setValueAtTime(1320, t); o.frequency.exponentialRampToValueAtTime(880, t + .6);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.04, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + 1.3);
    o.connect(g).connect(master); o.start(t); o.stop(t + 1.4);
  };
  sBtn.addEventListener('click', () => {
    wantSound = !wantSound; if (wantSound && !audio) startAudio();
    if (audio) { audio.ctx.resume(); audio.master.gain.setTargetAtTime(wantSound && visible ? .5 : 0, audio.ctx.currentTime, .4); }
    sBtn.classList.toggle('on', wantSound); sBtn.setAttribute('aria-pressed', wantSound);
  });

  // Ciclo de render (solo cuando la sección está en pantalla)
  let visible = false, prog = 0, lastZ = 0, W = 0, H = 0, waveT = 0;
  const resize = () => { W = canvas.clientWidth; H = canvas.clientHeight; renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix(); };
  new ResizeObserver(resize).observe(canvas); resize();
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (audio) audio.master.gain.setTargetAtTime(wantSound && visible ? .5 : 0, audio.ctx.currentTime, .4); }).observe(sec);
  const bar = document.getElementById('jbar'), step = document.getElementById('jstep'), intro = document.getElementById('jintro');
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  addEventListener('pointermove', e => { mouse.x = e.clientX / innerWidth - .5; mouse.y = e.clientY / innerHeight - .5; });
  const clock = new THREE.Clock();
  const tick = () => {
    requestAnimationFrame(tick);
    if (!visible) return;
    const t = clock.getElapsedTime();
    const r = sec.getBoundingClientRect(), span = r.height - innerHeight;
    const target = Math.min(1, Math.max(0, -r.top / span));
    prog += (target - prog) * .08;
    const camZ = prog * L, vz = Math.abs(camZ - lastZ); lastZ = camZ;
    mouse.sx += (mouse.x - mouse.sx) * .05; mouse.sy += (mouse.y - mouse.sy) * .05;
    camera.position.set(pathX(camZ) + mouse.sx * 1.4, 2.6 - mouse.sy * .6, -camZ);
    const rz = camZ + AHEAD, lift = Math.max(0, (prog - .9) / .1) * 3;
    ring.position.set(pathX(rz), 2.3 + Math.sin(t * 1.2) * .18 + lift, -rz);
    ring.rotation.z = -t * .35 - camZ * .05;
    ring.userData.inner.rotation.x = Math.sin(t * .6) * .4;
    camera.lookAt(pathX(rz + 6), 2.2 + lift * .4, -rz - 6);
    U.uRing.value.copy(ring.position);
    const prevW = waveT; waveT = (t % 3.4) / 3.4; if (waveT < prevW) ping();
    U.uWave.value = waveT * 34;
    if (audio && wantSound) audio.f.frequency.setTargetAtTime(380 + Math.min(vz * 2500, 2200), audio.ctx.currentTime, .15);
    renderer.render(scene, camera);
    place(camZ, W, H);
    bar.style.transform = `scaleX(${prog})`;
    step.textContent = '0' + Math.min(5, 1 + Math.floor(prog * 5));
    intro.style.opacity = prog < .03 ? 1 : 0;
  };
  tick();
} catch (err) { console.warn('Recorrido 3D desactivado:', err); sec.classList.add('j-off'); }

}
