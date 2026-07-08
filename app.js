const figureButtons = Array.from(document.querySelectorAll(".figure-thumb"));
const lightbox = document.querySelector("#figureLightbox");
const lightboxImage = document.querySelector("#lightboxImage");
const lightboxTitle = document.querySelector("#lightboxTitle");
const lightboxCaption = document.querySelector("#lightboxCaption");
const closeButtons = document.querySelectorAll("[data-lightbox-close]");
const previousButton = document.querySelector("[data-lightbox-prev]");
const nextButton = document.querySelector("[data-lightbox-next]");

let activeFigureIndex = 0;

function getFigureData(index) {
  const button = figureButtons[index];
  return {
    src: button.dataset.full,
    title: button.dataset.title,
    caption: button.dataset.caption,
    alt: button.querySelector("img")?.alt || button.dataset.title,
  };
}

function renderFigure(index) {
  activeFigureIndex = (index + figureButtons.length) % figureButtons.length;
  const figure = getFigureData(activeFigureIndex);

  lightboxImage.src = figure.src;
  lightboxImage.alt = figure.alt;
  lightboxTitle.textContent = figure.title;
  lightboxCaption.textContent = figure.caption;
}

function openLightbox(index) {
  renderFigure(index);
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");
  nextButton.focus();
}

function closeLightbox() {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-open");
  lightboxImage.removeAttribute("src");
}

figureButtons.forEach((button, index) => {
  button.addEventListener("click", () => openLightbox(index));
});

closeButtons.forEach((button) => {
  button.addEventListener("click", closeLightbox);
});

previousButton.addEventListener("click", () => renderFigure(activeFigureIndex - 1));
nextButton.addEventListener("click", () => renderFigure(activeFigureIndex + 1));

document.addEventListener("keydown", (event) => {
  if (!lightbox.classList.contains("is-open")) {
    return;
  }

  if (event.key === "Escape") {
    closeLightbox();
  }

  if (event.key === "ArrowLeft") {
    renderFigure(activeFigureIndex - 1);
  }

  if (event.key === "ArrowRight") {
    renderFigure(activeFigureIndex + 1);
  }
});

/* ---------- Theme toggle ---------- */
const themeToggle = document.querySelector(".theme-toggle");
const root = document.documentElement;

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("ceno-theme", next);
    } catch (e) {
      /* ignore storage errors */
    }
  });
}

/* ---------- Mobile menu ---------- */
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#siteNav");

if (menuToggle && siteNav) {
  const setMenu = (open) => {
    siteNav.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  menuToggle.addEventListener("click", () => {
    setMenu(!siteNav.classList.contains("open"));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });
}

/* ---------- Scroll reveal ---------- */
const revealTargets = document.querySelectorAll(
  ".hero-figure, .stage, .scale-strip, .act-head, .figure-block, .stat-list article, .capability-grid article, .rank-callout, .paper-card, .citation-box, .section-heading"
);

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (revealTargets.length && "IntersectionObserver" in window && !prefersReducedMotion) {
  revealTargets.forEach((el) => el.classList.add("reveal"));
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );
  revealTargets.forEach((el) => revealObserver.observe(el));
}

/* ---------- Active nav highlight ---------- */
const navLinks = Array.from(document.querySelectorAll("#siteNav a"));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if (sections.length && "IntersectionObserver" in window) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          navLinks.forEach((link) =>
            link.classList.toggle("active", link.getAttribute("href") === `#${id}`)
          );
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );
  sections.forEach((section) => navObserver.observe(section));
}
