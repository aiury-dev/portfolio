const nav = document.getElementById("nav");
const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");
const menuOverlay = document.getElementById("menuOverlay");
const pageLoader = document.getElementById("pageLoader");
const loaderBar = document.getElementById("loaderBar");
const loaderPercent = document.getElementById("loaderPercent");
const loaderStatus = document.getElementById("loaderStatus");
const headerSeparator = document.getElementById("headerSeparator");
const footerSeparator = document.getElementById("footerSeparator");
const heroSection = document.getElementById("inicio");
const heroParticleCanvas = document.getElementById("hero-particles");
const audioToggle = document.getElementById("audioToggle");
const audioDot = document.getElementById("audioDot");
const audioLabel = document.getElementById("audioLabel");
const ytAudioMount = document.getElementById("ytAudioMount");
const audioStatusMetrics = document.querySelector(".status-metrics");
const scrollThumb = document.getElementById("scrollThumb");
const gravityNodes = [...document.querySelectorAll(".gravity-node")];
const keychainHero = document.querySelector(".keychain-hero");
const cinematicSections = [...document.querySelectorAll("main .section")];
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
let ambientEnabled = false;
let ambientManuallyControlled = false;
let ambientBootstrapPending = false;
const YT_MUSIC_VIDEO_ID = "Y0plyNaxy30";
const YT_LOW_VOLUME = 10;
let ytPlayer = null;
let ytApiPromise = null;

function debounce(fn, wait = 200) {
  let timeout = 0;
  return (...args) => {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => fn(...args), wait);
  };
}

function initPageLoader() {
  if (!pageLoader || prefersReducedMotion) return;

  document.body.classList.add("is-loading");
  const loaderStartedAt = performance.now();
  const minLoaderVisibleMs = 1200;
  let progress = 3;
  let ended = false;
  const statusSteps = [
    { max: 18, text: "Aiury" },
    { max: 42, text: "Web Design" },
    { max: 68, text: "Aiury" },
    { max: 92, text: "Web Design" },
  ];

  const syncStatus = () => {
    if (!loaderStatus) return;
    const current = statusSteps.find((step) => progress <= step.max);
    loaderStatus.textContent = current
      ? current.text
      : "Web Design";
  };

  const paintProgress = () => {
    if (loaderBar) loaderBar.style.width = `${progress.toFixed(1)}%`;
    if (loaderPercent) loaderPercent.textContent = `${Math.round(progress)
      .toString()
      .padStart(2, "0")}`;
    if (pageLoader) {
      pageLoader.style.setProperty("--loader-progress", progress.toFixed(2));
      pageLoader.style.setProperty(
        "--loader-progress-angle",
        `${(progress * 3.6).toFixed(2)}deg`,
      );
    }
    syncStatus();
  };

  paintProgress();

  const progressTimer = window.setInterval(() => {
    if (ended) return;
    const remaining = Math.max(0, 92 - progress);
    const velocity = Math.max(0.65, remaining * 0.08);
    progress = Math.min(progress + velocity + Math.random() * 1.3, 92);
    paintProgress();
  }, 84);

  const finishLoader = () => {
    if (ended) return;
    const elapsed = performance.now() - loaderStartedAt;
    if (elapsed < minLoaderVisibleMs) {
      window.setTimeout(finishLoader, Math.max(16, minLoaderVisibleMs - elapsed));
      return;
    }
    ended = true;
    clearInterval(progressTimer);
    progress = 100;
    paintProgress();
    if (loaderStatus) loaderStatus.textContent = "Web Design";
    pageLoader.setAttribute("aria-busy", "false");

    window.setTimeout(() => {
      pageLoader.classList.add("hide");
      document.body.classList.remove("is-loading");
    }, 100);

    window.setTimeout(() => pageLoader.remove(), 980);
  };

  window.addEventListener("load", finishLoader, { once: true });
  if (document.readyState === "complete") {
    window.setTimeout(finishLoader, 60);
  }
  window.setTimeout(finishLoader, 2200);
}

