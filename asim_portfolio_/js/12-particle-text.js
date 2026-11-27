
(() => {
  const wrapper = document.getElementById("heroShuffleText");
  if (!wrapper) return;

  const textElement = wrapper.querySelector(".shuffle-text");
  if (!textElement) return;

  const words = [
    "Marketing Analyst",
    "Fintech & Growth",
    "Operations & Analytics"
  ];

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  let wordIndex = 0;
  let timer = null;
  let isAnimating = false;

  const duration = 350;
  const stagger = 30;

  function renderWord(word) {
    textElement.replaceChildren();

    [...word].forEach(char => {
      const span = document.createElement("span");
      span.className = "shuffle-char";
      span.textContent = char === " " ? "\u00A0" : char;
      textElement.appendChild(span);
    });
  }

  function shuffleToNextWord() {
    if (isAnimating) return;

    isAnimating = true;

    const nextIndex = (wordIndex + 1) % words.length;
    const nextWord = words[nextIndex];

    const oldChars = [...textElement.querySelectorAll(".shuffle-char")];
    const maxLength = Math.max(oldChars.length, nextWord.length);

    const fragments = [];

    for (let i = 0; i < maxLength; i++) {
      const span = oldChars[i] || document.createElement("span");
      span.className = "shuffle-char";
      span.textContent = span.textContent || "\u00A0";
      fragments.push(span);
    }

    textElement.replaceChildren(...fragments);

    fragments.forEach((span, index) => {
      const target = nextWord[index] || "";
      const start = performance.now() + index * stagger;

      function animate(now) {
        if (now < start) {
          requestAnimationFrame(animate);
          return;
        }

        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);

        if (progress < 1) {
          span.style.transform = `translateY(${(1 - eased) * 18}px)`;
          span.style.opacity = eased;

          if (Math.random() < 0.35) {
            span.textContent = String.fromCharCode(
              65 + Math.floor(Math.random() * 26)
            );
          }

          requestAnimationFrame(animate);
        } else {
          span.textContent = target === " " ? "\u00A0" : target;
          span.style.transform = "";
          span.style.opacity = "";
        }
      }

      span.style.opacity = "0";
      requestAnimationFrame(animate);
    });

    const totalTime = duration + maxLength * stagger;

    window.setTimeout(() => {
      wordIndex = nextIndex;
      renderWord(nextWord);
      isAnimating = false;
    }, totalTime + 50);
  }

  renderWord(words[wordIndex]);

  if (reduceMotion) return;

  timer = window.setInterval(shuffleToNextWord, 3500);

  wrapper.addEventListener("mouseenter", () => {
    if (!isAnimating) shuffleToNextWord();
  });
})();
