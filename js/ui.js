/* =========================================================
   ui.js — interaction layer
   No dependencies. Everything degrades gracefully.

   1.  Preloader
   2.  Custom cursor + magnetic buttons
   3.  Nav: sticky, pill, scroll-spy, mobile drawer
   4.  Scroll progress
   5.  Reveal on scroll (staggered)
   6.  Counters + skill meters
   7.  Typewriter
   8.  Porthole 3D tilt
   9.  3D coverflow carousel
   10. Case-study modal (focus trap)
   11. Contact form (inline validation)
   12. Background motion toggle
   ========================================================= */
(function () {
  'use strict';

  const RM = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => RM.matches;
  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ======================================================
     1. PRELOADER
     ====================================================== */
  (function preloader() {
    const el = $('#preloader');
    const fill = $('#plFill');
    const pct = $('#plPct');
    if (!el) { startIntro(); return; }   // no loader in the DOM — start anyway

    let p = 0;
    let done = false;

    const set = (v) => {
      p = clamp(v, 0, 100);
      if (fill) fill.style.width = p + '%';
      if (pct) pct.textContent = Math.round(p) + '%';
    };

    // Creep upward so the bar always feels alive, then snap to 100 on load.
    const creep = setInterval(() => {
      if (done) return;
      set(p + (p < 60 ? 6 : p < 85 ? 2.2 : 0.5));
      if (p >= 96) clearInterval(creep);
    }, 130);

    const finish = () => {
      if (done) return;
      done = true;
      clearInterval(creep);
      set(100);
      setTimeout(() => {
        el.classList.add('is-done');
        document.body.classList.remove('is-locked');
        setTimeout(() => el.remove(), 700);
        startIntro();
      }, 380);
    };

    document.body.classList.add('is-locked');

    let oceanReady = false, windowReady = false;
    const maybe = () => { if (oceanReady && windowReady) finish(); };

    document.addEventListener('ocean:ready', () => { oceanReady = true; maybe(); });
    window.addEventListener('load', () => { windowReady = true; maybe(); });

    // Hard ceiling — never trap the user behind a loader.
    setTimeout(finish, 4200);
  })();

  function startIntro() {
    typewriter();
    document.dispatchEvent(new CustomEvent('intro:start'));
  }

  /* ======================================================
     2. CUSTOM CURSOR + MAGNETIC BUTTONS
     ====================================================== */
  (function cursor() {
    const el = $('#cursor');
    if (!el || window.matchMedia('(pointer: coarse)').matches || reduced()) return;

    const dot = $('.cursor__dot', el);
    const ring = $('.cursor__ring', el);
    let mx = 0, my = 0, dx = 0, dy = 0, rx = 0, ry = 0, on = false;

    window.addEventListener('pointermove', (e) => {
      mx = e.clientX; my = e.clientY;
      if (!on) { on = true; el.classList.add('is-on'); dx = rx = mx; dy = ry = my; }
    }, { passive: true });

    document.addEventListener('pointerleave', () => el.classList.remove('is-on'));
    document.addEventListener('pointerenter', () => on && el.classList.add('is-on'));

    const HOT = 'a, button, input, textarea, [data-magnetic], .pcard.is-active, .cf__stage';
    document.addEventListener('pointerover', (e) => {
      if (e.target.closest && e.target.closest(HOT)) el.classList.add('is-hot');
    });
    document.addEventListener('pointerout', (e) => {
      if (e.target.closest && e.target.closest(HOT)) el.classList.remove('is-hot');
    });

    (function loop() {
      dx = lerp(dx, mx, 0.85); dy = lerp(dy, my, 0.85);
      rx = lerp(rx, mx, 0.18); ry = lerp(ry, my, 0.18);
      dot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%,-50%)`;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
  })();

  (function magnetic() {
    if (window.matchMedia('(pointer: coarse)').matches || reduced()) return;
    $$('[data-magnetic]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.24;
        const y = (e.clientY - r.top - r.height / 2) * 0.34;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  })();

  /* ======================================================
     3. NAV
     ====================================================== */
  (function nav() {
    const nav = $('#nav');
    const links = $$('.nav__link');
    const pill = $('#navPill');
    const burger = $('#burger');
    const drawer = $('#navLinks');

    const onScroll = () => nav.classList.toggle('is-stuck', window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    /* -- mobile drawer -- */
    const closeDrawer = () => {
      drawer.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Open menu');
      document.body.classList.remove('is-locked');
    };

    burger.addEventListener('click', () => {
      const open = burger.getAttribute('aria-expanded') === 'true';
      if (open) return closeDrawer();
      drawer.classList.add('is-open');
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Close menu');
      document.body.classList.add('is-locked');
    });

    links.forEach((l) => l.addEventListener('click', closeDrawer));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        closeDrawer(); burger.focus();
      }
    });

    /* -- sliding pill (desktop) -- */
    const movePill = (target) => {
      if (!pill || !target || window.innerWidth < 1024) return;
      pill.style.width = target.offsetWidth + 'px';
      pill.style.transform = `translate(${target.offsetLeft}px, -50%)`;
      pill.style.opacity = '1';
    };

    /* -- scroll-spy -- */
    const sections = links
      .map((l) => ({ link: l, el: $(l.getAttribute('href')) }))
      .filter((s) => s.el);

    let active = null;
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const match = sections.find((s) => s.el === en.target);
        if (!match || match.link === active) return;
        links.forEach((l) => l.classList.remove('is-active'));
        match.link.classList.add('is-active');
        active = match.link;
        movePill(match.link);
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach((s) => spy.observe(s.el));

    links.forEach((l) => {
      l.addEventListener('pointerenter', () => movePill(l));
      l.addEventListener('focus', () => movePill(l));
    });
    $('.nav__links')?.addEventListener('pointerleave', () => active && movePill(active));

    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024) { closeDrawer(); active && movePill(active); }
      else if (pill) pill.style.opacity = '0';
    }, { passive: true });
  })();

  /* ======================================================
     4. SCROLL ENGINE
     ------------------------------------------------------
     One rAF loop owns every scroll-linked value, so the
     handlers stay cheap and nothing reads layout twice:

       bar width           progress rail at the top
       --sp on :root       0..1 document progress
       --sv on :root       smoothed velocity, ~-1..1
       --py on [data-parallax]  per-element offset
       --p  on [data-track]     0..1 own viewport progress

     The loop parks itself once the page is still and wakes
     on the next scroll or resize.
     ====================================================== */
  (function scrollEngine() {
    const bar = $('#scrollBar');
    const root = document.documentElement;
    const layers = $$('[data-parallax]').map((el) => ({
      el,
      speed: parseFloat(el.dataset.parallax) || 0,
      last: null,
    }));
    const tracks = $$('[data-track]').map((el) => ({ el, last: null }));

    // Reduced motion: paint the static values once, then stay out of the way.
    if (reduced()) {
      const max = root.scrollHeight - window.innerHeight;
      const sp = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
      if (bar) bar.style.width = sp * 100 + '%';
      root.style.setProperty('--sp', sp.toFixed(4));
      root.style.setProperty('--sv', '0');
      tracks.forEach((t) => t.el.style.setProperty('--p', '1'));
      return;
    }

    let raf = 0;
    let prevY = window.scrollY;
    let vel = 0;          // smoothed, in px/frame
    let idle = 0;         // frames with nothing left to animate

    const frame = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;
      const max = root.scrollHeight - vh;
      const sp = max > 0 ? clamp(y / max, 0, 1) : 0;

      // velocity: raw delta smoothed, then normalised against a 60px/frame cap
      const raw = y - prevY;
      prevY = y;
      vel = lerp(vel, raw, 0.18);
      const sv = clamp(vel / 60, -1, 1);

      if (bar) bar.style.width = sp * 100 + '%';
      root.style.setProperty('--sp', sp.toFixed(4));
      root.style.setProperty('--sv', sv.toFixed(4));

      // parallax — offset relative to the element's own centre, so layers
      // separate symmetrically instead of all sliding one way.
      for (const l of layers) {
        const r = l.el.getBoundingClientRect();
        const centre = r.top + r.height / 2 - vh / 2;
        const py = Math.round(-centre * l.speed);
        if (py !== l.last) {
          l.last = py;
          l.el.style.setProperty('--py', py + 'px');
        }
      }

      // per-section progress: 0 as the top edge enters, 1 once it clears
      for (const t of tracks) {
        const r = t.el.getBoundingClientRect();
        const p = clamp(1 - r.top / vh, 0, 1);
        const q = p.toFixed(3);
        if (q !== t.last) {
          t.last = q;
          t.el.style.setProperty('--p', q);
        }
      }

      // Park the loop once motion has actually settled.
      if (Math.abs(vel) < 0.05 && Math.abs(raw) < 0.5) {
        if (++idle > 8) { raf = 0; vel = 0; root.style.setProperty('--sv', '0'); return; }
      } else {
        idle = 0;
      }
      raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      idle = 0;
      if (!raf) raf = requestAnimationFrame(frame);
    };

    window.addEventListener('scroll', wake, { passive: true });
    window.addEventListener('resize', wake, { passive: true });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) wake(); });
    wake();
  })();

  /* ======================================================
     5. REVEAL ON SCROLL
     ====================================================== */
  (function reveal() {
    const items = $$('[data-reveal]');
    const staggerItems = $$('[data-stagger]');
    if (!items.length && !staggerItems.length) return;

    if (reduced() || !('IntersectionObserver' in window)) {
      items.forEach((i) => i.classList.add('is-in'));
      staggerItems.forEach((i) => i.classList.add('is-in'));
      return;
    }

    // Stagger siblings so groups cascade instead of popping together.
    const groups = new Map();
    items.forEach((el) => {
      const key = el.parentElement;
      const arr = groups.get(key) || [];
      arr.push(el);
      groups.set(key, arr);
    });
    groups.forEach((arr) => arr.forEach((el, i) => el.style.setProperty('--rd', Math.min(i * 70, 350) + 'ms')));

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        obs.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    items.forEach((i) => io.observe(i));
    staggerItems.forEach((i) => io.observe(i));
  })();

  /* ======================================================
     6. COUNTERS + SKILL METERS
     ====================================================== */
  (function counters() {
    const nums = $$('.stat__num');
    if (!nums.length) return;

    const run = (el) => {
      const target = parseFloat(el.dataset.count) || 0;
      const suffix = el.dataset.suffix || '';
      if (reduced()) { el.textContent = target + suffix; return; }

      const dur = 1400;
      const t0 = performance.now();
      const step = (now) => {
        const p = clamp((now - t0) / dur, 0, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const io = new IntersectionObserver((es, obs) => {
      es.forEach((e) => { if (e.isIntersecting) { run(e.target); obs.unobserve(e.target); } });
    }, { threshold: 0.5 });
    nums.forEach((n) => io.observe(n));
  })();

  (function meters() {
    const list = $$('.meter');
    if (!list.length) return;

    const io = new IntersectionObserver((es, obs) => {
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const lvl = clamp(parseInt(el.dataset.level, 10) || 0, 0, 100);
        const fill = $('.meter__fill', el);
        // a11y: expose the value, not just the bar
        el.setAttribute('role', 'meter');
        el.setAttribute('aria-valuenow', String(lvl));
        el.setAttribute('aria-valuemin', '0');
        el.setAttribute('aria-valuemax', '100');
        el.setAttribute('aria-label', ($('.meter__name', el)?.textContent || 'skill') + ' proficiency');
        requestAnimationFrame(() => { if (fill) fill.style.width = lvl + '%'; });
        obs.unobserve(el);
      });
    }, { threshold: 0.35 });

    list.forEach((m) => io.observe(m));
  })();

  /* ======================================================
     7. TYPEWRITER
     ====================================================== */
  const PHRASES = [
    'cross-platform mobile apps.',
    'machine learning pipelines.',
    'REST APIs that scale.',
    'automation that saves hours.',
    'things people actually use.',
  ];

  function typewriter() {
    const el = $('#typed');
    if (!el) return;

    if (reduced()) { el.textContent = PHRASES[0]; return; }

    let pi = 0, ci = 0, deleting = false;

    const step = () => {
      const word = PHRASES[pi];
      ci += deleting ? -1 : 1;
      el.textContent = word.slice(0, ci);

      let wait = deleting ? 34 : 62;
      if (!deleting && ci === word.length) { wait = 1700; deleting = true; }
      else if (deleting && ci === 0) { deleting = false; pi = (pi + 1) % PHRASES.length; wait = 320; }

      setTimeout(step, wait);
    };
    step();
  }

  /* ======================================================
     8. PORTHOLE 3D TILT
     ====================================================== */
  (function porthole() {
    const el = $('#porthole');
    if (!el || window.matchMedia('(pointer: coarse)').matches || reduced()) return;

    const wrap = el.parentElement;
    const chips = $$('.chip', el);

    wrap.addEventListener('pointermove', (e) => {
      const r = wrap.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `rotateY(${x * 17}deg) rotateX(${-y * 17}deg) translateZ(14px)`;
      chips.forEach((c) => {
        const d = parseFloat(c.dataset.depth) || 40;
        c.style.transform = `translate3d(${x * d}px, ${y * d * 0.6}px, ${d}px)`;
      });
    });

    wrap.addEventListener('pointerleave', () => {
      el.style.transform = '';
      chips.forEach((c) => { c.style.transform = ''; });
    });
  })();

  /* ======================================================
     9. 3D COVERFLOW CAROUSEL
     ------------------------------------------------------
     Each project is its own preserve-3d division. Cards sit
     on an arc via translateX / translateZ / rotateY, and the
     inner layers get their own translateZ for real parallax.
     ====================================================== */
  (function coverflow() {
    const stage = $('#cfStage');
    const rail = $('#cfRail');
    const cards = $$('.pcard', rail);
    const dotsWrap = $('#cfDots');
    const prev = $('#cfPrev');
    const next = $('#cfNext');
    if (!stage || !cards.length) return;

    const N = cards.length;
    let pos = 0;          // continuous position (float)
    let target = 0;       // snap target (int)
    let dragging = false, moved = false;
    let startX = 0, startPos = 0, lastX = 0, velocity = 0, lastT = 0;
    let tiltX = 0, tiltY = 0, tiltXT = 0, tiltYT = 0;

    /* -- responsive geometry -- */
    let SPACING = 320, DEPTH = 240, ANGLE = 42;
    const measure = () => {
      const w = stage.clientWidth;
      const cardW = cards[0].offsetWidth;
      if (w < 640) { SPACING = cardW * 0.62; DEPTH = 190; ANGLE = 38; }
      else if (w < 1024) { SPACING = cardW * 0.72; DEPTH = 230; ANGLE = 42; }
      else { SPACING = cardW * 0.80; DEPTH = 270; ANGLE = 45; }
    };
    measure();
    window.addEventListener('resize', () => { measure(); render(); }, { passive: true });

    /* -- dots -- */
    cards.forEach((c, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'cf__dot';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', `Project ${i + 1}: ${$('.pcard__title', c)?.textContent || ''}`);
      b.addEventListener('click', () => go(i));
      dotsWrap.appendChild(b);
    });
    const dots = $$('.cf__dot', dotsWrap);

    // Cache per-card queries once — render() runs every frame.
    const meta = cards.map((c) => ({
      layers: $$('[data-z]', c).map((el) => ({ el, d: parseFloat(el.dataset.z) || 0 })),
      focusables: $$('button, a', c),
      wasActive: null,
    }));
    let lastIdx = -1;

    /* -- per-frame transform -- */
    function render() {
      cards.forEach((card, i) => {
        const m = meta[i];
        const o = i - pos;
        const a = Math.abs(o);
        const dir = Math.sign(o);

        const x = o * SPACING * (1 + a * 0.05);
        const z = -a * DEPTH;
        const ry = -clamp(o, -1.6, 1.6) * ANGLE;
        const scale = Math.max(1 - a * 0.11, 0.66);
        const op = a > 2.4 ? 0 : clamp(1 - a * 0.26, 0, 1);

        card.style.transform =
          `translate(-50%, -50%) translate3d(${x}px, ${a * 12}px, ${z}px) ` +
          `rotateY(${ry}deg) rotateZ(${dir * a * 1.2}deg) scale(${scale})`;
        card.style.opacity = op;
        card.style.zIndex = String(200 - Math.round(a * 12));
        // Side cards stay hit-testable so they can be clicked forward; only
        // fully faded ones drop out of the hit test.
        card.style.pointerEvents = op > 0.06 ? 'auto' : 'none';

        // Content of off-screen cards stays in the a11y tree and stays tabbable —
        // tabbing to a card brings it forward (see focusin below). Only fully
        // faded cards drop out, since they cannot be brought forward visually.
        const reachable = op > 0.06;
        if (m.reachable !== reachable) {
          m.reachable = reachable;
          m.focusables.forEach((f) => { f.tabIndex = reachable ? 0 : -1; });
        }

        const isActive = a < 0.5;
        if (m.wasActive === isActive) return;      // state-change work only
        m.wasActive = isActive;

        card.classList.toggle('is-active', isActive);

        // inner depth layers — only on the front card, keeps the compositor cheap
        m.layers.forEach((l) => {
          l.el.style.transform = isActive ? `translateZ(${l.d}px)` : 'translateZ(0)';
        });

        // Swallow pointer events on a side card's controls so a click falls
        // through to the card and brings it forward instead of firing its CTA.
        m.focusables.forEach((f) => { f.style.pointerEvents = isActive ? '' : 'none'; });
      });

      // stage tilt from pointer
      rail.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;

      const idx = Math.round(clamp(pos, 0, N - 1));
      if (idx === lastIdx) return;
      lastIdx = idx;
      dots.forEach((d, i) => d.setAttribute('aria-selected', String(i === idx)));
      if (prev) prev.disabled = idx <= 0;
      if (next) next.disabled = idx >= N - 1;
      stage.setAttribute('aria-label', `Projects carousel, item ${idx + 1} of ${N}: ${$('.pcard__title', cards[idx])?.textContent || ''}`);
    }

    /* -- animation loop (spring toward target) -- */
    let raf = 0;
    function loop() {
      const k = reduced() ? 1 : 0.14;
      pos = lerp(pos, target, k);
      tiltX = lerp(tiltX, tiltXT, 0.09);
      tiltY = lerp(tiltY, tiltYT, 0.09);

      render();

      const settled = Math.abs(pos - target) < 0.0008 &&
                      Math.abs(tiltX - tiltXT) < 0.02 && Math.abs(tiltY - tiltYT) < 0.02;
      if (settled && !dragging) { pos = target; render(); raf = 0; return; }
      raf = requestAnimationFrame(loop);
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };

    function go(i) {
      target = clamp(i, 0, N - 1);
      kick();
    }

    /* -- pointer drag / swipe -- */
    stage.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button, a')) return;   // let card CTAs work
      dragging = true;
      moved = false;
      stage.classList.add('is-dragging');
      stage.setPointerCapture?.(e.pointerId);
      startX = lastX = e.clientX;
      startPos = pos;
      velocity = 0;
      lastT = performance.now();
      kick();
    });

    stage.addEventListener('pointermove', (e) => {
      // hover tilt when not dragging
      if (!dragging) {
        if (window.matchMedia('(pointer: coarse)').matches || reduced()) return;
        const r = stage.getBoundingClientRect();
        tiltYT = ((e.clientX - r.left) / r.width - 0.5) * 9;
        tiltXT = -((e.clientY - r.top) / r.height - 0.5) * 7;
        kick();
        return;
      }

      const dx = e.clientX - startX;
      if (Math.abs(dx) > 6) moved = true;          // so a drag never counts as a click
      pos = startPos - dx / SPACING;
      pos = clamp(pos, -0.55, N - 1 + 0.55);      // rubber-band at the ends

      const now = performance.now();
      const dt = Math.max(now - lastT, 1);
      velocity = (e.clientX - lastX) / dt;
      lastX = e.clientX; lastT = now;
      render();
    });

    const endDrag = (e) => {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove('is-dragging');
      stage.releasePointerCapture?.(e.pointerId);
      // flick: carry momentum into the snap decision
      const throwDist = -velocity * 260 / SPACING;
      target = clamp(Math.round(pos + clamp(throwDist, -1.2, 1.2)), 0, N - 1);
      kick();
    };
    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);
    stage.addEventListener('pointerleave', (e) => {
      if (dragging) endDrag(e);
      tiltXT = tiltYT = 0; kick();
    });

    /* -- keyboard focus follows the carousel --
       Every card stays tabbable so a screen-reader / keyboard user can reach all
       three projects. Tabbing into a side card slides it to the front so what is
       focused is also what is visible. */
    stage.addEventListener('focusin', (e) => {
      const card = e.target.closest('.pcard');
      if (!card) return;
      const i = cards.indexOf(card);
      if (i >= 0 && Math.abs(i - target) > 0.01) go(i);
    });

    /* -- keyboard -- */
    stage.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(Math.round(target) - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); go(Math.round(target) + 1); }
      else if (e.key === 'Home') { e.preventDefault(); go(0); }
      else if (e.key === 'End') { e.preventDefault(); go(N - 1); }
    });

    prev?.addEventListener('click', () => go(Math.round(target) - 1));
    next?.addEventListener('click', () => go(Math.round(target) + 1));

    // clicking a side card brings it forward
    cards.forEach((c, i) => {
      c.addEventListener('click', (e) => {
        if (moved) return;
        if (Math.abs(i - pos) > 0.5 && !e.target.closest('button, a')) go(i);
      });
    });

    render();
  })();

  /* ======================================================
     10. CASE-STUDY MODAL
     ====================================================== */
  const CASES = {
    p1: {
      kicker: 'Full-stack · Flutter + Django',
      title: 'StudentsConnect',
      sub: 'Smart Hostel Leave Management System — replacing paper slips with a verified digital workflow.',
      blocks: [
        { h: 'The problem', p: 'Hostel leave ran on paper: students chased wardens for signatures, parents were never reliably informed, and there was no audit trail of who left campus or when they returned.' },
        { h: 'What I built', list: [
          'Role-based approval flow for students, wardens and parents',
          'QR-based entry/exit verification at the gate',
          'Automatic SMS to parents the moment leave status changes',
          'Location verification and live leave-history analytics',
        ] },
        { h: 'Mobile (Flutter)', list: [
          'Provider for state management',
          'mobile_scanner + qr_flutter for QR issue & scan',
          'flutter_map + geolocator for location checks',
          'fl_chart for attendance analytics',
          'dio / http + shared_preferences',
        ] },
        { h: 'Backend (Django)', list: [
          'Django REST Framework API layer',
          'Django Channels (WebSockets) for live approval status',
          'JWT auth with role-based access control',
          'Gunicorn / Uvicorn / Daphne serving',
          'SQLite in dev, PostgreSQL / MySQL ready',
        ] },
        { h: 'Integrations', p: 'Fast2SMS gateway for parent notifications; Django Allauth / dj-rest-auth for account flows.' },
        { h: 'Outcome', p: 'A single cross-platform app (Android + Web) that removes the paper trail entirely and gives wardens a real-time view of who is on and off campus.' },
      ],
    },
    p2: {
      kicker: 'AI platform · React + FastAPI',
      title: 'AI Career Assistant',
      sub: 'Resume analysis, skill-gap detection and personalised career guidance.',
      blocks: [
        { h: 'The problem', p: 'Students get generic career advice. What they actually need is a specific answer to "given this resume and this target role, what should I learn next?"' },
        { h: 'What I built', list: [
          'NLP resume parsing and structured skill extraction',
          'Skill-gap scoring against target job profiles',
          'Personalised, ranked learning recommendations',
          'Interactive dashboard tracking progress over time',
        ] },
        { h: 'Stack', list: ['React front-end', 'FastAPI service layer', 'Python NLP pipeline', 'Chart-driven dashboard'] },
        { h: 'What I learned', p: 'Recommendation quality lived or died on preprocessing. Normalising skill vocabulary before matching moved results more than any change to the scoring itself.' },
      ],
    },
    p3: {
      kicker: 'Machine learning · Automation',
      title: 'Spam Detection Engine',
      sub: 'A ~96%-accurate classifier wired into a zero-touch n8n email pipeline.',
      blocks: [
        { h: 'The problem', p: 'Manual inbox triage is repetitive, error-prone work — exactly the kind of task that should be handed to a model and a workflow engine.' },
        { h: 'What I built', list: [
          'Text-preprocessing and feature pipeline over an email corpus',
          'scikit-learn classifier reaching ~96% prediction accuracy',
          'Flask service exposing the model for inference',
          'n8n workflow that ingests, classifies, labels and routes mail automatically',
        ] },
        { h: 'Stack', list: ['Python', 'scikit-learn', 'Pandas', 'Flask', 'n8n', 'NLP feature extraction'] },
        { h: 'Outcome', p: 'Inbound mail is categorised and filed without a human in the loop; the Flask endpoint means the same model can be reused by any other service.' },
      ],
    },
  };

  (function modal() {
    const modal = $('#modal');
    const body = $('#modalBody');
    if (!modal) return;

    let lastFocus = null;

    const render = (key) => {
      const c = CASES[key];
      if (!c) return;
      const blocks = c.blocks.map((b) => `
        <div class="ms-item">
          <h4>${b.h}</h4>
          ${b.p ? `<p>${b.p}</p>` : ''}
          ${b.list ? `<ul>${b.list.map((i) => `<li>${i}</li>`).join('')}</ul>` : ''}
        </div>`).join('');

      body.innerHTML = `
        <p class="ms-kicker">${c.kicker}</p>
        <h3 class="ms-title" id="modalTitle">${c.title}</h3>
        <p class="ms-sub">${c.sub}</p>
        <div class="ms-grid">${blocks}</div>
      `;
    };

    const open = (key, trigger) => {
      lastFocus = trigger || document.activeElement;
      render(key);
      modal.hidden = false;
      document.body.classList.add('is-locked');
      requestAnimationFrame(() => modal.classList.add('is-open'));
      $('.modal__close', modal)?.focus();
    };

    const close = () => {
      modal.classList.remove('is-open');
      document.body.classList.remove('is-locked');
      setTimeout(() => { modal.hidden = true; lastFocus?.focus(); }, 260);
    };

    document.addEventListener('click', (e) => {
      const t = e.target.closest('[data-open]');
      if (t) { e.preventDefault(); open(t.dataset.open, t); return; }
      if (e.target.closest('[data-close]')) close();
    });

    document.addEventListener('keydown', (e) => {
      if (modal.hidden) return;
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab') return;

      // focus trap
      const f = $$('button, a[href], input, textarea, [tabindex]:not([tabindex="-1"])', modal)
        .filter((el) => el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  })();

  /* ======================================================
     11. CONTACT FORM
     ====================================================== */
  (function form() {
    const f = $('#contactForm');
    if (!f) return;

    const note = $('#formNote');
    const btn = $('#cSubmit');

    const RULES = {
      cName: (v) => (v.trim().length >= 2 ? '' : 'Please enter your name (at least 2 characters).'),
      cEmail: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter a valid email, e.g. you@example.com'),
      cMsg: (v) => (v.trim().length >= 10 ? '' : 'Tell me a little more — at least 10 characters.'),
    };

    const setError = (id, msg) => {
      const input = $('#' + id);
      const field = input.closest('.field');
      const err = $('#' + id + 'Err');
      field.classList.toggle('has-error', !!msg);
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (err) err.textContent = msg;
      return !msg;
    };

    // validate on blur, not on keystroke
    Object.keys(RULES).forEach((id) => {
      const input = $('#' + id);
      input.addEventListener('blur', () => setError(id, RULES[id](input.value)));
      input.addEventListener('input', () => {
        if (input.closest('.field').classList.contains('has-error')) {
          setError(id, RULES[id](input.value));
        }
      });
    });

    f.addEventListener('submit', (e) => {
      e.preventDefault();
      note.textContent = '';
      note.className = 'form-note';

      let firstBad = null;
      Object.keys(RULES).forEach((id) => {
        const ok = setError(id, RULES[id]($('#' + id).value));
        if (!ok && !firstBad) firstBad = $('#' + id);
      });

      if (firstBad) {
        firstBad.focus();
        note.textContent = 'Please fix the highlighted fields above.';
        note.classList.add('is-bad');
        return;
      }

      btn.classList.add('is-loading');

      // No backend here — hand off to the visitor's mail client with everything pre-filled.
      const name = $('#cName').value.trim();
      const email = $('#cEmail').value.trim();
      const msg = $('#cMsg').value.trim();
      const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
      const bodyTxt = encodeURIComponent(`${msg}\n\n—\n${name}\n${email}`);

      setTimeout(() => {
        window.location.href = `mailto:gouthamiyadu05@gmail.com?subject=${subject}&body=${bodyTxt}`;
        btn.classList.remove('is-loading');
        note.textContent = 'Opening your email app with the message ready to send.';
        note.classList.add('is-ok');
        f.reset();
      }, 500);
    });
  })();

  /* ======================================================
     12. BACKGROUND MOTION TOGGLE
     ====================================================== */
  (function motionToggle() {
    const btn = $('#motionToggle');
    if (!btn) return;

    const apply = (paused) => {
      btn.setAttribute('aria-pressed', String(paused));
      btn.title = paused ? 'Resume background animation' : 'Pause background animation';
      window.__ocean?.setPaused(paused);
      document.documentElement.classList.toggle('is-motion-paused', paused);
    };

    // Honour the OS preference on first load.
    let paused = reduced();
    apply(paused);

    btn.addEventListener('click', () => { paused = !paused; apply(paused); });
    RM.addEventListener?.('change', (e) => { paused = e.matches; apply(paused); });
  })();

  /* ======================================================
     MISC
     ====================================================== */
  const yr = $('#yr');
  if (yr) yr.textContent = String(new Date().getFullYear());
})();