function buildRandomSeparator(el, segmentCount, dotCount) {
  if (!el) return;
  el.textContent = "";

  const fragment = document.createDocumentFragment();

  for (let i = 0; i < segmentCount; i++) {
    const segment = document.createElement("span");
    segment.className = "sep-seg";

    const left = Math.random() * 100;
    const width = 8 + Math.random() * 22;
    const boundedWidth = Math.min(width, 100 - left);

    segment.style.left = `${left.toFixed(2)}%`;
    segment.style.width = `${boundedWidth.toFixed(2)}%`;
    segment.style.opacity = `${(0.28 + Math.random() * 0.64).toFixed(2)}`;
    segment.style.animationDuration = `${(6 + Math.random() * 7).toFixed(2)}s`;
    segment.style.animationDelay = `-${(Math.random() * 8).toFixed(2)}s`;
    fragment.appendChild(segment);
  }

  for (let i = 0; i < dotCount; i++) {
    const dot = document.createElement("span");
    dot.className = "sep-dot";
    dot.style.left = `${(Math.random() * 100).toFixed(2)}%`;
    dot.style.opacity = `${(0.35 + Math.random() * 0.6).toFixed(2)}`;
    dot.style.animationDelay = `-${(Math.random() * 3).toFixed(2)}s`;
    fragment.appendChild(dot);
  }

  el.appendChild(fragment);
}

function initRandomSeparators() {
  buildRandomSeparator(headerSeparator, 16, 5);
  buildRandomSeparator(footerSeparator, 24, 8);
}

function updateCinematicScroll() {
  if (prefersReducedMotion) return;

  const vh = window.innerHeight || 1;
  cinematicSections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const centerOffset = rect.top + rect.height * 0.5 - vh * 0.5;
    const norm = Math.max(-1.2, Math.min(1.2, centerOffset / (vh * 0.9)));
    const shift = -norm * 34;
    const opacity = 1 - Math.min(0.32, Math.abs(norm) * 0.3);

    section.style.setProperty("--section-shift", `${Math.round(shift)}px`);
    section.style.setProperty("--section-scale", "1");
    section.style.setProperty("--section-opacity", opacity.toFixed(4));
  });

  if (scrollThumb) {
    const max = Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight,
    );
    const progress = Math.max(0, Math.min(1, window.scrollY / max));
    const visual = Math.max(0.08, progress);
    scrollThumb.style.transform = `scaleY(${visual.toFixed(4)})`;
    scrollThumb.style.opacity = `${(0.55 + progress * 0.45).toFixed(2)}`;
  }
}

function syncAmbientUi() {
  if (audioToggle) {
    audioToggle.classList.toggle("on", ambientEnabled);
    audioToggle.setAttribute("aria-pressed", String(ambientEnabled));
    audioToggle.setAttribute(
      "aria-label",
      ambientEnabled
        ? "Desativar musica ambiente"
        : "Ativar musica ambiente baixa",
    );
  }

  if (audioDot) {
    audioDot.classList.toggle("active", ambientEnabled);
  }

  if (audioLabel) {
    audioLabel.textContent = ambientEnabled ? "Audio on" : "Audio off";
  }

  if (audioStatusMetrics) {
    audioStatusMetrics.setAttribute("aria-pressed", String(ambientEnabled));
    audioStatusMetrics.setAttribute(
      "aria-label",
      ambientEnabled
        ? "Desativar musica ambiente"
        : "Ativar musica ambiente baixa",
    );
  }
}

function loadYouTubeApi() {
  if (window.YT && window.YT.Player) return Promise.resolve();
  if (ytApiPromise) return ytApiPromise;

  ytApiPromise = new Promise((resolve, reject) => {
    const prev = window.onYouTubeIframeAPIReady;
    const timeout = window.setTimeout(
      () => {
        ytApiPromise = null;
        reject(new Error("YouTube API timeout"));
      },
      10000,
    );

    window.onYouTubeIframeAPIReady = () => {
      if (typeof prev === "function") prev();
      clearTimeout(timeout);
      resolve();
    };

    const hasApiScript = document.querySelector('script[data-yt-api="true"]');
    if (!hasApiScript) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.dataset.ytApi = "true";
      script.onerror = () => {
        clearTimeout(timeout);
        ytApiPromise = null;
        reject(new Error("YouTube API load error"));
      };
      document.head.appendChild(script);
    }
  });

  return ytApiPromise;
}

