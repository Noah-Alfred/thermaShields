"use strict";

(() => {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const state = {
    lenis: null,
    menuOpen: false,
    galleryFrame: 0
  };

  /* The intentionally simple Lenis setup requested for this project. */
  function initLenis() {
    if (!window.Lenis) return null;

    const lenis = new Lenis();

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
    state.lenis = lenis;
    window.lenis = lenis;
    return lenis;
  }

  function initHeader() {
    const header = $("#site-header");
    const toggle = $(".menu-toggle");
    const menu = $("#mobile-menu");

    const updateHeader = () => {
      header?.classList.toggle("is-scrolled", window.scrollY > 18);
    };

    const setMenu = (open) => {
      state.menuOpen = open;
      toggle?.classList.toggle("is-open", open);
      toggle?.setAttribute("aria-expanded", String(open));
      toggle?.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menu?.classList.toggle("is-open", open);
      menu?.setAttribute("aria-hidden", String(!open));
      if (open) menu?.removeAttribute("inert");
      else menu?.setAttribute("inert", "");
      document.body.classList.toggle("menu-open", open);

      if (open) state.lenis?.stop();
      else state.lenis?.start();
    };

    toggle?.addEventListener("click", () => setMenu(!state.menuOpen));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && state.menuOpen) {
        setMenu(false);
        toggle?.focus();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 980 && state.menuOpen) setMenu(false);
    });

    window.addEventListener("scroll", updateHeader, { passive: true });
    updateHeader();

    document.addEventListener("click", (event) => {
      const anchor = event.target.closest('a[href^="#"]');
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      const target = href && href.length > 1 ? $(href) : null;
      if (!target) return;

      event.preventDefault();
      if (state.menuOpen) setMenu(false);

      if (state.lenis) {
        state.lenis.scrollTo(target, {
          offset: -76,
          duration: reducedMotion ? 0 : 0.9
        });
      } else {
        target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
      }
    });
  }

  function initActiveNavigation() {
    if (!("IntersectionObserver" in window)) return;

    const links = $$('.desktop-nav a[href^="#"]');
    const sections = links
      .map((link) => $(link.getAttribute("href")))
      .filter(Boolean);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = `#${entry.target.id}`;
        links.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === id));
      });
    }, {
      rootMargin: "-32% 0px -58% 0px",
      threshold: 0
    });

    sections.forEach((section) => observer.observe(section));
  }

  function initReveals() {
    const targets = [
      ...$$('.section-heading'),
      $(".why-grid"),
      $(".gallery-viewport"),
      $(".process-grid"),
      $(".testimonials-heading"),
      $(".testimonials-grid"),
      $(".faq-grid"),
      $(".final-cta")
    ].filter(Boolean);

    targets.forEach((element) => element.setAttribute("data-reveal", ""));

    if (reducedMotion || !("IntersectionObserver" in window)) {
      targets.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    document.documentElement.classList.add("motion-ready");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, {
      rootMargin: "0px 0px -8% 0px",
      threshold: 0.08
    });

    targets.forEach((element) => observer.observe(element));
  }

  function initTierSelector() {
    const tabs = $$('[data-tier-tab]');
    const cards = $$('[data-tier-card]');

    const selectTier = (index, moveFocus = false) => {
      tabs.forEach((tab, tabIndex) => {
        const selected = tabIndex === index;
        tab.setAttribute("aria-pressed", String(selected));
      });

      cards.forEach((card, cardIndex) => card.classList.toggle("is-selected", cardIndex === index));

      if (moveFocus) tabs[index]?.focus();
      if (window.innerWidth <= 980) {
        cards[index]?.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: "nearest",
          inline: "start"
        });
      }
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => selectTier(index));
      tab.addEventListener("keydown", (event) => {
        const keys = {
          ArrowLeft: (index - 1 + tabs.length) % tabs.length,
          ArrowRight: (index + 1) % tabs.length,
          Home: 0,
          End: tabs.length - 1
        };

        if (!(event.key in keys)) return;
        event.preventDefault();
        selectTier(keys[event.key], true);
      });
    });

    if (tabs.length) selectTier(0);
  }

  function initHeatComparison() {
    const comparison = $("#heat-compare");
    const range = $(".heat-range", comparison);
    if (!comparison || !range) return;

    const update = () => comparison.style.setProperty("--split", `${range.value}%`);
    range.addEventListener("input", update, { passive: true });
    range.addEventListener("change", update, { passive: true });
    update();
  }

  function initGalleryCounter() {
    const viewport = $(".gallery-row");
    const items = $$(".gallery-item", viewport);
    const counter = $("#gallery-current");
    if (!viewport || !items.length || !counter) return;

    const update = () => {
      state.galleryFrame = 0;
      const center = viewport.scrollLeft + viewport.clientWidth / 2;
      let closestIndex = 0;
      let closestDistance = Infinity;

      items.forEach((item, index) => {
        const itemCenter = item.offsetLeft + item.clientWidth / 2;
        const distance = Math.abs(center - itemCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      counter.textContent = String(closestIndex + 1).padStart(2, "0");
    };

    viewport.addEventListener("scroll", () => {
      if (!state.galleryFrame) state.galleryFrame = requestAnimationFrame(update);
    }, { passive: true });

    update();
  }

  function initFAQ() {
    const items = $$(".faq-item");

    items.forEach((item) => {
      const button = $("button", item);
      button?.addEventListener("click", () => {
        const shouldOpen = !item.classList.contains("is-open");

        items.forEach((other) => {
          other.classList.remove("is-open");
          $("button", other)?.setAttribute("aria-expanded", "false");
        });

        if (shouldOpen) {
          item.classList.add("is-open");
          button.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  function initCopyright() {
    const year = $("#copyright-year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  function init() {
    initLenis();
    initHeader();
    initActiveNavigation();
    initReveals();
    initTierSelector();
    initHeatComparison();
    initGalleryCounter();
    initFAQ();
    initCopyright();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
