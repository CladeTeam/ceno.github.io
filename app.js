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

/* ---------- Dynamic illustrations ---------- */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* (1) Hero DNA read / score / write ribbon */
(function initDnaRibbon() {
  const track = document.querySelector(".dna-track");
  if (!track) return;

  const BASES = ["A", "C", "G", "T"];
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const makeBase = (kind) => {
    const span = document.createElement("span");
    span.className = "dna-base" + (kind ? " " + kind : "");
    span.textContent = pick(BASES);
    return span;
  };

  const capacity = () => {
    const probe = makeBase();
    probe.style.visibility = "hidden";
    track.appendChild(probe);
    const w = probe.getBoundingClientRect().width || 10;
    track.removeChild(probe);
    return Math.max(10, Math.floor((track.clientWidth - 28) / w));
  };

  let cap = capacity();
  for (let i = 0; i < cap; i++) track.appendChild(makeBase());

  // A VEP (variant-effect prediction) call: substitute ref->alt, score the
  // likelihood delta, and classify benign vs. pathogenic by magnitude.
  const addVepCall = (base) => {
    if (!base || base.classList.contains("is-write") || base.classList.contains("is-score")) return;
    const ref = base.textContent;
    let alt = ref;
    while (alt === ref) alt = pick(BASES);
    const delta = -(Math.random() * 5.5) + Math.random() * 1.2; // skew negative
    const pathogenic = delta <= -2.5;
    const cls = pathogenic ? "is-path" : "is-benign";

    base.classList.add("is-score", cls);
    const bubble = document.createElement("span");
    bubble.className = "dna-score-bubble " + cls;
    bubble.innerHTML =
      '<span class="vep-sub">' + ref + "→" + alt + "</span>" +
      '<span class="vep-delta">' + delta.toFixed(1) + "</span>" +
      '<span class="vep-tag">' + (pathogenic ? "pathogenic" : "benign") + "</span>";
    base.appendChild(bubble);
  };

  if (reduceMotion) {
    const kids = track.children;
    if (kids.length > 10) addVepCall(kids[kids.length - 10]);
    return;
  }

  let tick = 0;
  let writeRun = 0;
  let nextCall = 6;
  const STREAM_MS = 130; // lively base streaming
  const HOLD_MS = 2400; // pause on each variant call so it can be read

  const stream = () => {
    tick++;
    if (writeRun === 0 && Math.random() < 0.14) writeRun = 3 + Math.floor(Math.random() * 3);
    const kind = writeRun > 0 ? "is-write" : "";
    if (writeRun > 0) writeRun--;

    track.appendChild(makeBase(kind));
    while (track.children.length > cap) track.removeChild(track.firstChild);

    let delay = STREAM_MS;
    if (tick >= nextCall) {
      const kids = track.children;
      addVepCall(kids[Math.max(0, kids.length - 10)]);
      nextCall = tick + 9 + Math.floor(Math.random() * 6);
      delay = HOLD_MS; // freeze the stream while the variant call is shown
    }
    setTimeout(stream, delay);
  };
  stream();

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      cap = capacity();
    }, 200);
  });
})();