function ensureYouTubePlayer() {
  if (!ytAudioMount) return Promise.resolve(false);
  if (ytPlayer) return Promise.resolve(true);

  return loadYouTubeApi()
    .then(
      () =>
        new Promise((resolve) => {
          const failSafe = window.setTimeout(() => resolve(false), 12000);

          ytPlayer = new window.YT.Player("ytAudioMount", {
            width: "220",
            height: "220",
            videoId: YT_MUSIC_VIDEO_ID,
            playerVars: {
              autoplay: 1,
              controls: 0,
              disablekb: 1,
              fs: 0,
              iv_load_policy: 3,
              modestbranding: 1,
              rel: 0,
              playsinline: 1,
              loop: 1,
              playlist: YT_MUSIC_VIDEO_ID,
            },
            events: {
              onReady: () => {
                clearTimeout(failSafe);
                try {
                  ytPlayer.setVolume(YT_LOW_VOLUME);
                  ytPlayer.unMute();
                } catch (_) {}
                resolve(true);
              },
              onError: () => {
                clearTimeout(failSafe);
                resolve(false);
              },
            },
          });
        }),
    )
    .catch(() => false);
}

function getYtPlayerState() {
  if (!ytPlayer || typeof ytPlayer.getPlayerState !== "function") return -1;
  return ytPlayer.getPlayerState();
}

async function waitForAmbientPlayback(timeoutMs = 1800, tickMs = 120) {
  const start = performance.now();
  while (performance.now() - start < timeoutMs) {
    const state = getYtPlayerState();
    if (state === 1 || state === 3) return true;
    await new Promise((resolve) => window.setTimeout(resolve, tickMs));
  }
  return false;
}

async function setAmbientState(nextState, options = {}) {
  const { optimistic = false } = options;
  const playerReady = await ensureYouTubePlayer();
  if (!playerReady || !ytPlayer) {
    ambientEnabled = false;
    syncAmbientUi();
    return ambientEnabled;
  }

  if (!nextState) {
    try {
      ytPlayer.pauseVideo();
    } catch (_) {}
    ambientEnabled = false;
    syncAmbientUi();
    return ambientEnabled;
  }

  let isPlaying = false;
  try {
    ytPlayer.setVolume(YT_LOW_VOLUME);
    ytPlayer.unMute();
    ytPlayer.playVideo();
    if (optimistic) {
      ambientEnabled = true;
      syncAmbientUi();
      return ambientEnabled;
    }
    isPlaying = await waitForAmbientPlayback(2600, 120);
  } catch (_) {
    isPlaying = false;
  }

  ambientEnabled = isPlaying;

  syncAmbientUi();
  return ambientEnabled;
}

function initAmbientControls() {
  syncAmbientUi();

  const tryAutoStart = () => {
    if (ambientManuallyControlled) return;
    if (ambientEnabled) return;
    setAmbientState(true, { optimistic: false });
  };

  if (document.readyState === "complete") {
    window.setTimeout(tryAutoStart, 120);
  } else {
    window.addEventListener(
      "load",
      () => {
        window.setTimeout(tryAutoStart, 120);
      },
      { once: true },
    );
  }

  window.setTimeout(tryAutoStart, 650);

  const toggleAmbientFromUser = () => {
    ambientManuallyControlled = true;
    setAmbientState(!ambientEnabled, { optimistic: true });
  };

  if (audioToggle) {
    audioToggle.addEventListener("click", toggleAmbientFromUser);
  }

  if (audioStatusMetrics) {
    audioStatusMetrics.addEventListener("click", toggleAmbientFromUser);
    audioStatusMetrics.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      toggleAmbientFromUser();
    });
  }

  const bootstrapAmbient = (event) => {
    if (audioToggle && audioToggle.contains(event.target)) return;
    if (audioStatusMetrics && audioStatusMetrics.contains(event.target)) return;
    if (ambientManuallyControlled) {
      document.removeEventListener("pointerdown", bootstrapAmbient);
      return;
    }
    if (ambientEnabled) {
      document.removeEventListener("pointerdown", bootstrapAmbient);
      return;
    }
    if (ambientBootstrapPending) return;
    ambientBootstrapPending = true;
    setAmbientState(true, { optimistic: true }).then((started) => {
      ambientBootstrapPending = false;
      if (started || ambientManuallyControlled) {
        document.removeEventListener("pointerdown", bootstrapAmbient);
      }
    });
  };
  document.addEventListener("pointerdown", bootstrapAmbient, { passive: true });

  document.addEventListener("visibilitychange", () => {
    if (!ytPlayer) return;
    try {
      if (document.hidden) {
        ytPlayer.pauseVideo();
      } else if (ambientEnabled) {
        ytPlayer.setVolume(YT_LOW_VOLUME);
        ytPlayer.playVideo();
      }
    } catch (_) {}
  });
}

