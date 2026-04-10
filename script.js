const siteData =
  window.siteData ||
  {
    reports: [],
    certificates: [],
    foundationDocs: []
  };

function renderReports() {
  const reportsGrid = document.getElementById("reportsGrid");
  if (!reportsGrid) {
    return;
  }

  reportsGrid.innerHTML = siteData.reports
    .map((report) => {
      const hasImage = typeof report.imageSrc === "string" && report.imageSrc.length > 0;
      const hasHref = typeof report.href === "string" && report.href.length > 0;
      const mediaMarkup = hasImage
        ? `<img src="${report.imageSrc}" alt="${report.imageAlt}" loading="lazy" decoding="async" />`
        : `<div class="report-slot-placeholder"><span>Add Cover Photo</span></div>`;
      const actionMarkup = hasHref
        ? `<a href="${report.href}" target="_blank" rel="noopener noreferrer" class="report-button">View Report</a>`
        : `<span class="report-button report-button-disabled">Report Pending</span>`;

      return `
        <article class="report-card">
          <div class="report-image">
            ${mediaMarkup}
          </div>
          <div class="report-content">
            <p class="report-label">${report.tag}</p>
            <h3 class="report-title">${report.title}</h3>
            <p class="report-description">${report.description}</p>
            <div class="report-actions">
              ${actionMarkup}
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderLinkList(containerId, links) {
  const container = document.getElementById(containerId);
  if (!container) {
    return;
  }

  container.innerHTML = links
    .map(
      (item) =>
        `<a href="${item.href}" target="_blank" rel="noopener noreferrer">${item.label}</a>`
    )
    .join("");
}

renderReports();
renderLinkList("certificatesList", siteData.certificates);
renderLinkList("foundationDocsList", siteData.foundationDocs);

const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const sectionIds = ["home", "reports", "background", "squadiq", "contact"];
const topNavSectionLinks = document.querySelectorAll('.nav-links a[href^="#"], .mobile-menu a[href^="#"]');

function setMobileMenuState(isOpen) {
  if (!menuToggle || !mobileMenu) {
    return;
  }
  mobileMenu.classList.toggle("show", isOpen);
  mobileMenu.setAttribute("aria-hidden", String(!isOpen));
  menuToggle.setAttribute("aria-expanded", String(isOpen));
}

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    setMobileMenuState(!isOpen);
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      setMobileMenuState(false);
    });
  });

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Node)) {
      return;
    }
    const clickInsideMenu = mobileMenu.contains(event.target);
    const clickToggle = menuToggle.contains(event.target);
    if (!clickInsideMenu && !clickToggle) {
      setMobileMenuState(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMobileMenuState(false);
    }
  });
}

function syncActiveSectionLinks(activeId) {
  [...topNavSectionLinks].forEach((link) => {
    if (!(link instanceof HTMLAnchorElement)) {
      return;
    }
    const href = link.getAttribute("href");
    const isActive = href === `#${activeId}`;
    link.classList.toggle("active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

const sectionElements = sectionIds
  .map((id) => document.getElementById(id))
  .filter((el) => el instanceof HTMLElement);

if (sectionElements.length > 0) {
  function updateActiveSectionFromScroll() {
    const isNearBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (isNearBottom) {
      const lastSection = sectionElements[sectionElements.length - 1];
      syncActiveSectionLinks(lastSection.id);
      return;
    }

    const viewportAnchor = window.innerHeight * 0.33;
    let activeId = sectionElements[0].id;

    for (const section of sectionElements) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= viewportAnchor) {
        activeId = section.id;
      } else {
        break;
      }
    }

    syncActiveSectionLinks(activeId);
  }

  updateActiveSectionFromScroll();
  window.addEventListener("scroll", updateActiveSectionFromScroll, { passive: true });
  window.addEventListener("resize", updateActiveSectionFromScroll);
  window.addEventListener("load", updateActiveSectionFromScroll);
}

const revealElements = document.querySelectorAll("[data-reveal], .reports-spotlight-card, .card-panel");

if (reduceMotion) {
  revealElements.forEach((el) => {
    el.classList.add("visible");
  });
} else {
  revealElements.forEach((el, index) => {
    el.classList.add("fade-in");
    const stagger = Math.min((index % 8) * 70, 420);
    el.style.transitionDelay = `${stagger}ms`;
  });

  const contactRevealGroup = document.querySelectorAll("#contact .section-heading, #contact .card-panel");
  contactRevealGroup.forEach((el) => {
    el.style.transitionDelay = "0ms";
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        } else {
          entry.target.classList.remove("visible");
        }
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
  );

  revealElements.forEach((el) => observer.observe(el));
}

const tiltCards = document.querySelectorAll("[data-tilt]");

function resetTilt(card) {
  card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
}

function applyTilt(card, event) {
  const rect = card.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const rotateY = ((x / rect.width) - 0.5) * 7;
  const rotateX = (0.5 - (y / rect.height)) * 6;

  card.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
}

if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
  tiltCards.forEach((card) => {
    card.addEventListener("mousemove", (event) => applyTilt(card, event));
    card.addEventListener("mouseleave", () => resetTilt(card));
  });
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const input = document.createElement("textarea");
  input.value = text;
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.focus();
  input.select();
  document.execCommand("copy");
  document.body.removeChild(input);
}

const copyButtons = document.querySelectorAll("[data-copy-text]");
copyButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const text = button.getAttribute("data-copy-text");
    if (!text) {
      return;
    }
    try {
      await copyTextToClipboard(text);
      const originalText = button.textContent || "Copy";
      if (button instanceof HTMLButtonElement) {
        button.textContent = "Copied";
        window.setTimeout(() => {
          button.textContent = originalText;
        }, 1200);
      }
    } catch {}
  });
});