/* (2) Metric count-ups */
(function initCountUps() {
  if (reduceMotion || !("IntersectionObserver" in window)) return;

  const els = document.querySelectorAll(".stat-list strong, .scale-strip strong, .rank-big strong");
  if (!els.length) return;

  const numRe = /\d[\d,]*(?:\.\d+)?/;

  const firstNumberNode = (el) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    let node;
    while ((node = walker.nextNode())) {
      if (numRe.test(node.nodeValue)) return node;
    }
    return null;
  };

  const animate = (el) => {
    const node = firstNumberNode(el);
    if (!node) return;
    const match = node.nodeValue.match(numRe);
    if (!match) return;

    const raw = match[0];
    const before = node.nodeValue.slice(0, match.index);
    const after = node.nodeValue.slice(match.index + raw.length);
    const hasComma = raw.includes(",");
    const clean = raw.replace(/,/g, "");
    const decimals = clean.includes(".") ? clean.split(".")[1].length : 0;
    const target = parseFloat(clean);
    if (!isFinite(target)) return;

    const format = (v) => {
      let s = v.toFixed(decimals);
      if (hasComma) {
        const parts = s.split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        s = parts.join(".");
      }
      return s;
    };

    const duration = 1100;
    let startTs = null;
    const step = (ts) => {
      if (startTs === null) startTs = ts;
      const p = Math.min(1, (ts - startTs) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      node.nodeValue = before + format(target * eased) + after;
      if (p < 1) requestAnimationFrame(step);
      else node.nodeValue = before + format(target) + after;
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  els.forEach((el) => observer.observe(el));
})();

/* (3) Long-context scale bar */
(function initContextScale() {
  const el = document.querySelector(".context-scale");
  if (!el) return;
  if (!("IntersectionObserver" in window)) {
    el.classList.add("in-view");
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          el.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.35 }
  );
  observer.observe(el);
})();

/* (4) Benchmark rank bars */
(function initRankBars() {
  const el = document.querySelector(".rank-bars");
  if (!el) return;
  if (!("IntersectionObserver" in window)) {
    el.classList.add("in-view");
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          el.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  observer.observe(el);
})();

/* (5) Enhancer design: cell-type prompt -> generate a 500 bp sequence */
(function initDesignGen() {
  const seqEl = document.querySelector(".gen-seq");
  const tokenEl = document.querySelector(".gen-token");
  const countEl = document.querySelector(".gen-count");
  if (!seqEl || !tokenEl || !countEl) return;

  const BASES = ["A", "C", "G", "T"];
  const randBase = () => BASES[Math.floor(Math.random() * 4)];
  const TARGET = 500;
  const CELLS = ["Astro", "L2/3", "Pvalb", "Oligo", "Micro"];
  const MOTIFS = ["GATAAG", "CACGTG", "TGACTCA", "CCAAT"];
  let cellIdx = 0;

  // Full 500-base sequence with a few highlighted TF motifs spread through it.
  const buildFull = () => {
    const chars = [];
    while (chars.length < TARGET) {
      const gap = 40 + Math.floor(Math.random() * 55);
      for (let k = 0; k < gap && chars.length < TARGET; k++) chars.push({ c: randBase(), m: false });
      if (chars.length < TARGET - 12) {
        const motif = MOTIFS[Math.floor(Math.random() * MOTIFS.length)];
        for (const c of motif) if (chars.length < TARGET) chars.push({ c, m: true });
      }
    }
    return chars.slice(0, TARGET);
  };

  const renderChars = (list) => {
    let html = "";
    let run = "";
    let runMotif = false;
    const flush = () => {
      if (run) html += runMotif ? '<span class="motif">' + run + "</span>" : run;
      run = "";
    };
    list.forEach((x) => {
      if (x.m !== runMotif) {
        flush();
        runMotif = x.m;
      }
      run += x.c;
    });
    flush();
    return html;
  };

  const setToken = () => {
    tokenEl.textContent = "<" + CELLS[cellIdx] + ">";
  };

  if (reduceMotion) {
    setToken();
    seqEl.innerHTML = renderChars(buildFull());
    countEl.textContent = "500 bp";
    return;
  }

  const cursor = '<span class="typer-cursor"></span>';
  let chars = [];
  let i = 0;
  let running = false;

  const tick = () => {
    i = Math.min(TARGET, i + 6);
    seqEl.innerHTML = renderChars(chars.slice(0, i)) + (i < TARGET ? cursor : "");
    seqEl.scrollTop = seqEl.scrollHeight;
    if (i < TARGET) {
      countEl.textContent = i + " bp";
      setTimeout(tick, 40);
    } else {
      countEl.textContent = "500 bp ✓";
      countEl.classList.add("done");
      setTimeout(() => {
        cellIdx = (cellIdx + 1) % CELLS.length;
        countEl.classList.remove("done");
        setToken();
        chars = buildFull();
        i = 0;
        tick();
      }, 2400);
    }
  };

  const start = () => {
    if (running) return;
    running = true;
    setToken();
    chars = buildFull();
    i = 0;
    tick();
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) start();
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(seqEl);
  } else {
    start();
  }
})();

/* (6) Copy-to-clipboard citation */
(function initCopyCitation() {
  const btn = document.querySelector(".copy-cite");
  const code = document.querySelector("#citationText");
  if (!btn || !code) return;

  btn.addEventListener("click", async () => {
    const text = code.textContent;
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      const range = document.createRange();
      range.selectNodeContents(code);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      try {
        document.execCommand("copy");
      } catch (_) {
        /* ignore */
      }
      sel.removeAllRanges();
    }
    const original = btn.textContent;
    btn.textContent = "Copied ✓";
    btn.classList.add("copied");
    setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove("copied");
    }, 1800);
  });
})();
