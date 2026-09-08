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
  const glyphs = ["0", "1", "0", "1", "0", "1", "A", "F", "<", ">", "/", "{", "}", "[", "]"];
  const networkLabels = ["0x7F", "TCP", "443", "SSH", "AES", "/24"];

  let width = 0;
  let height = 0;
  let columns = [];
  let nodes = [];
  let animationFrame = null;
  let lastPaint = 0;
  let resizeTimer = null;

  function random(minimum, maximum) {
    return minimum + Math.random() * (maximum - minimum);
  }

  function buildScene() {
    width = window.innerWidth;
    height = window.innerHeight;

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.floor(width * pixelRatio));
    canvas.height = Math.max(1, Math.floor(height * pixelRatio));
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const columnSpacing = phoneViewport.matches ? 34 : 26;
    const columnCount = Math.ceil(width / columnSpacing);

    columns = Array.from({ length: columnCount }, (_, index) => ({
      x: (index + 0.5) * columnSpacing,
      y: random(0, height),
      speed: random(20, 48),
      size: random(10, 14),
      length: Math.round(random(5, 12)),
      alpha: random(0.28, 0.62),
      seed: Math.floor(random(0, glyphs.length))
    }));

    const nodeCount = phoneViewport.matches ? 10 : Math.min(22, Math.max(14, Math.floor(width / 85)));
    nodes = Array.from({ length: nodeCount }, () => ({
      x: random(0.04, 0.96),
      y: random(0.06, 0.94),
      radius: random(1.1, 2.1),
      phase: random(0, Math.PI * 2),
      driftX: random(5, 16),
      driftY: random(4, 12)
    }));

    drawScene(0, 0, false);
  }

  function nodePosition(node, time) {
    const movement = time * 0.0002;
    return {
      x: node.x * width + Math.sin(movement + node.phase) * node.driftX,
      y: node.y * height + Math.cos(movement * 0.8 + node.phase) * node.driftY
    };
  }

  function drawGrid(time) {
    const cell = phoneViewport.matches ? 72 : 88;
    const offset = (time * 0.006) % cell;

    context.beginPath();
    for (let x = offset - cell; x < width + cell; x += cell) {
      context.moveTo(x, 0);
      context.lineTo(x, height);
    }
    for (let y = offset - cell; y < height + cell; y += cell) {
      context.moveTo(0, y);
      context.lineTo(width, y);
    }
    context.strokeStyle = "rgba(180, 216, 139, 0.065)";
    context.lineWidth = 1;
    context.stroke();
  }

  function drawAmbientGlows(time) {
    const greenX = width * (0.72 + Math.sin(time * 0.00018) * 0.06);
    const greenY = height * (0.22 + Math.cos(time * 0.00016) * 0.05);
    const greenGlow = context.createRadialGradient(
      greenX,
      greenY,
      0,
      greenX,
      greenY,
      Math.max(width, height) * 0.48
    );
    greenGlow.addColorStop(0, "rgba(180, 216, 139, 0.13)");
    greenGlow.addColorStop(0.42, "rgba(180, 216, 139, 0.035)");
    greenGlow.addColorStop(1, "rgba(180, 216, 139, 0)");
    context.fillStyle = greenGlow;
    context.fillRect(0, 0, width, height);

    const cyanX = width * (0.18 + Math.cos(time * 0.00015) * 0.05);
    const cyanY = height * (0.78 + Math.sin(time * 0.00014) * 0.04);
    const cyanGlow = context.createRadialGradient(
      cyanX,
      cyanY,
      0,
      cyanX,
      cyanY,
      Math.max(width, height) * 0.38
    );
    cyanGlow.addColorStop(0, "rgba(120, 198, 176, 0.1)");
    cyanGlow.addColorStop(1, "rgba(120, 198, 176, 0)");
    context.fillStyle = cyanGlow;
    context.fillRect(0, 0, width, height);
  }

  function drawNetwork(time) {
    const positions = nodes.map((node) => nodePosition(node, time));
    const connectionDistance = phoneViewport.matches ? 125 : 180;

    for (let first = 0; first < positions.length; first += 1) {
      for (let second = first + 1; second < positions.length; second += 1) {
        const deltaX = positions[first].x - positions[second].x;
        const deltaY = positions[first].y - positions[second].y;
        const distance = Math.hypot(deltaX, deltaY);
        if (distance > connectionDistance) continue;

        context.beginPath();
        context.moveTo(positions[first].x, positions[first].y);
        context.lineTo(positions[second].x, positions[second].y);
        context.strokeStyle = `rgba(120, 198, 176, ${0.24 * (1 - distance / connectionDistance)})`;
        context.lineWidth = 1;
        context.stroke();

        if ((first * 7 + second) % 4 === 0) {
          const progress = (time * 0.00016 + (first + second) * 0.13) % 1;
          const packetX = positions[first].x + (positions[second].x - positions[first].x) * progress;
          const packetY = positions[first].y + (positions[second].y - positions[first].y) * progress;

          context.beginPath();
          context.arc(packetX, packetY, 1.6, 0, Math.PI * 2);
          context.fillStyle = "rgba(205, 236, 169, 0.72)";
          context.fill();
        }
      }
    }

    positions.forEach((position, index) => {
      const node = nodes[index];
      const pulse = 0.5 + Math.sin(time * 0.0016 + node.phase) * 0.5;

      context.beginPath();
      context.arc(position.x, position.y, node.radius + pulse * 0.8, 0, Math.PI * 2);
      context.fillStyle = "rgba(180, 216, 139, 0.62)";
      context.fill();

      context.beginPath();
      context.arc(position.x, position.y, 5 + pulse * 5, 0, Math.PI * 2);
      context.strokeStyle = `rgba(180, 216, 139, ${0.14 + pulse * 0.1})`;
      context.lineWidth = 0.9;
      context.stroke();

      if (index % 3 === 0) {
        context.font = `${phoneViewport.matches ? 8 : 9}px "IBM Plex Mono", monospace`;
        context.textAlign = "left";
        context.fillStyle = "rgba(120, 198, 176, 0.38)";
        context.fillText(networkLabels[index % networkLabels.length], position.x + 8, position.y - 8);
      }
    });
  }

  function drawCodeRain(time, delta, animate) {
    columns.forEach((column, columnIndex) => {
      if (animate) column.y += column.speed * delta;

      const lineHeight = column.size * 1.45;
      const centerDistance = Math.abs(column.x - width / 2) / Math.max(width / 2, 1);
      const edgeVisibility = 0.44 + Math.pow(centerDistance, 1.35) * 0.56;

      context.font = `${column.size}px "IBM Plex Mono", monospace`;
      context.textAlign = "center";

      for (let row = 0; row < column.length; row += 1) {
        const y = column.y - row * lineHeight;
        if (y < -lineHeight || y > height + lineHeight) continue;

        const glyphIndex = (
          Math.floor(time / 190) + row * 3 + column.seed + columnIndex
        ) % glyphs.length;
        const fade = 1 - row / column.length;
        const alpha = column.alpha * fade * edgeVisibility;

        context.fillStyle = row === 0
          ? `rgba(220, 245, 188, ${Math.min(alpha * 1.9, 0.82)})`
          : `rgba(180, 216, 139, ${alpha})`;
        context.fillText(glyphs[glyphIndex], column.x, y);
      }

      if (column.y - column.length * lineHeight > height) {
        column.y = random(-height * 0.3, -lineHeight);
        column.speed = random(20, 48);
        column.seed = Math.floor(random(0, glyphs.length));
      }
    });
  }

  function drawScanner(time) {
    const position = (time * 0.025) % (height + 160) - 80;
    const glow = context.createLinearGradient(0, position - 55, 0, position + 55);
    glow.addColorStop(0, "rgba(120, 198, 176, 0)");
    glow.addColorStop(0.5, "rgba(120, 198, 176, 0.085)");
    glow.addColorStop(1, "rgba(120, 198, 176, 0)");
    context.fillStyle = glow;
    context.fillRect(0, position - 55, width, 110);

    context.beginPath();
    context.moveTo(0, position);
    context.lineTo(width, position);
    context.strokeStyle = "rgba(205, 236, 169, 0.16)";
    context.lineWidth = 0.9;
    context.stroke();
  }

  function drawHudCorners() {
    const margin = phoneViewport.matches ? 14 : 24;
    const arm = phoneViewport.matches ? 22 : 34;

    context.beginPath();
    context.moveTo(margin, margin + arm);
    context.lineTo(margin, margin);
    context.lineTo(margin + arm, margin);
    context.moveTo(width - margin - arm, height - margin);
    context.lineTo(width - margin, height - margin);
    context.lineTo(width - margin, height - margin - arm);
    context.strokeStyle = "rgba(180, 216, 139, 0.24)";
    context.lineWidth = 1;
    context.stroke();
  }

  function drawScene(time, delta, animate) {
    context.clearRect(0, 0, width, height);
    drawAmbientGlows(time);
    drawGrid(time);
    drawNetwork(time);
    drawCodeRain(time, delta, animate);
    drawScanner(time);
    drawHudCorners();
  }

  function stopAnimation() {
    if (animationFrame !== null) cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }

  function animate(time) {
    animationFrame = requestAnimationFrame(animate);
    if (time - lastPaint < 33) return;

    const delta = Math.min((time - lastPaint) / 1000, 0.1);
    lastPaint = time;
    drawScene(time, delta, true);
  }

  function syncAnimation() {
    stopAnimation();

    if (reducedMotion.matches || document.hidden) {
      drawScene(0, 0, false);
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
