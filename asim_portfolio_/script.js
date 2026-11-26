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
    // ===== 3D CERTIFICATION CARD CAROUSEL =====

  const certCarousel = document.getElementById('certCarousel');

  if (certCarousel) {
    const stage = document.getElementById('certCarouselStage');
    const cards = [...stage.querySelectorAll('.cert-card')];

    const prevButton = document.getElementById('certPrev');
    const nextButton = document.getElementById('certNext');
    const replayButton = document.getElementById('certReplay');
    const dotsContainer = document.getElementById('certDots');

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let activeIndex = 0;
    let autoplayTimer = null;

    // Create navigation dots.
    cards.forEach((card, index) => {
      const dot = document.createElement('button');

      dot.type = 'button';
      dot.className = 'cert-dot';
      dot.setAttribute('aria-label', `Show certification ${index + 1}`);

      dot.addEventListener('click', () => {
        setActive(index);
        restartAutoplay();
      });

      dotsContainer.appendChild(dot);
    });

    const dots = [...dotsContainer.querySelectorAll('.cert-dot')];

    // Update 3D positions.
    function updateCarousel() {
      const spacing = Math.min(
        260,
        Math.max(130, stage.clientWidth * 0.24)
      );

      cards.forEach((card, index) => {
        let offset = index - activeIndex;

        // Shortest circular direction.
        if (offset > cards.length / 2) {
          offset -= cards.length;
        }

        if (offset < -cards.length / 2) {
          offset += cards.length;
        }

        const distance = Math.abs(offset);

        const positions = {
          x: offset * spacing,
          z: distance === 0 ? 0 : -115 * distance,
          rotate: offset * -24,
          scale: distance === 0 ? 1 : distance === 1 ? 0.84 : 0.68,
          opacity: distance === 0 ? 1 : distance === 1 ? 0.85 : 0.42
        };

        card.style.setProperty('--card-x', `${positions.x}px`);
        card.style.setProperty('--card-z', `${positions.z}px`);
        card.style.setProperty('--card-rotate', `${positions.rotate}deg`);
        card.style.setProperty('--card-scale', positions.scale);
        card.style.setProperty('--card-opacity', positions.opacity);
        card.style.setProperty('--card-index', 10 - distance);

        card.style.setProperty(
          '--card-visibility',
          distance > 2 ? 'hidden' : 'visible'
        );

        card.style.pointerEvents = distance <= 2 ? 'auto' : 'none';

        card.classList.toggle('is-active', distance === 0);

        card.setAttribute('aria-hidden', String(distance !== 0));

        card.addEventListener('click', () => {
          if (index !== activeIndex) {
            setActive(index);
            restartAutoplay();
          }
        }, { once: true });
      });

      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === activeIndex);
        dot.setAttribute('aria-pressed', String(index === activeIndex));
      });
    }

    // Change active card.
    function setActive(index) {
      activeIndex = (index + cards.length) % cards.length;
      updateCarousel();
    }

    function nextCard() {
      setActive(activeIndex + 1);
    }

    function previousCard() {
      setActive(activeIndex - 1);
    }

    // Automatic rotation.
    function stopAutoplay() {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }

    function startAutoplay() {
      stopAutoplay();

      if (reducedMotion) return;

      autoplayTimer = setInterval(() => {
        nextCard();
      }, 4000);
    }

    function restartAutoplay() {
      startAutoplay();
    }

    // Navigation controls.
    nextButton.addEventListener('click', () => {
      nextCard();
      restartAutoplay();
    });

    prevButton.addEventListener('click', () => {
      previousCard();
      restartAutoplay();
    });

    // Replay the complete carousel.
    replayButton.addEventListener('click', () => {
      setActive(0);
      restartAutoplay();
    });

    // Pause while the visitor interacts with the carousel.
    certCarousel.addEventListener('mouseenter', stopAutoplay);

    certCarousel.addEventListener('mouseleave', () => {
      startAutoplay();
    });

    certCarousel.addEventListener('focusin', stopAutoplay);

    certCarousel.addEventListener('focusout', event => {
      if (!certCarousel.contains(event.relatedTarget)) {
        startAutoplay();
      }
    });

    // Keyboard navigation.
    certCarousel.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight') {
        nextCard();
        restartAutoplay();
      }

      if (event.key === 'ArrowLeft') {
        previousCard();
        restartAutoplay();
      }
    });

    // Recalculate card spacing when the screen changes.
    window.addEventListener('resize', updateCarousel, {
      passive: true
    });

    // Initial setup.
    setActive(0);
    startAutoplay();
  }
