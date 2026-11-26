// Rubber / gooey navigation — plain JavaScript, no React needed
(function () {
  const DROPS = 8;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // One shared SVG "goo" filter: blur, then sharpen the alpha so shapes melt together
  function addFilter() {
    if (document.getElementById('rubber-goo')) return;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.style.position = 'absolute';
    svg.innerHTML =
      '<defs><filter id="rubber-goo" x="-20%" y="-50%" width="140%" height="200%">' +
      '<feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur"/>' +
      '<feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"/>' +
      '</filter></defs>';
    document.body.appendChild(svg);
  }

  function init(nav) {
    const list = nav.querySelector('.rubber-nav__list');
    const links = Array.from(nav.querySelectorAll('.rubber-nav__link'));
    if (!list || !links.length) return;

    const goo = document.createElement('div');
    goo.className = 'rubber-nav__goo';
    const pill = document.createElement('span');
    pill.className = 'rubber-nav__pill';
    goo.appendChild(pill);
    nav.prepend(goo);

    let active = Math.max(0, links.findIndex(l => l.classList.contains('is-active')));

    // Position of a link relative to the nav box
    const box = link => {
      const n = nav.getBoundingClientRect();
      const r = link.getBoundingClientRect();
      return { left: r.left - n.left, width: r.width };
    };

    const place = (left, width) => {
      pill.style.left = left + 'px';
      pill.style.width = width + 'px';
    };

    const spray = (from, to) => {
      if (reduced) return;
      const y = nav.clientHeight / 2;
      for (let i = 0; i < DROPS; i++) {
        const d = document.createElement('span');
        const size = 6 + Math.random() * 8;
        d.className = 'rubber-nav__drop';
        d.style.width = d.style.height = size + 'px';
        d.style.top = y - size / 2 + 'px';
        d.style.left = from.left + Math.random() * from.width - size / 2 + 'px';
        goo.appendChild(d);
        const endX = to.left + Math.random() * to.width - parseFloat(d.style.left) - size / 2;
        const lift = (Math.random() - 0.5) * 36;
        d.animate(
          [
            { transform: 'translate(0, 0) scale(1)' },
            { transform: `translate(${endX * 0.5}px, ${lift}px) scale(1.1)`, offset: 0.5 },
            { transform: `translate(${endX}px, 0) scale(0.3)` }
          ],
          { duration: 450 + Math.random() * 250, easing: 'ease-in-out', fill: 'forwards' }
        ).onfinish = () => d.remove();
      }
    };

    const select = index => {
      if (index === active) return;
      const from = box(links[active]);
      const to = box(links[index]);

      // Stretch like rubber across both items, then snap to the new one
      if (!reduced) {
        const left = Math.min(from.left, to.left);
        const right = Math.max(from.left + from.width, to.left + to.width);
        place(left, right - left);
        setTimeout(() => place(to.left, to.width), 130);
      } else {
        place(to.left, to.width);
      }

      spray(from, to);
      links[active].classList.remove('is-active');
      links[index].classList.add('is-active');
      links[index].setAttribute('aria-current', 'page');
      links[active].removeAttribute('aria-current');
      active = index;
    };

    links.forEach((link, i) =>
      link.addEventListener('click', e => {
        if (link.getAttribute('href') === '#') e.preventDefault();
        select(i);
      })
    );

    // Initial position + keep correct on resize / font load
    const sync = () => {
      pill.style.transition = 'none';
      const b = box(links[active]);
      place(b.left, b.width);
      void pill.offsetWidth;
      pill.style.transition = '';
    };
    links[active].classList.add('is-active');
    sync();
    window.addEventListener('resize', sync);
    if (document.fonts) document.fonts.ready.then(sync);
  }

  document.addEventListener('DOMContentLoaded', () => {
    addFilter();
    document.querySelectorAll('.rubber-nav').forEach(init);
  });
})();
