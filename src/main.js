/**
 * Santosh G — Portfolio interactions
 * Vanilla JS only. Safe to remove any block — the page remains usable.
 */

import "./effects.css";

/* ------------------------------------------------------------------
 * 1. Utility helpers
 * ------------------------------------------------------------------ */
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouchDevice = window.matchMedia("(hover: none)").matches;

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// Tells the CSS that JS is running (needed for the .reveal animations)
document.documentElement.classList.add("js-ready");

/* ------------------------------------------------------------------
 * 2. Page loader — hide after the page (or window load) is ready
 * ------------------------------------------------------------------ */
const pageLoader = $("#page-loader");

function hideLoader() {
  if (!pageLoader) return;
  pageLoader.classList.add("is-hidden");
  // Remove from the DOM after the transition finishes (keeps it out of the way)
  window.setTimeout(() => pageLoader.remove(), 700);
}

// Prefer window load; fall back to DOMContentLoaded in case load fires late.
if (document.readyState === "complete") {
  hideLoader();
} else {
  window.addEventListener("load", hideLoader, { once: true });
  // Safety net — never keep the loader visible for more than 1.5s
  window.setTimeout(hideLoader, 1500);
}

/* ------------------------------------------------------------------
 * 3. Mobile navigation
 * ------------------------------------------------------------------ */
const menuToggle = $("#menu-toggle");
const mobileMenu = $("#mobile-menu");

function closeMobileMenu() {
  if (!menuToggle || !mobileMenu) return;
  menuToggle.setAttribute("aria-expanded", "false");
  mobileMenu.setAttribute("aria-hidden", "true");
  mobileMenu.classList.remove("is-open");
}

function openMobileMenu() {
  if (!menuToggle || !mobileMenu) return;
  menuToggle.setAttribute("aria-expanded", "true");
  mobileMenu.setAttribute("aria-hidden", "false");
  mobileMenu.classList.add("is-open");
}

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    isOpen ? closeMobileMenu() : openMobileMenu();
  });

  // Close when a link is tapped
  $$(".mobile-link", mobileMenu).forEach((link) =>
    link.addEventListener("click", closeMobileMenu)
  );

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMobileMenu();
  });

  // Close when clicking outside the menu / toggle
  document.addEventListener("click", (e) => {
    if (!mobileMenu.classList.contains("is-open")) return;
    if (mobileMenu.contains(e.target) || menuToggle.contains(e.target)) return;
    closeMobileMenu();
  });
}

/* ------------------------------------------------------------------
 * 4. Scroll state for the header (+ scroll progress bar + grid parallax)
 * ------------------------------------------------------------------ */
const header = $("#site-header");
const scrollProgress = $("#scroll-progress");
const bgGrid = $(".bg-grid");
const SCROLL_THRESHOLD = 30;

function updateHeaderState() {
  if (!header) return;
  if (window.scrollY > SCROLL_THRESHOLD) header.classList.add("is-scrolled");
  else header.classList.remove("is-scrolled");
}

function updateScrollProgress() {
  if (!scrollProgress) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  scrollProgress.style.transform = `scaleX(${ratio})`;
}

function updateGridParallax() {
  if (bgGrid && !prefersReducedMotion) {
    bgGrid.style.setProperty("--sy", window.scrollY);
  }
}

window.addEventListener(
  "scroll",
  () => {
    updateHeaderState();
    updateScrollProgress();
    updateGridParallax();
  },
  { passive: true }
);
window.addEventListener("resize", updateScrollProgress, { passive: true });
updateHeaderState();
updateScrollProgress();
updateGridParallax();

/* ------------------------------------------------------------------
 * 5. Active nav link based on the section in view
 * ------------------------------------------------------------------ */
const navLinks = $$(".nav-link");
const sectionIds = ["home", "about", "skills", "projects", "contact"];
const sections = sectionIds
  .map((id) => document.getElementById(id))
  .filter(Boolean);

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navLinks.forEach((link) => {
        const isMatch = link.getAttribute("href") === `#${id}`;
        link.classList.toggle("is-active", isMatch);
      });
    });
  },
  { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
);

sections.forEach((s) => navObserver.observe(s));