initPageLoader();
initRandomSeparators();
initAmbientControls();
window.addEventListener("resize", debounce(initRandomSeparators, 260), {
  passive: true,
});
window.addEventListener("resize", debounce(updateCinematicScroll, 140), {
  passive: true,
});

function openMenu() {
  if (!mobileMenu || !menuOverlay || !menuBtn) return;
  mobileMenu.classList.add("open");
  menuOverlay.classList.add("open");
  menuBtn.classList.add("open");
  menuBtn.setAttribute("aria-expanded", "true");
  menuBtn.setAttribute("aria-label", "Fechar menu");
  mobileMenu.setAttribute("aria-hidden", "false");
  mobileMenu.removeAttribute("inert");
  menuOverlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeMenu() {
  if (!mobileMenu || !menuOverlay || !menuBtn) return;
  mobileMenu.classList.remove("open");
  menuOverlay.classList.remove("open");
  menuBtn.classList.remove("open");
  menuBtn.setAttribute("aria-expanded", "false");
  menuBtn.setAttribute("aria-label", "Abrir menu");
  mobileMenu.setAttribute("aria-hidden", "true");
  mobileMenu.setAttribute("inert", "");
  menuOverlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

if (menuBtn && mobileMenu && menuOverlay) {
  menuBtn.addEventListener("click", () => {
    if (mobileMenu.classList.contains("open")) closeMenu();
    else openMenu();
  });

  menuOverlay.addEventListener("click", closeMenu);
  document
    .querySelectorAll("[data-close-menu]")
    .forEach((el) => el.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (mobileMenu.classList.contains("open")) closeMenu();
  });
}

const parallaxEls = [...document.querySelectorAll("[data-parallax]")];
const sections = [...document.querySelectorAll(".section")];
const scrollFxEls = [...document.querySelectorAll(".scroll-fx")];

function updateAdvancedScrollFx() {
  if (!scrollFxEls.length) return;

  if (prefersReducedMotion) {
    scrollFxEls.forEach((el) => {
      el.style.setProperty("--sfy", "0px");
      el.style.setProperty("--sfx", "0px");
      el.style.setProperty("--sfp", "1");
      el.style.setProperty("--sfo", "1");
    });
    return;
  }

  const vh = window.innerHeight || 1;
  const centerLine = vh * 0.5;
  const panAmplitude = window.innerWidth <= 768 ? 2 : window.innerWidth <= 980 ? 4 : 8;

  scrollFxEls.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const center = rect.top + rect.height * 0.5;
    const distance = (center - centerLine) / (vh * 0.95);
    const progress = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height)));

    const y = Math.max(-44, Math.min(44, -distance * 34));
    const opacity = 0.55 + progress * 0.45;

    el.style.setProperty("--sfy", `${Math.round(y)}px`);
    el.style.setProperty("--sfp", progress.toFixed(4));
    el.style.setProperty("--sfo", `${opacity.toFixed(4)}`);

    if (el.classList.contains("scroll-pan")) {
      const x = Math.max(-panAmplitude, Math.min(panAmplitude, -distance * panAmplitude * 0.75));
      el.style.setProperty("--sfx", `${Math.round(x)}px`);
    }
  });
}