function syncModalBodyLock() {
  const hasOpenModal = document.querySelector(".cert-modal.show");
  document.body.style.overflow = hasOpenModal ? "hidden" : "";
}

function setupModal({ openId, modalId, closeId }) {
  const openButton = document.getElementById(openId);
  const closeButton = document.getElementById(closeId);
  const modal = document.getElementById(modalId);
  const dialog = modal?.querySelector(".cert-modal-dialog");
  let lastActiveElement = null;

  if (!openButton || !closeButton || !modal || !dialog) {
    return;
  }

  const focusableSelectors =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function getFocusableElements() {
    return Array.from(dialog.querySelectorAll(focusableSelectors)).filter(
      (el) => el instanceof HTMLElement && el.offsetParent !== null
    );
  }

  function setModalState(isOpen) {
    modal.classList.toggle("show", isOpen);
    modal.setAttribute("aria-hidden", String(!isOpen));
    openButton.setAttribute("aria-expanded", String(isOpen));
    syncModalBodyLock();

    if (isOpen) {
      lastActiveElement = document.activeElement;
      const focusable = getFocusableElements();
      const firstFocusable = focusable[0] || dialog;
      if (firstFocusable instanceof HTMLElement) {
        firstFocusable.focus();
      }
    } else if (lastActiveElement instanceof HTMLElement) {
      lastActiveElement.focus();
      lastActiveElement = null;
    }
  }

  openButton.addEventListener("click", () => setModalState(true));
  closeButton.addEventListener("click", () => setModalState(false));

  modal.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.hasAttribute("data-modal-close")) {
      setModalState(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!modal.classList.contains("show")) {
      return;
    }

    if (event.key === "Escape") {
      setModalState(false);
      return;
    }

    if (event.key === "Tab") {
      const focusable = getFocusableElements();
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
}

setupModal({
  openId: "openCertificatesModal",
  modalId: "certificatesModal",
  closeId: "closeCertificatesModal"
});

setupModal({
  openId: "openFoundationDocsModal",
  modalId: "foundationDocsModal",
  closeId: "closeFoundationDocsModal"
});

setupModal({
  openId: "openFoundationDocsModalQual",
  modalId: "foundationDocsModal",
  closeId: "closeFoundationDocsModal"
});