/* ------------------------------------------------------------------
 * 6. Hero — staggered reveal on initial load
 * ------------------------------------------------------------------ */
function revealHero() {
  const heroReveals = $$(".hero-left .reveal, .hero-right .reveal, .hero-left > .reveal");
  // Ensure unique elements only (a selector can match the same node twice)
  const unique = Array.from(new Set(heroReveals));

  unique.forEach((el, i) => {
    if (prefersReducedMotion) {
      el.classList.add("is-visible");
      return;
    }
    window.setTimeout(() => el.classList.add("is-visible"), 120 + i * 110);
  });
}

// Trigger once the loader has finished
window.addEventListener("load", () => {
  window.setTimeout(revealHero, 200);
});
// Safety fallback
window.setTimeout(revealHero, 1800);

/* ------------------------------------------------------------------
 * 7. Scroll-triggered reveals (all .reveal not in the hero)
 *    Siblings now reveal one after another (staggered).
 * ------------------------------------------------------------------ */
const revealTargets = $$(".reveal").filter(
  (el) => !el.closest(".hero-left") && !el.closest(".hero-right")
);

if ("IntersectionObserver" in window && !prefersReducedMotion) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const siblings = el.parentElement
          ? Array.from(el.parentElement.children).filter((c) => c.classList.contains("reveal"))
          : [el];
        const idx = Math.max(0, siblings.indexOf(el));
        const delay = Math.min(idx, 5) * 90;
        window.setTimeout(() => el.classList.add("is-visible"), delay);
        observer.unobserve(el);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );
  revealTargets.forEach((el) => revealObserver.observe(el));
} else {
  // No observer / reduced motion — show everything
  revealTargets.forEach((el) => el.classList.add("is-visible"));
}

/* ------------------------------------------------------------------
 * 8. Rotating headline in the hero
 * ------------------------------------------------------------------ */
const rotatingHeadline = $("#rotating-headline .typed-text");

const HEADLINES = [
  "CSBS Student",
  "Aspiring Data Scientist",
  "Developer",
  "Java Learner",
];

if (rotatingHeadline && !prefersReducedMotion) {
  let headIndex = 0;
  let charIndex = HEADLINES[0].length;
  let deleting = false;

  const typeSpeed = 70;
  const deleteSpeed = 35;
  const holdTime = 1400;
  const gapTime = 400;

  function stepHeadline() {
    const current = HEADLINES[headIndex];

    if (!deleting) {
      charIndex++;
      rotatingHeadline.textContent = current.slice(0, charIndex);
      if (charIndex >= current.length) {
        deleting = true;
        window.setTimeout(stepHeadline, holdTime);
        return;
      }
      window.setTimeout(stepHeadline, typeSpeed);
    } else {
      charIndex--;
      rotatingHeadline.textContent = current.slice(0, charIndex);
      if (charIndex <= 0) {
        deleting = false;
        headIndex = (headIndex + 1) % HEADLINES.length;
        window.setTimeout(stepHeadline, gapTime);
        return;
      }
      window.setTimeout(stepHeadline, deleteSpeed);
    }
  }

  // Start cycling after a short pause
  window.setTimeout(stepHeadline, holdTime);
}

/* ------------------------------------------------------------------
 * 9. Custom cursor dot + trailing ring (desktop, non-touch, motion-safe)
 * ------------------------------------------------------------------ */
const cursorDot = $("#cursor-dot");

if (cursorDot && !isTouchDevice && !prefersReducedMotion) {
  const cursorRing = document.createElement("div");
  cursorRing.className = "cursor-ring";
  cursorRing.setAttribute("aria-hidden", "true");
  document.body.appendChild(cursorRing);

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;
  let ringX = targetX;
  let ringY = targetY;

  document.addEventListener("mousemove", (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
  });

  // Grow the dot when hovering interactive elements
  const interactiveSelector = "a, button, input, textarea, .project-card, .skill-card";
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(interactiveSelector)) {
      cursorDot.classList.add("is-hover");
      cursorRing.classList.add("is-hover");
    }
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(interactiveSelector)) {
      cursorDot.classList.remove("is-hover");
      cursorRing.classList.remove("is-hover");
    }
  });

  // Smooth follow using requestAnimationFrame
  function tickCursor() {
    currentX += (targetX - currentX) * 0.18;
    currentY += (targetY - currentY) * 0.18;
    ringX += (targetX - ringX) * 0.09;
    ringY += (targetY - ringY) * 0.09;
    cursorDot.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
    requestAnimationFrame(tickCursor);
  }
  requestAnimationFrame(tickCursor);
} else if (cursorDot) {
  cursorDot.remove();
}

