
(() => {
  const canvas = document.getElementById("heroParticleCanvas");
  const wrapper = document.getElementById("heroParticleText");

  if (!canvas || !wrapper) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const words = [
    "Marketing Analyst",
    "Fintech & Growth",
    "Operations & Analytics"
  ];

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const accent = getComputedStyle(document.documentElement)
    .getPropertyValue("--accent").trim() || "#800000";

  const pink = getComputedStyle(document.documentElement)
    .getPropertyValue("--surname-accent").trim() || "#FFC0CB";

  let width = 0;
  let height = 0;
  let particles = [];
  let wordIndex = 0;
  let lastChange = 0;
  let animationId;

  const sampleCanvas = document.createElement("canvas");
  const sampleCtx = sampleCanvas.getContext("2d");

  function getPoints(word) {
    sampleCanvas.width = width;
    sampleCanvas.height = height;

    sampleCtx.clearRect(0, 0, width, height);

    let fontSize = Math.min(34, width / (word.length * 0.57));
    fontSize = Math.max(19, fontSize);

    sampleCtx.font = `700 ${fontSize}px "DM Sans", sans-serif`;
    sampleCtx.textAlign = "center";
    sampleCtx.textBaseline = "middle";
    sampleCtx.fillStyle = "#fff";
    sampleCtx.fillText(word, width / 2, height / 2);

    const pixels = sampleCtx.getImageData(0, 0, width, height).data;
    const points = [];
    const spacing = 2;

    for (let y = 0; y < height; y += spacing) {
      for (let x = 0; x < width; x += spacing) {
        const alpha = pixels[(y * width + x) * 4 + 3];

        if (alpha > 100) {
          points.push({ x, y });
        }
      }
    }

    return points;
  }

  function makeParticles(points, oldParticles = []) {
    const count = Math.max(points.length, oldParticles.length);
    const result = [];

    for (let i = 0; i < count; i++) {
      const target = points[i % points.length];
      const old = oldParticles[i];

      result.push({
        x: old ? old.x : Math.random() * width,
        y: old ? old.y : Math.random() * height,
        startX: old ? old.x : Math.random() * width,
        startY: old ? old.y : Math.random() * height,
        targetX: target.x,
        targetY: target.y,
        radius: 1.2 + Math.random() * 0.8,
        color: i % 4 === 0 ? pink : accent
      });
    }

    return result;
  }

  function resize() {
    const rect = wrapper.getBoundingClientRect();
    if (!rect.width) return;

    width = rect.width;
    height = rect.height;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const points = getPoints(words[wordIndex]);
    particles = makeParticles(points);
    lastChange = performance.now();

    wrapper.querySelector("canvas").classList.add("is-ready");
  }

  function draw(time) {
    ctx.clearRect(0, 0, width, height);

    const elapsed = time - lastChange;
    const transitionDuration = 1000;
    const holdDuration = 1900;

    if (!reduceMotion && elapsed > holdDuration) {
      if (elapsed < holdDuration + transitionDuration) {
        const progress = Math.min(
          1,
          (elapsed - holdDuration) / transitionDuration
        );

        const eased = 1 - Math.pow(1 - progress, 3);

        particles.forEach(p => {
          p.x = p.startX + (p.targetX - p.startX) * eased;
          p.y = p.startY + (p.targetY - p.startY) * eased;
        });
      } else {
        wordIndex = (wordIndex + 1) % words.length;

        const points = getPoints(words[wordIndex]);
        particles = makeParticles(points, particles);
        lastChange = time;
      }
    }

    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    });

    if (!reduceMotion) {
      animationId = requestAnimationFrame(draw);
    }
  }

  document.fonts.ready.then(() => {
    resize();
    draw(performance.now());
  });

  window.addEventListener("resize", () => {
    cancelAnimationFrame(animationId);
    resize();
    draw(performance.now());
  });
})();
