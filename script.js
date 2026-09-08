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
