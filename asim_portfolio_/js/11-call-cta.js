// "Let's talk" call button: click -> green handle fills the pill, phone rings, then the link opens
(() => {
  const GO_MS = 1000;     // wait this long (ms) before following the link, so the animation is seen
  const RESET_MS = 3000;  // go back to the resting state after this long (set 0 to stay green)
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('.call-cta').forEach(btn => {
    let busy = false;
    btn.addEventListener('click', event => {
      event.preventDefault();
      if (busy) return;
      busy = true;
      btn.classList.add('is-called');

      setTimeout(() => {
        const href = btn.getAttribute('href') || '';
        if (href.startsWith('#')) {
          const target = document.querySelector(href);
          if (target) target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
        } else if (href) {
          window.location.href = href;
        }
      }, reduced ? 0 : GO_MS);

      if (RESET_MS > 0) {
        setTimeout(() => {
          btn.classList.remove('is-called');
          busy = false;
        }, RESET_MS);
      }
    });
  });
})();