/* ------------------------------------------------------------------
 * 10. 3D tilt on the hero ID card (desktop only) + glare
 * ------------------------------------------------------------------ */
const idCard = $("#id-card");

if (idCard && !isTouchDevice && !prefersReducedMotion) {
  const MAX_TILT = 10; // degrees

  idCard.addEventListener("mousemove", (e) => {
    const rect = idCard.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    const rotY = (px - 0.5) * (MAX_TILT * 2);
    const rotX = (0.5 - py) * (MAX_TILT * 2);

    idCard.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    idCard.style.setProperty("--gx", `${px * 100}%`);
    idCard.style.setProperty("--gy", `${py * 100}%`);
    idCard.classList.add("is-tilting");
  });

  idCard.addEventListener("mouseleave", () => {
    idCard.style.transform = "";
    idCard.classList.remove("is-tilting");
  });
}

/* ------------------------------------------------------------------
 * 11. Contact form (frontend-only demo)
 * ------------------------------------------------------------------ */

const contactForm = $("#contact-form");
const formNote = $("#form-note");

if (contactForm && formNote) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = contactForm.elements["name"]?.value.trim() || "";
    const email = contactForm.elements["email"]?.value.trim() || "";
    const message = contactForm.elements["message"]?.value.trim() || "";

    if (!name || !email || !message) {
      formNote.textContent = "Please fill in all fields.";
      formNote.classList.add("is-error");
      formNote.classList.remove("is-success");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      formNote.textContent = "Please enter a valid email address.";
      formNote.classList.add("is-error");
      formNote.classList.remove("is-success");
      return;
    }

    formNote.classList.remove("is-error", "is-success");
    formNote.textContent = "Sending your message...";

    try {
      const response = await fetch("http://192.168.1.6:3000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, message })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to send message.");
      }

      formNote.textContent = result.emailSent
    ? "Message sent successfully!"
    : "Message saved, but email notification failed.";
      formNote.classList.add("is-success");
      contactForm.reset();

    } catch (error) {
      console.error("Contact form error:", error);

      formNote.textContent =
        error.message || "Something went wrong. Please try again.";

      formNote.classList.add("is-error");
    }
  });
}


/* ------------------------------------------------------------------
 * 12. Dynamic footer year
 * ------------------------------------------------------------------ */
const yearEl = $("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ------------------------------------------------------------------
 * 13. Prevent placeholder links from jumping to top
 * ------------------------------------------------------------------ */
$$('a[data-placeholder="true"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    link.classList.add("is-flashing");
    window.setTimeout(() => link.classList.remove("is-flashing"), 600);
  });
});

/* ------------------------------------------------------------------
 * 14. Smooth in-page anchor scrolling (fallback for older browsers)
 * ------------------------------------------------------------------ */
