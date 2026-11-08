/* SUDO MEDIA — animated landing page.
   Vanilla JS, no dependencies. Every effect respects prefers-reduced-motion. */
(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const BEAT = 60 / 174 * 2; // seconds: half-time pulse at 174 BPM

  /* ---------- Intro ---------- */
  const startPage = () => {
    root.classList.add('intro-out', 'ready');
    try { sessionStorage.setItem('sudo-intro', '1'); } catch (e) {}
  };
  if (root.classList.contains('intro-play')) {
    const minTime = new Promise(r => setTimeout(r, 1500));
    const loaded = new Promise(r => (document.readyState === 'complete' ? r() : window.addEventListener('load', r, { once: true })));
    const cap = new Promise(r => setTimeout(r, 3200)); // never hold the page hostage on slow networks
    Promise.race([Promise.all([minTime, loaded]), cap]).then(startPage);
  } else {
    requestAnimationFrame(startPage);
  }

  /* ---------- Smooth anchors (from the original script.js) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const el = document.querySelector(a.getAttribute('href'));
      if (el) { e.preventDefault(); el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); }
    });
  });

  /* ---------- Scroll progress + header state ---------- */
  const topbar = document.querySelector('.topbar');
  const progress = document.querySelector('.scroll-progress');
  let ticking = false;
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress && progress.style.setProperty('--progress', max > 0 ? (scrollY / max).toFixed(4) : 0);
    topbar && topbar.classList.toggle('is-scrolled', scrollY > 40);
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- Split headings into masked lines ---------- */
  document.querySelectorAll('.split').forEach(h => {
    const lines = [[]];
    [...h.childNodes].forEach(n => (n.nodeName === 'BR' ? lines.push([]) : lines[lines.length - 1].push(n)));
    h.textContent = '';
    lines.forEach((nodes, i) => {
      const ln = document.createElement('span');
      ln.className = 'ln';
      let inner;
      // Gradient <em> lines animate themselves so background-clip:text keeps working.
      if (nodes.length === 1 && nodes[0].nodeName === 'EM') inner = nodes[0];
      else { inner = document.createElement('span'); nodes.forEach(n => inner.appendChild(n)); }
      inner.classList.add('ln-in');
      inner.style.setProperty('--delay', `${i * 0.1}s`);
      ln.appendChild(inner);
      h.appendChild(ln);
    });
  });

  /* ---------- Reveal on scroll ---------- */
  const revealables = document.querySelectorAll('.reveal, .split');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    revealables.forEach(el => io.observe(el));
  } else {
    revealables.forEach(el => el.classList.add('is-in'));
  }

  /* ---------- Seamless loops: duplicate ticker / reel tracks ---------- */
  document.querySelectorAll('.ticker-track, .reel-track').forEach(track => {
    const kids = [...track.children];
    // Ensure each half is wider than the viewport, then double it for the -50% loop.
    let copies = 0;
    while (track.scrollWidth < innerWidth * 1.2 && copies < 4) {
      kids.forEach(k => track.appendChild(cloneQuiet(k)));
      copies++;
    }
    [...track.children].forEach(k => track.appendChild(cloneQuiet(k)));
  });
  function cloneQuiet(node) {
    const c = node.cloneNode(true);
    c.setAttribute('aria-hidden', 'true');
    if (c.matches('a')) c.tabIndex = -1;
    c.querySelectorAll('a').forEach(a => (a.tabIndex = -1));
    return c;
  }

  if (reduceMotion) return; // everything below is pure motion

  /* ---------- Hero: pointer parallax + glow ---------- */
  const hero = document.querySelector('.hero');
  const pointer = { x: 0.68, y: 0.45, tx: 0.68, ty: 0.45, active: 0 };
  if (hero && finePointer) {
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      pointer.tx = (e.clientX - r.left) / r.width;
      pointer.ty = (e.clientY - r.top) / r.height;
      pointer.active = 1;
    });
    hero.addEventListener('pointerleave', () => { pointer.active = 0; pointer.tx = 0.68; pointer.ty = 0.45; });
  }

  /* ---------- Hero: waveform canvas, pulsing at 174 BPM ---------- */
  const canvas = document.querySelector('.hero-canvas');
  const ctx = canvas && canvas.getContext('2d');
  let w = 0, h = 0, dpr = 1, heroVisible = true, raf = 0;
  const resize = () => {
    if (!canvas) return;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const LINES = innerWidth < 800 ? 12 : 20;
  const start = performance.now();

  const frame = now => {
    const t = (now - start) / 1000;
    // Ease the pointer for buttery parallax
    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;
    if (hero) {
      hero.style.setProperty('--mx', ((pointer.x - 0.5) * 2).toFixed(3));
      hero.style.setProperty('--my', ((pointer.y - 0.5) * 2).toFixed(3));
      hero.style.setProperty('--cx', `${(pointer.x * 100).toFixed(2)}%`);
      hero.style.setProperty('--cy', `${(pointer.y * 100).toFixed(2)}%`);
    }

    if (ctx && w) {
      ctx.clearRect(0, 0, w, h);
      const phase = (t % BEAT) / BEAT;
      const kick = Math.exp(-phase * 7);                  // sharp attack, fast decay
      const centreX = w < 800 ? w * 0.5 : w * 0.68;       // waves radiate from the 3D mark
      const baseY = w < 800 ? h * 0.42 : h * 0.62;
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, 'rgba(22,199,223,0)');
      grad.addColorStop(0.25, 'rgba(22,199,223,1)');
      grad.addColorStop(0.75, 'rgba(67,238,114,1)');
      grad.addColorStop(1, 'rgba(67,238,114,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1;

      for (let i = 0; i < LINES; i++) {
        const p = i / (LINES - 1);
        const amp = (16 + p * 54) * (0.75 + kick * 0.55);
        const spread = w * (0.16 + p * 0.22);
        const y0 = baseY + (p - 0.5) * h * 0.34;
        ctx.globalAlpha = 0.05 + (1 - Math.abs(p - 0.5) * 2) * 0.22;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 6) {
          const dx = (x - centreX) / spread;
          const env = Math.exp(-dx * dx);                 // energy concentrated around the mark
          const px = (x - pointer.x * w) / (w * 0.12);
          const bump = pointer.active ? Math.exp(-px * px) * 28 * (pointer.y - 0.5) : 0;
          const y = y0
            + Math.sin(x * 0.012 + t * 1.6 + i * 0.45) * amp * env
            + Math.sin(x * 0.031 - t * 2.3 + i) * amp * 0.35 * env
            + bump * env;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    raf = heroVisible && !document.hidden ? requestAnimationFrame(frame) : 0;
  };
  const kickOff = () => { if (!raf && heroVisible && !document.hidden) raf = requestAnimationFrame(frame); };

  if (canvas) {
    resize();
    let rt;
    addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 120); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => { heroVisible = en.isIntersecting; kickOff(); }).observe(hero);
    }
    document.addEventListener('visibilitychange', kickOff);
    kickOff();
  }

  if (!finePointer) return; // pointer-only effects below

  /* ---------- Tilt cards ---------- */
  document.querySelectorAll('.tilt').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.classList.add('is-tilting');
      card.style.setProperty('--ry', `${((x - 0.5) * 7).toFixed(2)}deg`);
      card.style.setProperty('--rx', `${((0.5 - y) * 7).toFixed(2)}deg`);
      card.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`);
      card.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`);
    });
    card.addEventListener('pointerleave', () => {
      card.classList.remove('is-tilting');
      card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg');
    });
  });

  /* ---------- Magnetic buttons ---------- */
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('pointermove', e => {
      const r = btn.getBoundingClientRect();
      btn.classList.add('is-pulling');
      btn.style.setProperty('--tx', `${((e.clientX - r.left - r.width / 2) * 0.25).toFixed(1)}px`);
      btn.style.setProperty('--ty', `${((e.clientY - r.top - r.height / 2) * 0.35).toFixed(1)}px`);
    });
    btn.addEventListener('pointerleave', () => {
      btn.classList.remove('is-pulling');
      btn.style.setProperty('--tx', '0px'); btn.style.setProperty('--ty', '0px');
    });
  });

  /* ---------- Service rows: floating artwork preview ---------- */
  const preview = document.querySelector('.service-preview');
  const previewImg = preview && preview.querySelector('img');
  if (preview) {
    const pos = { x: 0, y: 0, tx: 0, ty: 0 };
    let following = false;
    const follow = () => {
      pos.x += (pos.tx - pos.x) * 0.18; pos.y += (pos.ty - pos.y) * 0.18;
      preview.style.setProperty('--px', `${pos.x.toFixed(1)}px`);
      preview.style.setProperty('--py', `${pos.y.toFixed(1)}px`);
      if (following) requestAnimationFrame(follow);
    };
    document.querySelectorAll('.service-list > [data-preview]').forEach(row => {
      const img = new Image(); img.src = row.dataset.preview; // warm the cache
      row.addEventListener('pointerenter', e => {
        previewImg.src = row.dataset.preview;
        if (!following) { pos.x = pos.tx = e.clientX + 150; pos.y = pos.ty = e.clientY; following = true; follow(); }
        preview.classList.add('is-on');
      });
      row.addEventListener('pointermove', e => { pos.tx = e.clientX + 150; pos.ty = e.clientY; });
      row.addEventListener('pointerleave', () => preview.classList.remove('is-on'));
    });
    document.querySelector('.service-list').addEventListener('pointerleave', () => { following = false; });
  }
})();
