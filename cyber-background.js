(() => {
  "use strict";

  const canvas = document.createElement("canvas");
  canvas.className = "cyber-background";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);

  const context = canvas.getContext("2d");
  if (!context) {
    canvas.remove();
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const phoneViewport = window.matchMedia("(max-width: 560px)");

  const GLYPHS = "01アイカキクケコサシスセソ0123456789ABCDEF$#@<>/\\{}[]".split("");

  let width = 0;
  let height = 0;
  let fontSize = 16;
  let drops = [];
  let speeds = [];
  let animationFrame = null;
  let lastPaint = 0;
  let resizeTimer = null;

  function random(minimum, maximum) {
    return minimum + Math.random() * (maximum - minimum);
  }

  function pick(array) {
    return array[(Math.random() * array.length) | 0];
  }

  function buildScene() {
    width = window.innerWidth;
    height = window.innerHeight;

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.floor(width * pixelRatio));
    canvas.height = Math.max(1, Math.floor(height * pixelRatio));
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    fontSize = phoneViewport.matches ? 12 : 14;
    const count = Math.ceil(width / fontSize);
    drops = Array.from({ length: count }, () => random(-height / fontSize, 0));
    speeds = Array.from({ length: count }, () => random(0.6, 1.6));

    context.fillStyle = "#000";
    context.fillRect(0, 0, width, height);
    drawStaticRain();
  }

  function drawStaticRain() {
    context.font = `${fontSize}px "IBM Plex Mono", monospace`;
    context.textAlign = "center";
    for (let i = 0; i < drops.length; i += 1) {
      const x = i * fontSize + fontSize / 2;
      for (let y = 0; y < height; y += fontSize * 3) {
        if (Math.random() > 0.12) continue;
        context.fillStyle = `rgba(255, 255, 255, ${random(0.03, 0.1).toFixed(3)})`;
        context.fillText(pick(GLYPHS), x, y);
      }
    }
  }

  function drawFrame() {
    // Estela: funde lo anterior hacia negro
    context.fillStyle = "rgba(0, 0, 0, 0.1)";
    context.fillRect(0, 0, width, height);

    context.font = `${fontSize}px "IBM Plex Mono", monospace`;
    context.textAlign = "center";

    for (let i = 0; i < drops.length; i += 1) {
      const x = i * fontSize + fontSize / 2;
      const y = drops[i] * fontSize;
      const head = Math.random() > 0.92;

      context.fillStyle = head
        ? `rgba(255, 255, 255, ${random(0.7, 1).toFixed(3)})`
        : `rgba(255, 255, 255, ${random(0.15, 0.4).toFixed(3)})`;
      context.fillText(pick(GLYPHS), x, y);

      // Cola corta más tenue
      context.fillStyle = "rgba(255, 255, 255, 0.12)";
      context.fillText(pick(GLYPHS), x, y - fontSize);

      drops[i] += speeds[i];
      if (y > height + fontSize * 2 && Math.random() > 0.976) {
        drops[i] = random(-20, 0);
        speeds[i] = random(0.6, 1.6);
      }
    }

    // Parpadeo global muy ocasional (como interferencia)
    if (Math.random() > 0.985) {
      context.fillStyle = "rgba(255, 255, 255, 0.03)";
      context.fillRect(0, 0, width, height);
    }
  }

  function stopAnimation() {
    if (animationFrame !== null) cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }

  function animate(time) {
    animationFrame = requestAnimationFrame(animate);
    if (time - lastPaint < 33) return;
    lastPaint = time;
    drawFrame();
  }

  function syncAnimation() {
    stopAnimation();
    if (reducedMotion.matches || document.hidden) {
      context.fillStyle = "#000";
      context.fillRect(0, 0, width, height);
      drawStaticRain();
      return;
    }
    lastPaint = performance.now();
    animationFrame = requestAnimationFrame(animate);
  }

  function scheduleResize() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      buildScene();
      syncAnimation();
    }, 120);
  }

  window.addEventListener("resize", scheduleResize, { passive: true });
  document.addEventListener("visibilitychange", syncAnimation);
  reducedMotion.addEventListener("change", syncAnimation);
  phoneViewport.addEventListener("change", scheduleResize);

  buildScene();
  syncAnimation();
})();
