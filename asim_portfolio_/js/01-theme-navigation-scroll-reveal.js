(() => {
  const body = document.body;
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle.querySelector('.theme-icon');
  const savedTheme = localStorage.getItem('portfolio-theme');
  if (savedTheme === 'dark') body.classList.add('dark');
  const updateThemeIcon = () => { themeIcon.textContent = body.classList.contains('dark') ? '☀' : '☾'; };
  updateThemeIcon();
  themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark');
    localStorage.setItem('portfolio-theme', body.classList.contains('dark') ? 'dark' : 'light');
    updateThemeIcon();
  });
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  menuToggle.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }));
  // Gentle reveal as sections enter the viewport.
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  // Education bars animation

})();