if (!("scrollBehavior" in document.documentElement.style) && !prefersReducedMotion) {
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

/* ------------------------------------------------------------------
 * 15. LIVE PARTICLE NETWORK BACKGROUND  (upgraded)
 *     - depth-based particles that pulse
 *     - cursor repel + glowing lines to the cursor
 *     - glowing data packets travelling along links
 *     - occasional shooting stars
 *     - click / tap = shockwave that pushes particles away
 *     - reduced-motion users get a calm, slow version (not hidden)
 * ------------------------------------------------------------------ */
const particleCanvas = $("#particle-canvas");
const pctx = particleCanvas ? particleCanvas.getContext("2d") : null;

if (particleCanvas && pctx) {
  const SPEED = prefersReducedMotion ? 0.3 : 1;
  const LINK_DIST = 140;
  const LINK_DIST2 = LINK_DIST * LINK_DIST;
  const MOUSE_DIST = 190;
  const COLORS = ["124,211,255", "167,139,250", "240,171,252"];

  let width = 0;
  let height = 0;
  let dpr = 1;
  let particles = [];
  let packets = [];
  let ripples = [];
  let stars = [];
  let rafId = null;
  let lastTs = 0;
  const mouse = { x: -9999, y: -9999 };

  const targetCount = () => {
    const base = Math.floor((width * height) / 14000);
    return Math.min(isTouchDevice ? 70 : 120, Math.max(28, base));
  };

  const makeParticle = (i) => {
    const z = 0.45 + Math.random() * 0.55; // depth: small = far away
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6 * z,
      vy: (Math.random() - 0.5) * 0.6 * z,
      bx: 0, // burst velocity (decays)
      by: 0,
      r: (Math.random() * 1.4 + 0.7) * z + 0.3,
      z,
      c: COLORS[i % COLORS.length],
      ph: Math.random() * Math.PI * 2,
      md: 9999,
    };
  };

  function resizeCanvas() {
    const oldW = width;
    const oldH = height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    particleCanvas.width = Math.round(width * dpr);
    particleCanvas.height = Math.round(height * dpr);
    pctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // keep existing particles (scaled) instead of resetting on every resize
    if (oldW && oldH) {
      particles.forEach((p) => {
        p.x *= width / oldW;
        p.y *= height / oldH;
      });
    }
    const want = targetCount();
    while (particles.length < want) particles.push(makeParticle(particles.length));
    if (particles.length > want) particles.length = want;
    packets = [];
  }

  function spawnPacket() {
    if (packets.length >= 7 || Math.random() > 0.05 * SPEED) return;
    const a = particles[Math.floor(Math.random() * particles.length)];
    if (!a) return;
    for (let k = 0; k < particles.length; k++) {
      const b = particles[k];
      if (b === a) continue;
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      if (dx * dx + dy * dy < LINK_DIST2) {
        packets.push({ a, b, t: 0, s: 0.012 + Math.random() * 0.014 });
        return;
      }
    }
  }

  function spawnStar() {
    if (stars.length >= 2 || Math.random() > 0.004 * SPEED) return;
    stars.push({
      x: Math.random() * width * 0.8,
      y: Math.random() * height * 0.45,
      vx: 9 + Math.random() * 5,
      vy: 4 + Math.random() * 3,
      life: 0,
      max: 50,
    });
  }

  function drawParticles(ts) {
    const dt = Math.min(2.5, (ts - (lastTs || ts)) / 16.67 || 1);
    lastTs = ts;
    const t = ts / 1000;
    const step = dt * SPEED;

    pctx.clearRect(0, 0, width, height);

    /* ---- shooting stars ---- */
    spawnStar();
    for (let i = stars.length - 1; i >= 0; i--) {
      const s = stars[i];
      s.x += s.vx * step;
      s.y += s.vy * step;
      s.life += step;
      const fade = 1 - s.life / s.max;
      if (fade <= 0 || s.x > width + 150 || s.y > height + 150) {
        stars.splice(i, 1);
        continue;
      }
      const len = 130;
      const mag = Math.hypot(s.vx, s.vy);
      const tx = s.x - (s.vx / mag) * len;
      const ty = s.y - (s.vy / mag) * len;
      const g = pctx.createLinearGradient(s.x, s.y, tx, ty);
      g.addColorStop(0, `rgba(255,255,255,${0.9 * fade})`);
      g.addColorStop(0.3, `rgba(124,211,255,${0.5 * fade})`);
      g.addColorStop(1, "rgba(124,211,255,0)");
      pctx.strokeStyle = g;
      pctx.lineWidth = 1.6;
      pctx.beginPath();
      pctx.moveTo(s.x, s.y);
      pctx.lineTo(tx, ty);
      pctx.stroke();
    }

    /* ---- update particles ---- */
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      const mdx = p.x - mouse.x;
      const mdy = p.y - mouse.y;
      const md = Math.hypot(mdx, mdy);
      p.md = md;
      if (md < MOUSE_DIST && md > 0) {
        const force = (1 - md / MOUSE_DIST) * 0.9 * step;
        p.x += (mdx / md) * force;
        p.y += (mdy / md) * force;
      }

      p.x += (p.vx + p.bx) * step;
      p.y += (p.vy + p.by) * step;
      p.bx *= 0.93;
      p.by *= 0.93;

      if (p.x < 0) { p.x = 0; p.vx = Math.abs(p.vx); }
      else if (p.x > width) { p.x = width; p.vx = -Math.abs(p.vx); }
      if (p.y < 0) { p.y = 0; p.vy = Math.abs(p.vy); }
      else if (p.y > height) { p.y = height; p.vy = -Math.abs(p.vy); }
    }

    /* ---- links between particles ---- */
    pctx.lineWidth = 1;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < LINK_DIST2) {
          const d = Math.sqrt(d2);
          pctx.strokeStyle = `rgba(${p.c},${(1 - d / LINK_DIST) * 0.38})`;
          pctx.beginPath();
          pctx.moveTo(p.x, p.y);
          pctx.lineTo(q.x, q.y);
          pctx.stroke();
        }
      }

      // lines from the cursor to nearby particles
      if (p.md < MOUSE_DIST * 1.2) {
        pctx.strokeStyle = `rgba(124,211,255,${(1 - p.md / (MOUSE_DIST * 1.2)) * 0.65})`;
        pctx.beginPath();
        pctx.moveTo(p.x, p.y);
        pctx.lineTo(mouse.x, mouse.y);
        pctx.stroke();
      }
    }

    /* ---- data packets running along links ---- */
    spawnPacket();
    for (let i = packets.length - 1; i >= 0; i--) {
      const k = packets[i];
      k.t += k.s * step;
      const dx = k.a.x - k.b.x;
      const dy = k.a.y - k.b.y;
      if (k.t >= 1 || dx * dx + dy * dy > LINK_DIST2 * 1.25) {
        packets.splice(i, 1);
        continue;
      }
      const x = k.a.x + (k.b.x - k.a.x) * k.t;
      const y = k.a.y + (k.b.y - k.a.y) * k.t;
      pctx.fillStyle = `rgba(${k.a.c},0.28)`;
      pctx.beginPath();
      pctx.arc(x, y, 6, 0, Math.PI * 2);
      pctx.fill();
      pctx.fillStyle = "rgba(255,255,255,0.95)";
      pctx.beginPath();
      pctx.arc(x, y, 1.8, 0, Math.PI * 2);
      pctx.fill();
    }

    /* ---- draw particles (glow halo + core, no expensive shadowBlur) ---- */
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const pulse = 1 + 0.25 * Math.sin(t * 1.6 + p.ph);
      const near = p.md < MOUSE_DIST ? 1 - p.md / MOUSE_DIST : 0;
      const r = p.r * pulse * (1 + near * 0.8);

      pctx.fillStyle = `rgba(${p.c},${0.09 + near * 0.15})`;
      pctx.beginPath();
      pctx.arc(p.x, p.y, r * 4, 0, Math.PI * 2);
      pctx.fill();

      pctx.fillStyle = `rgba(${p.c},${0.55 + p.z * 0.4})`;
      pctx.beginPath();
      pctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      pctx.fill();
    }

    /* ---- click shockwave rings ---- */
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rp = ripples[i];
      rp.r += 7 * step;
      rp.a -= 0.016 * step;
      if (rp.a <= 0) {
        ripples.splice(i, 1);
        continue;
      }
      pctx.strokeStyle = `rgba(167,139,250,${rp.a})`;
      pctx.lineWidth = 2;
      pctx.beginPath();
      pctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
      pctx.stroke();
      pctx.strokeStyle = `rgba(124,211,255,${rp.a * 0.6})`;
      pctx.beginPath();
      pctx.arc(rp.x, rp.y, rp.r * 0.7, 0, Math.PI * 2);
      pctx.stroke();
    }

    rafId = requestAnimationFrame(drawParticles);
  }

  function startParticles() {
    if (rafId === null) {
      lastTs = 0;
      rafId = requestAnimationFrame(drawParticles);
    }
  }

  function stopParticles() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function shockwave(x, y) {
    ripples.push({ x, y, r: 0, a: 0.7 });
    particles.forEach((p) => {
      const dx = p.x - x;
      const dy = p.y - y;
      const d = Math.hypot(dx, dy);
      if (d < 280 && d > 0) {
        const f = (1 - d / 280) * 7;
        p.bx += (dx / d) * f;
        p.by += (dy / d) * f;
      }
    });
  }

  resizeCanvas();
  startParticles();

  window.addEventListener("resize", resizeCanvas, { passive: true });
  window.addEventListener(
    "mousemove",
    (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    },
    { passive: true }
  );
  document.addEventListener("mouseout", (e) => {
    if (!e.relatedTarget) {
      mouse.x = -9999;
      mouse.y = -9999;
    }
  });
  // touch support
  window.addEventListener(
    "touchmove",
    (e) => {
      const tch = e.touches[0];
      if (tch) {
        mouse.x = tch.clientX;
        mouse.y = tch.clientY;
      }
    },
    { passive: true }
  );
  window.addEventListener(
    "touchend",
    () => {
      window.setTimeout(() => {
        mouse.x = -9999;
        mouse.y = -9999;
      }, 500);
    },
    { passive: true }
  );
  window.addEventListener(
    "pointerdown",
    (e) => shockwave(e.clientX, e.clientY),
    { passive: true }
  );
  // Save battery: pause while the tab is hidden
  document.addEventListener("visibilitychange", () => {
    document.hidden ? stopParticles() : startParticles();
  });
}

