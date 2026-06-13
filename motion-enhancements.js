import { animate, inView, stagger } from "https://cdn.jsdelivr.net/npm/motion@12.40.0/+esm";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const premiumEase = [0.22, 1, 0.36, 1];

function setInitialEnterState(element, distance = 28) {
  element.style.opacity = "0";
  element.style.transform = `translate3d(0, ${distance}px, 0)`;
}

function setVisibleState(element) {
  element.style.opacity = "1";
  element.style.transform = "translate3d(0, 0, 0)";
}

export class AnimatedSection {
  constructor(element, options = {}) {
    this.element = element;
    this.cards = Array.from(element.querySelectorAll(options.cardSelector || "[data-motion-card]"));
    this.distance = options.distance || 28;
    this.cardDistance = options.cardDistance || 18;
    this.duration = options.duration || 0.72;
    this.cardDuration = options.cardDuration || 0.64;

    this.prepare();
    this.mount();
  }

  prepare() {
    if (prefersReducedMotion) {
      setVisibleState(this.element);
      this.cards.forEach(setVisibleState);
      return;
    }

    setInitialEnterState(this.element, this.distance);
    this.cards.forEach((card) => setInitialEnterState(card, this.cardDistance));
  }

  mount() {
    if (prefersReducedMotion) {
      return;
    }

    let hasPlayed = false;
    let stopWatching = () => {};

    stopWatching = inView(
      this.element,
      () => {
        if (hasPlayed) {
          return;
        }

        hasPlayed = true;

        animate(
          this.element,
          { opacity: 1, y: 0 },
          { duration: this.duration, ease: premiumEase }
        );

        if (this.cards.length > 0) {
          animate(
            this.cards,
            { opacity: 1, y: 0 },
            {
              duration: this.cardDuration,
              delay: stagger(0.1, { startDelay: 0.12 }),
              ease: premiumEase
            }
          );
        }

        stopWatching();
      },
      { amount: 0.22, margin: "0px 0px -10% 0px" }
    );
  }
}

export class AnimatedCard {
  constructor(element) {
    this.element = element;
    this.mount();
  }

  mount() {
    if (prefersReducedMotion) {
      return;
    }

    this.element.addEventListener("mouseenter", () => {
      animate(this.element, { y: -6 }, { duration: 0.22, ease: premiumEase });
    });

    this.element.addEventListener("mouseleave", () => {
      animate(this.element, { y: 0 }, { duration: 0.22, ease: premiumEase });
    });
  }
}

export class AnimatedButton {
  constructor(element) {
    this.element = element;
    this.mount();
  }

  mount() {
    if (prefersReducedMotion) {
      return;
    }

    this.element.addEventListener("mouseenter", () => {
      animate(this.element, { scale: 1.03 }, { duration: 0.18, ease: premiumEase });
    });

    this.element.addEventListener("mouseleave", () => {
      animate(this.element, { scale: 1 }, { duration: 0.18, ease: premiumEase });
    });
  }
}

function bootHeroMotion() {
  const hero = document.getElementById("home");
  if (!hero) {
    return;
  }

  const textItems = hero.querySelectorAll(".hero-eyebrow, h1, .hero-value-prop, .hero-credentials, .hero-cta-row");
  const imageFrame = hero.querySelector(".hero-media-frame");

  if (prefersReducedMotion) {
    [...textItems, imageFrame].forEach((item) => {
      if (item instanceof HTMLElement) {
        item.style.opacity = "1";
        item.style.transform = "none";
      }
    });
    return;
  }

  textItems.forEach((item) => setInitialEnterState(item, 24));

  if (imageFrame instanceof HTMLElement) {
    imageFrame.style.opacity = "0";
    imageFrame.style.transform = "scale(0.95)";
  }

  let hasPlayed = false;
  let stopWatching = () => {};

  stopWatching = inView(
    hero,
    () => {
      if (hasPlayed) {
        return;
      }

      hasPlayed = true;

      animate(textItems, { opacity: 1, y: 0 }, { duration: 0.72, delay: stagger(0.08), ease: premiumEase });

      if (imageFrame instanceof HTMLElement) {
        animate(imageFrame, { opacity: 1, scale: 1 }, { duration: 0.76, delay: 0.1, ease: premiumEase });
      }

      stopWatching();
    },
    { amount: 0.35 }
  );
}

function markMotionTargets() {
  document
    .querySelectorAll(
      [
        "#reports .report-card",
        "#background .foundation-v2-certificate",
        "#background .foundation-v2-mini-card",
        "#background .foundation-v2-research",
        "#background .foundation-v2-qual-group",
        "#squadiq .squadiq-tag",
        "#squadiq .shot-card",
        "#contact .contact-card"
      ].join(", ")
    )
    .forEach((element) => element.setAttribute("data-motion-card", ""));
}

function bootMotion() {
  bootHeroMotion();
  markMotionTargets();

  document
    .querySelectorAll("#reports, #background, #squadiq, #contact")
    .forEach((section) => new AnimatedSection(section));

  document
    .querySelectorAll(
      [
        "#reports .report-card",
        "#background .foundation-v2-mini-card",
        "#background .foundation-v2-research",
        "#background .foundation-v2-qual-group",
        "#contact .contact-card"
      ].join(", ")
    )
    .forEach((card) => new AnimatedCard(card));

  document
    .querySelectorAll(
      [
        ".btn",
        ".report-button",
        ".cert-modal-list a",
        ".cert-modal-close",
        ".copy-inline-btn",
        ".menu-toggle"
      ].join(", ")
    )
    .forEach((button) => new AnimatedButton(button));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootMotion, { once: true });
} else {
  bootMotion();
}
