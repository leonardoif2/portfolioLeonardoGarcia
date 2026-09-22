const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".main-nav");
const links = [...document.querySelectorAll(".main-nav a")];
const sections = [...document.querySelectorAll("main section[id]")];

function closeMenu() {
  menuButton.setAttribute("aria-expanded", "false");
  navigation.classList.remove("open");
  document.body.classList.remove("menu-open");
}

menuButton.addEventListener("click", () => {
  const willOpen = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(willOpen));
  navigation.classList.toggle("open", willOpen);
  document.body.classList.toggle("menu-open", willOpen);
});

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