const educationGraph = document.getElementById('educationGraph');
const educationReplay = document.getElementById('educationReplay');

if (educationGraph && educationReplay) {
  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  let educationPlayed = false;

  const playEducation = () => {
    educationGraph.classList.remove('is-running');

    // Restart animation
    void educationGraph.offsetWidth;

    educationGraph.classList.add('is-running');
    educationPlayed = true;
  };

  const educationObserver = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting) && !educationPlayed) {
      playEducation();
      educationObserver.disconnect();
    }
  }, { threshold: .28 });

  educationObserver.observe(educationGraph);

  educationReplay.addEventListener('click', playEducation);

  if (reducedMotion) {
    educationGraph.classList.add('is-running');
  }
}
  // Scroll progress indicator.
  const progressBar = document.getElementById('progressBar');
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
  document.getElementById('year').textContent = new Date().getFullYear();
      // Experience roadmap: scroll-driven, with decode text
  const rm = document.getElementById('roadmap');
  if (rm) {
    const HOP_MS = 1100;                         // marker travel time between dots
    const MILESTONES = [0.14, 0.40, 0.66, 0.90]; // dot positions along the road
    const CHARS = '01<>/\\{}[]#$%&*+=?ABCDEFGHJKMNPQRSTUVWXYZ'; // scramble characters
    const DEC = '.exp-date,.exp-type,h3,h4,li,p';
    const road = document.getElementById('rmRoad');
    const fill = document.getElementById('rmFill');
    const marker = document.getElementById('rmMarker');
    const nodes = [...rm.querySelectorAll('.rm-node')];
    const labels = [...rm.querySelectorAll('.rm-label')];
    const items = [...document.querySelectorAll('.exp-item')];
    const headEls = [...document.querySelectorAll('#experience .section-heading .eyebrow, #experience .section-heading h2, #experience .section-heading .section-lead')];
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const L = road.getTotalLength();
    let cur = 0, shown = -1, raf = 0, timers = [];
    fill.style.strokeDasharray = L;
    MILESTONES.forEach((m, i) => {
      const pt = road.getPointAtLength(L * m);
      nodes[i].setAttribute('cx', pt.x);
      nodes[i].setAttribute('cy', pt.y);
      labels[i].style.left = (pt.x / 600 * 100) + '%';
      labels[i].style.top = (pt.y / 340 * 100) + '%';
    });
    const render = p => {
      cur = p;
      fill.style.strokeDashoffset = L * (1 - p);
      const pt = road.getPointAtLength(L * p);
      marker.setAttribute('transform', `translate(${pt.x} ${pt.y})`);
      MILESTONES.forEach((m, i) => {
        const on = p >= m - 0.001;
        nodes[i].classList.toggle('on', on);
        labels[i].classList.toggle('on', on);
      });
    };
    const moveTo = target => {
      cancelAnimationFrame(raf);
      const from = cur, t0 = performance.now();
      const tick = now => {
        const t = Math.min((now - t0) / HOP_MS, 1);
        render(from + (target - from) * (1 - Math.pow(1 - t, 3))); // ease-out
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    // ---- decode helpers (keeps <em>/<br> structure intact) ----
    const prep = el => {
      if (el._tn) return;
      const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      el._tn = []; let n;
      while ((n = w.nextNode())) if (n.nodeValue.trim()) el._tn.push({ n, t: n.nodeValue });
      el._len = el._tn.reduce((s, o) => s + o.t.length, 0);
    };
    const restore = el => {
      if (!el._tn) return;
      el._tn.forEach(o => { o.n.nodeValue = o.t; });
      el.classList.remove('decoding');
      el.style.minHeight = '';
    };
    const stop = el => { el._run = (el._run || 0) + 1; restore(el); };
    const decode = els => {
      els.forEach(prep);
      els.forEach(e => { e.style.minHeight = e.offsetHeight + 'px'; }); // stops layout jumping
      const runs = els.map(e => (e._run = (e._run || 0) + 1));
      const t0 = performance.now();
      const tick = now => {
        let busy = false;
        els.forEach((e, k) => {
          if (e._run !== runs[k]) return;
          const dur = Math.min(1000, 400 + e._len * 9);   // decode speed per line
          const t = (now - t0 - k * 130) / dur;            // 130 = delay between lines
          if (t >= 1) { restore(e); return; }
          busy = true;
          e.classList.add('decoding');
          const cut = Math.max(0, t) * e._len;
          let base = 0;
          e._tn.forEach(o => {
            o.n.nodeValue = [...o.t].map((c, i) => (c === ' ' || c === '\n' || base + i < cut) ? c : CHARS[Math.random() * CHARS.length | 0]).join('');
            base += o.t.length;
          });
        });
        if (busy) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const reveal = i => {
      if (i <= shown) return;
      for (let k = shown + 1; k <= i; k++) {
        items[k].classList.add('on');
        if (!reduce) decode([...items[k].querySelectorAll(DEC)]);
      }
      shown = i;
      reduce ? render(MILESTONES[i]) : moveTo(MILESTONES[i]);
    };
    const replay = () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout); timers = [];
      items.forEach(it => { it.classList.remove('on'); [...it.querySelectorAll(DEC)].forEach(stop); });
      shown = -1; render(0);
      items.forEach((_, i) => timers.push(setTimeout(() => reveal(i), 250 + i * HOP_MS * 1.15)));
    };
    document.getElementById('rmReplay').addEventListener('click', () => { if (!reduce) replay(); });

    if (reduce) {
      items.forEach(it => it.classList.add('on'));
      shown = items.length - 1; render(1);
    } else {
      render(0);
      // each text block reveals when it scrolls into view
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting || e.boundingClientRect.top < 0) reveal(items.indexOf(e.target));
        });
      }, { rootMargin: '0px 0px -30% 0px' });
      items.forEach(it => io.observe(it));
      // heading decodes once when it appears
      const headIo = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) { decode(headEls); headIo.disconnect(); }
      }, { threshold: 0.4 });
      headIo.observe(headEls[0]);
    }
  }

  // Projects: start with one card, scroll to reveal all (tablet/desktop only)
  const projectStage = document.getElementById('projectStage');
  const projectTrack = document.getElementById('projectTrack');
  if (projectStage && projectTrack && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    window.addEventListener('load', () => ScrollTrigger.refresh());
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
    gsap.matchMedia().add('(min-width: 640px) and (prefers-reduced-motion: no-preference)', () => {
      const cards = gsap.utils.toArray('#projectTrack .project-card');
      const n = cards.length, GAP = 20, PAD = 16;
      const step = () => cards[0].offsetWidth + GAP;
      // how far the row overflows the stage on each side
      const overflow = () => Math.max(0, ((n - 1) * step() + cards[0].offsetWidth) / 2 - (projectStage.clientWidth / 2 - PAD));

      cards.forEach(c => { c.style.transition = 'none'; });
      gsap.set(cards, { x: 0, y: 0, opacity: 1, zIndex: i => n - i });
      gsap.set(projectTrack, { x: 0 });

      const revealTime = 0.8 + 0.18 * (n - 1);
      const tl = gsap.timeline({
        scrollTrigger: { trigger: '#projects', start: 'top top', end: '+=2400', pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true }
      });
      tl.to({}, { duration: 0.3 });                                   // hold on the single card
      tl.to(cards, { x: i => (i - (n - 1) / 2) * step(), ease: 'power3.out', duration: 0.8, stagger: 0.18 }, 'reveal');
      tl.to(projectTrack, { x: () => overflow(), ease: 'power3.out', duration: revealTime }, 'reveal');
      tl.to(projectTrack, { x: () => -overflow(), ease: 'none', duration: 1.2 }); // pan to the last card
      tl.to({}, { duration: 0.3 });                                   // hold the full row
    });
  }

   // Contact section TextCursor background
  const contactSection = document.getElementById('contact');
  const cursorLayer = document.getElementById('contactCursorLayer');

  if (
    contactSection &&
    cursorLayer &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    const TRAIL_TEXT = 'SA.';
    const SPACING = 68;
    const MAX_POINTS = 7;

    let lastX = 0;
    let lastY = 0;
    let hasMoved = false;
    const stamps = [];

    contactSection.addEventListener('pointermove', event => {
      const rect = contactSection.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if (!hasMoved) {
        lastX = x;
        lastY = y;
        hasMoved = true;
      }

      const dx = x - lastX;
      const dy = y - lastY;
      const distance = Math.hypot(dx, dy);

      if (distance < SPACING) return;

      const angle = Math.atan2(dy, dx) * 180 / Math.PI;

      const stamp = document.createElement('span');
      stamp.className = 'contact-cursor-item';
      stamp.textContent = TRAIL_TEXT;

      stamp.style.left = `${x}px`;
      stamp.style.top = `${y}px`;
      stamp.style.transform =
        `translate(-50%, -50%) rotate(${angle}deg)`;

      cursorLayer.appendChild(stamp);
      stamps.push(stamp);

      while (stamps.length > MAX_POINTS) {
        stamps.shift().remove();
      }

      setTimeout(() => {
        stamp.remove();
        const index = stamps.indexOf(stamp);
        if (index !== -1) stamps.splice(index, 1);
      }, 850);

      lastX = x;
      lastY = y;
    });

    contactSection.addEventListener('pointerleave', () => {
      hasMoved = false;
    });
  }

  // Project summaries use only placeholder sample content.
  const caseStudies = {
    featured: { eyebrow: 'FREELANCE SOCIAL MEDIA CAMPAIGN', title: 'Bloom Café', text: 'A sample campaign for a neighbourhood café. It covered a four-week content calendar, simple creatives, a consistent brand voice and weekly reports on reach and engagement. Replace this text with your own case study.', tools: 'Social media · Content plan · Reporting · Brand voice' },
    budget: { eyebrow: 'FINTECH / WEB PROJECT', title: 'Budget Tracker', text: 'A spreadsheet-driven tracker that groups monthly spending into categories and shows progress toward savings goals with a clean summary view.', tools: 'Spreadsheets · Budgeting · Dashboards' },
    churn: { eyebrow: 'DATA / ANALYTICS PROJECT', title: 'Customer Churn Insights', text: 'A sample analysis exploring why customers stop buying. It segments customers, compares behaviour and proposes a few retention ideas.', tools: 'Analysis · Segmentation · Charts' },
    splitter: { eyebrow: 'FRONT-END PROJECT', title: 'Expense Splitter', text: 'A small web tool concept for splitting shared bills among friends, with a clear list of who owes whom.', tools: 'HTML · CSS · JavaScript' },
    funnel: { eyebrow: 'MARKETING / ANALYTICS PROJECT', title: 'Lead Funnel Dashboard', text: 'A sample dashboard that follows leads from first click to paying customer and highlights the stages where people drop off.', tools: 'Dashboards · CRM data' },
    newsletter: { eyebrow: 'CONTENT PROJECT', title: 'Newsletter Hub', text: 'A content project for planning, writing and organising a weekly newsletter, including topic ideas and a simple publishing schedule.', tools: 'Content · Email' },
    reminders: { eyebrow: 'AUTOMATION PROJECT', title: 'Invoice Reminder Bot', text: 'A small no-code automation that sends polite payment reminders on a schedule so invoices do not need to be chased manually.', tools: 'No-code · Automation' }
  };
  const dialog = document.getElementById('caseDialog');
  document.querySelectorAll('.case-study-trigger').forEach(button => button.addEventListener('click', () => {
    const item = caseStudies[button.dataset.case];
    document.getElementById('dialogEyebrow').textContent = item.eyebrow;
    document.getElementById('dialogTitle').textContent = item.title;
    document.getElementById('dialogText').textContent = item.text;
    document.getElementById('dialogTools').textContent = item.tools;
    const link = document.getElementById('dialogLink');
    if (item.link) { link.href = item.link; link.hidden = false; } else { link.hidden = true; }
    dialog.showModal();
  }));
  document.getElementById('dialogClose').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
})();
