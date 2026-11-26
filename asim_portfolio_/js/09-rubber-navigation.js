
(function () {
  const DROPS = 8;
  const reduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  function addFilter() {
    if (document.getElementById('rubber-goo')) return;

    const svg = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    );

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
    const links = Array.from(
      nav.querySelectorAll('.rubber-nav__link')
    );

    if (!list || !links.length) return;

    const goo = document.createElement('div');
    goo.className = 'rubber-nav__goo';

    const pill = document.createElement('span');
    pill.className = 'rubber-nav__pill';

    goo.appendChild(pill);
    nav.prepend(goo);

    let active = Math.max(
      0,
      links.findIndex(link => link.classList.contains('is-active'))
    );

    function box(link) {
      const n = nav.getBoundingClientRect();
      const r = link.getBoundingClientRect();

      return {
        left: r.left - n.left,
        width: r.width
      };
    }

    function place(left, width) {
      pill.style.left = left + 'px';
      pill.style.width = width + 'px';
    }

    function spray(from, to) {
      if (reduced) return;

      const y = nav.clientHeight / 2;

      for (let i = 0; i < DROPS; i++) {
        const d = document.createElement('span');
        const size = 6 + Math.random() * 8;

        d.className = 'rubber-nav__drop';
        d.style.width = size + 'px';
        d.style.height = size + 'px';
        d.style.top = y - size / 2 + 'px';

        const startX =
          from.left + Math.random() * from.width - size / 2;

        d.style.left = startX + 'px';
        goo.appendChild(d);

        const endX =
          to.left + Math.random() * to.width -
          startX - size / 2;

        const lift = (Math.random() - 0.5) * 36;

        d.animate(
          [
            { transform: 'translate(0,0) scale(1)' },
            {
              transform: `translate(${endX * .5}px,${lift}px) scale(1.1)`,
              offset: .5
            },
            {
              transform: `translate(${endX}px,0) scale(.3)`
            }
          ],
          {
            duration: 450 + Math.random() * 250,
            easing: 'ease-in-out',
            fill: 'forwards'
          }
        ).onfinish = () => d.remove();
      }
    }

    function select(index) {
      if (index === active) return;

      const from = box(links[active]);
      const to = box(links[index]);

      if (!reduced) {
        const left = Math.min(from.left, to.left);
        const right = Math.max(
          from.left + from.width,
          to.left + to.width
        );

        place(left, right - left);

        setTimeout(() => {
          place(to.left, to.width);
        }, 130);
      } else {
        place(to.left, to.width);
      }

      spray(from, to);

      links[active].classList.remove('is-active');
      links[active].removeAttribute('aria-current');

      links[index].classList.add('is-active');
      links[index].setAttribute('aria-current', 'page');

      active = index;
    }

    links.forEach((link, i) => {
      link.addEventListener('click', () => select(i));
    });

    function sync() {
      pill.style.transition = 'none';

      const b = box(links[active]);
      place(b.left, b.width);

      void pill.offsetWidth;
      pill.style.transition = '';
    }

    links[active].classList.add('is-active');
    links[active].setAttribute('aria-current', 'page');

    sync();

    window.addEventListener('resize', sync);

    if (document.fonts) {
      document.fonts.ready.then(sync);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    addFilter();

    document.querySelectorAll('.rubber-nav').forEach(init);
  });
})();
