// Projects carousel — plain JavaScript, no React / ogl needed
(function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const smooth = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };

  const BEND = 0.2;     // how far the ends flex (fraction of height)
  const SQUEEZE = 0.2;  // how much cards shrink while moving fast

  function init(root) {
    const track = root.querySelector('.fc__track');
    const cards = Array.from(root.querySelectorAll('.fc__card'));
    if (!track || !cards.length) return;

    const caption = document.createElement('div');
    caption.className = 'fc__caption';
    caption.innerHTML = '<span class="fc__title"></span><span class="fc__count"></span>';
    root.appendChild(caption);
    const titleEl = caption.querySelector('.fc__title');
    const countEl = caption.querySelector('.fc__count');

    root.tabIndex = 0;
    root.setAttribute('role', 'region');
    root.setAttribute('aria-roledescription', 'carousel');
    if (!root.getAttribute('aria-label')) root.setAttribute('aria-label', 'Projects');

    let centers = [], width = 1, height = 1;
    let pos = 0, goal = 0, vel = 0, energy = 0, lastPos = 0;
    let current = -1, raf = 0, last = 0, wheelTimer = 0;
    let drag = null, moved = false;

    const nearest = at => {
      let best = 0, d = Infinity;
      centers.forEach((c, i) => { const v = Math.abs(c - at); if (v < d) { d = v; best = i; } });
      return best;
    };
    const limit = v => clamp(v, centers[0], centers[centers.length - 1]);

    function setCaption(i) {
      const c = cards[i];
      const sub = c.dataset.subtitle ? `<span class="fc__sub">${c.dataset.subtitle}</span>` : '';
      const t = document.createElement('span');
      t.className = 'fc__title';
      t.innerHTML = (c.dataset.title || c.getAttribute('aria-label') || '') + sub;
      caption.replaceChild(t, caption.firstElementChild);
      countEl.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(cards.length).padStart(2, '0');
      cards.forEach((el, k) => k === i ? el.setAttribute('aria-current', 'true') : el.removeAttribute('aria-current'));
    }

    function draw() {
      const shrink = 1 - SQUEEZE * energy;
      cards.forEach((card, i) => {
        const rel = centers[i] - pos;
        const u = rel / (width / 2);
        const ramp = smooth((Math.abs(u) - 0.12) / 0.85);
        const side = Math.sign(u);
        const y = -side * ramp * BEND * height;   // right end up, left end down
        const rot = -side * ramp * 6;
        card.style.transform =
          `translate(-50%, -50%) translate3d(${rel.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg) scale(${shrink.toFixed(3)})`;
      });
      const n = nearest(pos);
      if (n !== current) { current = n; setCaption(n); }
    }

    function frame(now) {
      raf = 0;
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      let moving = !!drag;

      if (!drag) {
        const k = 55, c = 2 * Math.sqrt(k);
        const steps = Math.ceil(dt / (1 / 240)), h = dt / steps;
        for (let s = 0; s < steps; s++) {
          vel += (k * (goal - pos) - c * vel) * h;
          pos += vel * h;
        }
        if (Math.abs(goal - pos) < 0.05 && Math.abs(vel) < 0.5) { pos = goal; vel = 0; }
        else moving = true;
      }

      const travel = Math.abs(pos - lastPos) / dt;
      lastPos = pos;
      const aim = reduced ? 0 : Math.min(travel / 2600, 1);
      energy += (aim - energy) * (1 - Math.exp(-dt / (aim > energy ? 0.07 : 0.35)));
      if (energy > 0.001) moving = true;

      draw();
      if (moving) raf = requestAnimationFrame(frame);
    }
    const wake = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };

    const goTo = i => {
      goal = centers[clamp(i, 0, cards.length - 1)];
      if (reduced) { pos = goal; vel = 0; draw(); return; }
      wake();
    };

    function measure() {
      width = root.clientWidth || 1;
      height = root.clientHeight || 1;
      const gap = parseFloat(getComputedStyle(root).getPropertyValue('--fc-gap')) || 12;
      let x = 0;
      const keep = current < 0 ? 0 : current;
      centers = cards.map(c => { const w = c.offsetWidth; const cx = x + w / 2; x += w + gap; return cx; });
      pos = goal = centers[keep];
      vel = 0;
      draw();
    }

    // Drag
    root.addEventListener('pointerdown', e => {
      if (e.button > 0) return;
      moved = false;
      drag = { x: e.clientX, y: e.clientY, start: pos, id: e.pointerId, touch: e.pointerType === 'touch', s: [{ x: e.clientX, t: performance.now() }] };
      if (Math.abs(vel) > 40) { goal = pos; vel = 0; }
    });
    root.addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      if (!moved) {
        if (drag.touch && Math.abs(e.clientY - drag.y) > 10 && Math.abs(e.clientY - drag.y) > Math.abs(dx)) { drag = null; return; }
        if (Math.abs(dx) > 5) {
          moved = true;
          drag.x = e.clientX; drag.start = pos;
          try { root.setPointerCapture(e.pointerId); } catch (_) {}
          root.setAttribute('data-dragging', '');
        }
      }
      if (moved) {
        const nx = e.clientX - drag.x;
        pos = clamp(drag.start - nx, centers[0] - 80, centers[centers.length - 1] + 80);
        goal = pos;
        const now = performance.now();
        drag.s.push({ x: e.clientX, t: now });
        while (drag.s.length > 2 && now - drag.s[0].t > 100) drag.s.shift();
        wake();
      }
    });
    const release = e => {
      if (!drag || (e && e.pointerId !== drag.id)) return;
      root.removeAttribute('data-dragging');
      if (moved) {
        const a = drag.s[0], b = drag.s[drag.s.length - 1];
        let v = 0;
        if (a && b && b.t > a.t && performance.now() - b.t < 70) v = -((b.x - a.x) / (b.t - a.t)) * 1000;
        vel = v;
        let i = nearest(limit(pos + v * 0.32));
        if (Math.abs(v) > 400 && i === nearest(pos)) i = clamp(i + (v > 0 ? 1 : -1), 0, cards.length - 1);
        drag = null;
        goTo(i);
      } else drag = null;
    };
    root.addEventListener('pointerup', release);
    root.addEventListener('pointercancel', release);

    // Click: first click on a side card centers it; click on the centered card opens its link
    cards.forEach((card, i) =>
      card.addEventListener('click', e => {
        if (moved) { e.preventDefault(); return; }
        if (i !== current) { e.preventDefault(); goTo(i); }
      })
    );

    // Horizontal wheel / trackpad only, so normal page scrolling still works
    root.addEventListener('wheel', e => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || e.ctrlKey) return;
      e.preventDefault();
      goal = clamp(goal + clamp(e.deltaX, -120, 120) * 1.25, centers[0], centers[centers.length - 1]);
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => goTo(nearest(goal)), 150);
      wake();
    }, { passive: false });

    // Keyboard
    root.addEventListener('keydown', e => {
      const i = nearest(goal);
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(i + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(i - 1); }
      else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
      else if (e.key === 'End') { e.preventDefault(); goTo(cards.length - 1); }
    });

    new ResizeObserver(measure).observe(root);
    measure();
    requestAnimationFrame(() => root.classList.add('is-ready'));
  }

  document.addEventListener('DOMContentLoaded', () => document.querySelectorAll('.fc').forEach(init));
})();