/* ------------------------------------------------------------------
 * 16. Cool UI effects (desktop, motion-safe)
 * ------------------------------------------------------------------ */
if (!isTouchDevice && !prefersReducedMotion) {
  // 16a. Mouse-follow spotlight on cards
  $$(".glass-card, .skill-card, .project-card, .fact-card, .focus-item, .contact-row").forEach((el) => {
    el.classList.add("spot");
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      el.style.setProperty("--my", `${e.clientY - rect.top}px`);
    });
  });

  // 16b. Subtle 3D tilt on skill + project cards
  $$(".skill-card, .project-card").forEach((card) => {
    const MAX = 6;
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      card.classList.add("tilt-active");
      card.style.transform = `perspective(900px) rotateX(${(0.5 - py) * MAX * 2}deg) rotateY(${(px - 0.5) * MAX * 2}deg) translateY(-5px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.classList.remove("tilt-active");
      card.style.transform = "";
    });
  });

  // 16c. Magnetic buttons
  $$(".btn-primary, .btn-ghost, .btn-icon").forEach((btn) => {
    btn.classList.add("magnetic");
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      btn.style.transform = `translate(${dx * 0.22}px, ${dy * 0.3}px)`;
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
    });
  });

  // 16d. Glows + floating shapes drift with the mouse, and a soft
  //      spotlight follows the cursor (values are set only on the
  //      elements that use them, and batched once per frame).
  const driftEls = $$(".bg-glow, .floaty");
  const spotEl = document.createElement("div");
  spotEl.className = "cursor-spotlight";
  spotEl.setAttribute("aria-hidden", "true");
  document.body.appendChild(spotEl);

  let moveX = window.innerWidth / 2;
  let moveY = window.innerHeight / 3;
  let movePending = false;

  function applyMouseVars() {
    movePending = false;
    const px = (moveX / window.innerWidth - 0.5).toFixed(3);
    const py = (moveY / window.innerHeight - 0.5).toFixed(3);
    driftEls.forEach((el) => {
      el.style.setProperty("--px", px);
      el.style.setProperty("--py", py);
    });
    spotEl.style.setProperty("--cx", `${moveX}px`);
    spotEl.style.setProperty("--cy", `${moveY}px`);
  }

  window.addEventListener(
    "mousemove",
    (e) => {
      moveX = e.clientX;
      moveY = e.clientY;
      if (!movePending) {
        movePending = true;
        requestAnimationFrame(applyMouseVars);
      }
    },
    { passive: true }
  );
}

/* ------------------------------------------------------------------
 * 17. Button click ripple
 * ------------------------------------------------------------------ */
if (!prefersReducedMotion) {
  $$(".btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.6;
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      btn.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 650);
    });
  });
}