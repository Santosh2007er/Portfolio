/**
 * Santosh G — Portfolio interactions
 * Vanilla JS only. Safe to remove any block — the page remains usable.
 */

/* ------------------------------------------------------------------
 * 1. Utility helpers
 * ------------------------------------------------------------------ */
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouchDevice = window.matchMedia("(hover: none)").matches;

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

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
 * 4. Scroll state for the header
 * ------------------------------------------------------------------ */
const header = $("#site-header");
const SCROLL_THRESHOLD = 30;

function updateHeaderState() {
  if (!header) return;
  if (window.scrollY > SCROLL_THRESHOLD) header.classList.add("is-scrolled");
  else header.classList.remove("is-scrolled");
}

window.addEventListener("scroll", updateHeaderState, { passive: true });
updateHeaderState();

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
 * ------------------------------------------------------------------ */
const revealTargets = $$(".reveal").filter(
  (el) => !el.closest(".hero-left") && !el.closest(".hero-right")
);

if ("IntersectionObserver" in window && !prefersReducedMotion) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
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
 * 9. Custom cursor dot (desktop, non-touch, motion-safe only)
 * ------------------------------------------------------------------ */
const cursorDot = $("#cursor-dot");

if (cursorDot && !isTouchDevice && !prefersReducedMotion) {
  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;

  document.addEventListener("mousemove", (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
  });

  // Grow the dot when hovering interactive elements
  const interactiveSelector = "a, button, input, textarea, .project-card, .skill-card";
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(interactiveSelector)) {
      cursorDot.classList.add("is-hover");
    }
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(interactiveSelector)) {
      cursorDot.classList.remove("is-hover");
    }
  });

  // Smooth follow using requestAnimationFrame
  function tickCursor() {
    currentX += (targetX - currentX) * 0.18;
    currentY += (targetY - currentY) * 0.18;
    cursorDot.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    requestAnimationFrame(tickCursor);
  }
  requestAnimationFrame(tickCursor);
} else if (cursorDot) {
  cursorDot.remove();
}

/* ------------------------------------------------------------------
 * 10. 3D tilt on the hero ID card (desktop only)
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
  contactForm.addEventListener("submit", (event) => {
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

    formNote.classList.remove("is-error");
    formNote.classList.add("is-success");
    formNote.textContent =
      "Looks good! This is a frontend demo — connect a service like Formspree to actually send it.";
    contactForm.reset();
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