let scrollTicking = false;
function onScroll() {
  if (nav) nav.classList.toggle("scrolled", window.scrollY > 24);

  if (!prefersReducedMotion) {
    parallaxEls.forEach((el) => {
      const speed = parseFloat(el.dataset.parallax || "0");
      el.style.setProperty("--sy", `${window.scrollY * speed}px`);
    });
    updateCinematicScroll();
  }
  updateAdvancedScrollFx();
  scrollTicking = false;
}

window.addEventListener(
  "scroll",
  () => {
    if (!scrollTicking) {
      requestAnimationFrame(onScroll);
      scrollTicking = true;
    }
  },
  { passive: true },
);
onScroll();

const revealEls = [...document.querySelectorAll(".reveal")];
revealEls.forEach((el, idx) =>
  el.style.setProperty("--delay", `${Math.min((idx % 8) * 60, 360)}ms`),
);

if (!prefersReducedMotion) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -50px 0px" },
  );

  revealEls.forEach((el) => revealObserver.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("in"));
}

if (!prefersReducedMotion) {
  const heroStage = document.querySelector(".hero-stage");
  if (heroStage) {
    heroStage.addEventListener("mousemove", (e) => {
      const rect = heroStage.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * -6;
      heroStage.style.transform = `perspective(900px) rotateX(${y}deg) rotateY(${x}deg) translateY(-2px)`;
    });
    heroStage.addEventListener("mouseleave", () => {
      heroStage.style.transform = "";
    });
  }

  if (heroSection && keychainHero) {
    let keychainTicking = false;
    let keychainRx = 0;
    let keychainRy = 0;

    const renderKeychain = () => {
      keychainHero.style.setProperty("--k-rx", `${keychainRx.toFixed(2)}deg`);
      keychainHero.style.setProperty("--k-ry", `${keychainRy.toFixed(2)}deg`);
      keychainTicking = false;
    };

    heroSection.addEventListener("pointermove", (e) => {
      const rect = keychainHero.getBoundingClientRect();
      const nx = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
      const ny = (e.clientY - (rect.top + rect.height / 2)) / rect.height;
      keychainRy = Math.max(-14, Math.min(14, nx * 20));
      keychainRx = Math.max(-10, Math.min(10, -ny * 16));

      if (!keychainTicking) {
        requestAnimationFrame(renderKeychain);
        keychainTicking = true;
      }
    });

    heroSection.addEventListener("pointerleave", () => {
      keychainRx = 0;
      keychainRy = 0;
      if (!keychainTicking) {
        requestAnimationFrame(renderKeychain);
        keychainTicking = true;
      }
    });
  }

  document.querySelectorAll(".tilt-card").forEach((card) => {
    if (card.classList.contains("hero-stage")) return;
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * -4;
      card.style.transform = `perspective(900px) rotateX(${y}deg) rotateY(${x}deg) translateY(-2px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });

  if (heroSection && gravityNodes.length) {
    const pullRadius = 360;
    let gravityTicking = false;
    let gravityPoint = null;

    const applyGravity = () => {
      if (!gravityPoint) {
        gravityNodes.forEach((node) => {
          node.style.translate = "0px 0px";
        });
        gravityTicking = false;
        return;
      }

      gravityNodes.forEach((node) => {
        const rect = node.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = gravityPoint.x - cx;
        const dy = gravityPoint.y - cy;
        const dist = Math.hypot(dx, dy) || 1;
        const influence = Math.max(0, (pullRadius - dist) / pullRadius);
        const strength = parseFloat(node.dataset.gravity || "16");
        const tx = (dx / dist) * influence * strength;
        const ty = (dy / dist) * influence * strength;

        node.style.translate = `${tx.toFixed(2)}px ${ty.toFixed(2)}px`;
      });

      gravityTicking = false;
    };

    heroSection.addEventListener("pointermove", (e) => {
      gravityPoint = { x: e.clientX, y: e.clientY };
      if (!gravityTicking) {
        requestAnimationFrame(applyGravity);
        gravityTicking = true;
      }
    });

    heroSection.addEventListener("pointerleave", () => {
      gravityPoint = null;
      if (!gravityTicking) {
        requestAnimationFrame(applyGravity);
        gravityTicking = true;
      }
    });
  }

  let pointerFrame = 0;
  const pointerState = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 };

  const renderPointerEffects = () => {
    const mx = (pointerState.x / window.innerWidth - 0.5) * 24;
    const my = (pointerState.y / window.innerHeight - 0.5) * 24;

    parallaxEls.forEach((el, idx) => {
      const factor = (idx + 1) * 0.28;
      el.style.setProperty("--mx", `${mx * factor}px`);
      el.style.setProperty("--my", `${my * factor * 0.6}px`);
    });

    const gx = `${(pointerState.x / window.innerWidth) * 100}%`;
    const gy = `${(pointerState.y / window.innerHeight) * 100}%`;
    sections.forEach((section) => {
      section.style.setProperty("--gx", gx);
      section.style.setProperty("--gy", gy);
    });

    pointerFrame = 0;
  };

  window.addEventListener(
    "pointermove",
    (e) => {
      pointerState.x = e.clientX;
      pointerState.y = e.clientY;
      if (!pointerFrame) {
        pointerFrame = requestAnimationFrame(renderPointerEffects);
      }
    },
    { passive: true },
  );
}

if (
  heroParticleCanvas &&
  heroSection &&
  !prefersReducedMotion
) {
  const heroCtx = heroParticleCanvas.getContext("2d", { alpha: true });
  let heroWidth = 0;
  let heroHeight = 0;
  let heroDpr = 1;
  let heroRaf = 0;
  let heroRunning = false;
  let heroNodes = [];
  let heroInView = true;
  const pointer = { x: 0, y: 0, active: false };

  function setupHeroNodes() {
    const areaFactor = (heroWidth * heroHeight) / 70000;
    const compact = window.innerWidth <= 780;
    const minCount = compact ? 10 : 16;
    const maxCount = compact ? 28 : 42;
    const count = Math.max(minCount, Math.min(maxCount, Math.round(areaFactor)));

    heroNodes = Array.from({ length: count }, () => ({
      x: Math.random() * heroWidth,
      y: Math.random() * heroHeight,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r: Math.random() * 1.35 + 0.45,
      a: Math.random() * 0.35 + 0.16,
    }));
  }

  function resizeHeroParticles() {
    const rect = heroSection.getBoundingClientRect();
    heroWidth = Math.max(1, Math.floor(rect.width));
    heroHeight = Math.max(1, Math.floor(rect.height));
    heroDpr = Math.min(window.devicePixelRatio || 1, 2);

    heroParticleCanvas.width = Math.floor(heroWidth * heroDpr);
    heroParticleCanvas.height = Math.floor(heroHeight * heroDpr);
    heroParticleCanvas.style.width = `${heroWidth}px`;
    heroParticleCanvas.style.height = `${heroHeight}px`;
    heroCtx.setTransform(heroDpr, 0, 0, heroDpr, 0, 0);
    setupHeroNodes();
  }

  function animateHeroParticles() {
    if (!heroInView || !heroRunning) return;

    heroCtx.clearRect(0, 0, heroWidth, heroHeight);

    for (let i = 0; i < heroNodes.length; i++) {
      const p = heroNodes[i];
      p.x += p.vx;
      p.y += p.vy;

      if (pointer.active) {
        const dx = pointer.x - p.x;
        const dy = pointer.y - p.y;
        const dist = Math.hypot(dx, dy) || 1;
        const radius = window.innerWidth <= 780 ? 128 : 190;
        if (dist < radius) {
          const pull = ((radius - dist) / radius) * 0.032;
          p.vx += (dx / dist) * pull;
          p.vy += (dy / dist) * pull;
        }
      }

      p.vx *= 0.985;
      p.vy *= 0.985;

      if (p.x < -10) p.x = heroWidth + 10;
      if (p.x > heroWidth + 10) p.x = -10;
      if (p.y < -10) p.y = heroHeight + 10;
      if (p.y > heroHeight + 10) p.y = -10;

      heroCtx.beginPath();
      heroCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      heroCtx.fillStyle = `rgba(157,232,255,${p.a})`;
      heroCtx.fill();

      for (let j = i + 1; j < heroNodes.length; j++) {
        const q = heroNodes[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.hypot(dx, dy);
        const linkDist = window.innerWidth <= 780 ? 80 : 108;
        if (dist < linkDist) {
          heroCtx.beginPath();
          heroCtx.moveTo(p.x, p.y);
          heroCtx.lineTo(q.x, q.y);
          heroCtx.strokeStyle = `rgba(126,216,255,${
            0.11 * (1 - dist / linkDist)
          })`;
          heroCtx.lineWidth = 1;
          heroCtx.stroke();
        }
      }
    }

    heroRaf = requestAnimationFrame(animateHeroParticles);
  }

  function startHeroParticles() {
    if (heroRunning) return;
    heroRunning = true;
    animateHeroParticles();
  }

  function stopHeroParticles() {
    heroRunning = false;
    cancelAnimationFrame(heroRaf);
  }

  const heroObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        heroInView = entry.isIntersecting;
        if (heroInView) {
          startHeroParticles();
        } else {
          stopHeroParticles();
        }
      });
    },
    { threshold: 0.06 },
  );

  heroObserver.observe(heroSection);

  heroSection.addEventListener("pointermove", (e) => {
    const rect = heroParticleCanvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
    pointer.active = true;
  });

  heroSection.addEventListener("pointerleave", () => {
    pointer.active = false;
  });

  const onHeroResize = debounce(() => {
    resizeHeroParticles();
    if (heroInView) {
      stopHeroParticles();
      startHeroParticles();
    }
  }, 180);

  resizeHeroParticles();
  startHeroParticles();
  window.addEventListener("resize", onHeroResize, { passive: true });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopHeroParticles();
    } else if (heroInView) {
      startHeroParticles();
    }
  });
} else if (heroParticleCanvas) {
  heroParticleCanvas.style.display = "none";
}

const lazyImages = [...document.querySelectorAll("img[data-src]")];
if (lazyImages.length) {
  const loadImage = (img) => {
    if (!img.dataset.src) return;
    img.src = img.dataset.src;
    img.removeAttribute("data-src");
  };

  if ("IntersectionObserver" in window) {
    const imgObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          loadImage(entry.target);
          imgObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "220px 0px" },
    );
    lazyImages.forEach((img) => imgObserver.observe(img));
  } else {
    lazyImages.forEach(loadImage);
  }
}

const particleCanvas = document.getElementById("bg-particles");
if (
  particleCanvas &&
  !prefersReducedMotion
) {
  const ctx = particleCanvas.getContext("2d", { alpha: true });
  let width = 0;
  let height = 0;
  let dpr = 1;
  let raf = 0;
  let bgRunning = false;
  let particles = [];

  function makeParticles() {
    const compact = width <= 780;
    const areaBased = Math.floor((width * height) / (compact ? 52000 : 42000));
    const maxCount = compact ? 24 : 54;
    const minCount = compact ? 10 : 16;
    const count = Math.max(minCount, Math.min(maxCount, areaBased));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      a: Math.random() * 0.4 + 0.14,
    }));
  }

  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    particleCanvas.width = Math.floor(width * dpr);
    particleCanvas.height = Math.floor(height * dpr);
    particleCanvas.style.width = `${width}px`;
    particleCanvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    makeParticles();
  }

  function animateParticles() {
    if (bgRunning) return;
    bgRunning = true;

    const tick = () => {
      if (!bgRunning) return;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(157,232,255,${p.a})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.hypot(dx, dy);
          const linkDist = width <= 780 ? 86 : 118;
          if (dist < linkDist) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(126,216,255,${0.08 * (1 - dist / linkDist)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(tick);
    };

    tick();
  }

  function stopParticles() {
    bgRunning = false;
    cancelAnimationFrame(raf);
  }

  resizeCanvas();
  animateParticles();
  window.addEventListener("resize", resizeCanvas, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopParticles();
    else animateParticles();
  });
} else if (particleCanvas) {
  particleCanvas.style.display = "none";
}
