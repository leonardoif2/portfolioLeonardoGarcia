const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".main-nav");
const links = [...document.querySelectorAll(".main-nav a")];
const sections = [...document.querySelectorAll("main section[id]")];

function closeMenu() {
  if (!menuButton || !navigation) return;
  menuButton.setAttribute("aria-expanded", "false");
  navigation.classList.remove("open");
  document.body.classList.remove("menu-open");
}

if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    const willOpen = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(willOpen));
    navigation.classList.toggle("open", willOpen);
    document.body.classList.toggle("menu-open", willOpen);
  });
}

links.forEach((link) => link.addEventListener("click", closeMenu));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

const desktopViewport = window.matchMedia("(min-width: 901px)");
desktopViewport.addEventListener("change", (event) => {
  if (event.matches) closeMenu();
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => {
        link.classList.toggle("active", link.hash === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: "-25% 0px -65% 0px" }
);

sections.forEach((section) => observer.observe(section));

/* Estela del puntero en todo el sitio */
(() => {
  if (!window.matchMedia("(pointer: fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (window.innerWidth <= 768) return;

  const COUNT = 20;
  const EASE = 0.3;
  const SIZE = 10;
  const HALF = SIZE / 2;

  const position = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const dots = [];
  let active = false;

  for (let i = 0; i < COUNT; i += 1) {
    const dot = document.createElement("div");
    dot.className = "cursor-trail";
    dot.setAttribute("aria-hidden", "true");
    document.body.append(dot);
    dots.push({ el: dot, x: position.x, y: position.y });
  }

  window.addEventListener("mousemove", (event) => {
    position.x = event.clientX;
    position.y = event.clientY;
    active = true;
  }, { passive: true });

  document.documentElement.addEventListener("mouseleave", () => {
    active = false;
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) active = false;
  });

  (function tick() {
    let x = position.x;
    let y = position.y;

    for (let i = 0; i < dots.length; i += 1) {
      const current = dots[i];
      const fade = (COUNT - i) / COUNT;

      current.el.style.left = `${x - HALF}px`;
      current.el.style.top = `${y - HALF}px`;
      current.el.style.opacity = active ? String(fade * 0.9) : "0";
      current.el.style.transform = `scale(${fade.toFixed(3)})`;

      current.x = x;
      current.y = y;

      const next = dots[i + 1] || dots[0];
      x += (next.x - x) * EASE;
      y += (next.y - y) * EASE;
    }

    requestAnimationFrame(tick);
  })();
})();

/* Hero con typing (respeta reduced motion) */
(() => {
  const target = document.querySelector(".typed-text");
  if (!target) return;
  const phrases = [
    "Cybersecurity Student",
    "Redes y Sistemas",
    "Python y Automatización",
    "SOC · NOC · Forense"
  ];
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    target.textContent = phrases[0];
    return;
  }
  let phrase = 0;
  let letter = phrases[0].length;
  let erasing = true;

  function step() {
    const current = phrases[phrase];
    if (erasing) {
      letter -= 1;
      target.textContent = current.slice(0, Math.max(letter, 0));
      if (letter <= 0) {
        erasing = false;
        phrase = (phrase + 1) % phrases.length;
        window.setTimeout(step, 450);
        return;
      }
      window.setTimeout(step, 34);
    } else {
      const next = phrases[phrase];
      letter += 1;
      target.textContent = next.slice(0, letter);
      if (letter >= next.length) {
        erasing = true;
        window.setTimeout(step, 2100);
        return;
      }
      window.setTimeout(step, 62);
    }
  }

  window.setTimeout(step, 2100);
})();

/* Reveal por sección + barra de progreso + volver arriba */
(() => {
  const progress = document.querySelector(".scroll-progress span");
  const toTop = document.getElementById("to-top");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const revealTargets = document.querySelectorAll(
    ".intro, .content-section, .project-card, .technology-list article, .contact-cards > *"
  );
  if (!reduceMotion && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach((el) => {
      el.classList.add("reveal");
      revealObserver.observe(el);
    });
  }

  let ticking = false;
  function update() {
    ticking = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    if (progress) progress.style.width = `${(ratio * 100).toFixed(2)}%`;
    if (toTop) toTop.classList.toggle("visible", window.scrollY > 600);
  }
  window.addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  update();

  if (toTop) {
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();

/* Copiar correo con aviso */
(() => {
  const toast = document.querySelector(".toast");
  let timer = null;
  function notify(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(timer);
    timer = window.setTimeout(() => toast.classList.remove("show"), 2200);
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest(".copy-btn");
    if (!button) return;
    const text = button.getAttribute("data-copy") || "";
    if (!text) return;
    const done = () => {
      button.textContent = "¡Copiado!";
      notify("Correo copiado al portapapeles");
      window.setTimeout(() => { button.textContent = "Copiar correo"; }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => notify(text));
    } else {
      const area = document.createElement("textarea");
      area.value = text;
      document.body.append(area);
      area.select();
      try {
        document.execCommand("copy");
        done();
      } catch {
        notify(text);
      }
      area.remove();
    }
  });
})();

/* Tilt sutil en cards (solo puntero fino, sin reduced motion) */
(() => {
  if (!window.matchMedia("(pointer: fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  document.querySelectorAll(".project-card").forEach((card) => {
    card.classList.add("tilt");
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateX(${(-py * 5).toFixed(2)}deg) rotateY(${(px * 5).toFixed(2)}deg) translateY(-3px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
})();
