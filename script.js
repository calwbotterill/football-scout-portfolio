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

  const sortedReports = [...siteData.reports].sort((a, b) => {
    const aTime = Date.parse(a.dateSort || "") || 0;
    const bTime = Date.parse(b.dateSort || "") || 0;
    return bTime - aTime;
  });

  reportsGrid.innerHTML = sortedReports
    .map((report, index) => {
      const hasImage = typeof report.imageSrc === "string" && report.imageSrc.length > 0;
      const hasHref = typeof report.href === "string" && report.href.length > 0;
      const imageClass =
        typeof report.imageClass === "string" && report.imageClass.length > 0
          ? ` ${report.imageClass}`
          : "";
      const imageWidth = Number.isFinite(report.imageWidth) ? report.imageWidth : 640;
      const imageHeight = Number.isFinite(report.imageHeight) ? report.imageHeight : 427;
      const mediaMarkup = hasImage
        ? `<img src="${report.imageSrc}" alt="${report.imageAlt}"${imageClass ? ` class="${imageClass.trim()}"` : ""} width="${imageWidth}" height="${imageHeight}" loading="${index === 0 ? "eager" : "lazy"}" fetchpriority="${index === 0 ? "high" : "auto"}" decoding="async" />`
        : `<div class="report-slot-placeholder"><span>Add Cover Photo</span></div>`;
      const actionMarkup = hasHref
        ? `<a href="${report.href}" target="_blank" rel="noopener noreferrer" class="report-button">View Report</a>`
        : `<span class="report-button report-button-disabled">Report Pending</span>`;
      const featuredClass = report.featured ? " report-card-featured" : "";
      const featuredMarkup = report.featured
        ? `<span class="report-featured-label">Featured Report</span>`
        : "";

      return `
        <article class="report-card${featuredClass}">
          <div class="report-image">
            ${mediaMarkup}
          </div>
          <div class="report-content">
            <p class="report-label">${report.tag}${featuredMarkup}</p>
            ${report.when ? `<p class="report-date">${report.when}</p>` : ""}
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
renderLinkList("foundationDocsList", siteData.foundationDocs);

const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const sectionIds = ["home", "reports", "background", "squadiq", "contact"];
const topNavSectionLinks = document.querySelectorAll('.nav-links a[href^="#"], .mobile-menu a[href^="#"]');
let activeSectionId = "";

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
  if (activeId === activeSectionId) {
    return;
  }
  activeSectionId = activeId;

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
  let sectionOffsets = [];
  let ticking = false;

  // Performance: cache section offsets so scroll does not force repeated layout reads.
  function cacheSectionOffsets() {
    sectionOffsets = sectionElements.map((section) => ({
      id: section.id,
      top: section.offsetTop
    }));
    updateActiveSectionFromScroll();
  }

  function updateActiveSectionFromScroll() {
    ticking = false;
    const isNearBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (isNearBottom) {
      const lastSection = sectionElements[sectionElements.length - 1];
      syncActiveSectionLinks(lastSection.id);
      return;
    }

    const anchorY = window.scrollY + window.innerHeight * 0.33;
    let activeId = sectionOffsets[0]?.id || sectionElements[0].id;

    for (const section of sectionOffsets) {
      if (section.top <= anchorY) {
        activeId = section.id;
      } else {
        break;
      }
    }

    syncActiveSectionLinks(activeId);
  }

  function requestActiveSectionUpdate() {
    if (ticking) {
      return;
    }
    ticking = true;
    window.requestAnimationFrame(updateActiveSectionFromScroll);
  }

  cacheSectionOffsets();
  window.addEventListener("scroll", requestActiveSectionUpdate, { passive: true });
  window.addEventListener("resize", cacheSectionOffsets);
  window.addEventListener("load", cacheSectionOffsets);
}

const tiltCards = document.querySelectorAll("[data-tilt]");

function resetTilt(card) {
  card.style.setProperty("--tilt-x", "0deg");
  card.style.setProperty("--tilt-y", "0deg");
  card.classList.remove("tilt-card-active");
}

function applyTilt(card, rect, x, y) {
  const rotateY = ((x / rect.width) - 0.5) * 7;
  const rotateX = (0.5 - (y / rect.height)) * 6;

  card.style.setProperty("--tilt-x", `${rotateX.toFixed(2)}deg`);
  card.style.setProperty("--tilt-y", `${rotateY.toFixed(2)}deg`);
}

if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
  tiltCards.forEach((card) => {
    let frame = null;
    let rect = null;
    let pointerX = 0;
    let pointerY = 0;

    // Performance: pointer movement is throttled to the next animation frame and reuses one rect per hover.
    card.addEventListener("mouseenter", () => {
      rect = card.getBoundingClientRect();
      card.classList.add("tilt-card-active");
    });

    card.addEventListener("mousemove", (event) => {
      if (!rect) {
        rect = card.getBoundingClientRect();
      }

      pointerX = event.clientX - rect.left;
      pointerY = event.clientY - rect.top;

      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(() => {
        frame = null;
        applyTilt(card, rect, pointerX, pointerY);
      });
    });

    card.addEventListener("mouseleave", () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = null;
      }
      rect = null;
      resetTilt(card);
    });
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
  openId: "openFoundationDocsModal",
  modalId: "foundationDocsModal",
  closeId: "closeFoundationDocsModal"
});

setupModal({
  openId: "openFoundationDocsModalQual",
  modalId: "foundationDocsModal",
  closeId: "closeFoundationDocsModal"
});
