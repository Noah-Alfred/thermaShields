/* ============ HOW TO CUSTOMIZE ============
   PHONE: 954-440-3882
   EMAIL: Vimal@tintbossdavie.com
   CITY: Miami, Florida
   HERO VIDEO: Search for "19830439" below to replace both Pexels renditions.
   HERO POSTER / HEAT SLIDER / GALLERY: Search for "images.unsplash.com" to replace stock assets.
================================================ */

"use strict";

(() => {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const clamp = (min, value, max) => Math.min(Math.max(value, min), max);

  const state = {
    reducedMotion: false,
    finePointer: false,
    menuOpen: false,
    heroDuration: 0,
    tiersTrigger: null,
    galleryTrigger: null,
    marqueeTweens: []
  };

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /** Wrap every character in a reusable span without changing the accessible label. */
  function splitText(element) {
    if (!element || element.dataset.splitComplete === "true") {
      return element ? $$(".char", element) : [];
    }

    const text = element.innerText || element.textContent;
    const sourceNodes = [...element.childNodes];
    const fragment = document.createDocumentFragment();
    element.setAttribute("aria-label", text.trim());
    element.textContent = "";

    sourceNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === "BR") {
        fragment.appendChild(document.createElement("br"));
        return;
      }

      [...node.textContent].forEach((character) => {
        const span = document.createElement("span");
        span.className = character === " " ? "char char-space" : "char";
        span.setAttribute("aria-hidden", "true");
        span.textContent = character === " " ? "\u00A0" : character;
        fragment.appendChild(span);
      });
    });

    element.appendChild(fragment);
    element.dataset.splitComplete = "true";
    return $$(".char", element);
  }

  window.splitText = splitText;

  /* -------------------- initReducedMotion -------------------- */
  function initReducedMotion() {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    state.reducedMotion = query.matches;
    state.finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    document.documentElement.classList.toggle("reduced-motion", state.reducedMotion);

    query.addEventListener?.("change", (event) => {
      state.reducedMotion = event.matches;
      document.documentElement.classList.toggle("reduced-motion", state.reducedMotion);
    });
  }

  /* -------------------- initLenis -------------------- */
  function initLenis() {
    if (!window.Lenis) return null;

    const lenis = new Lenis();

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    lenis.on("scroll", ScrollTrigger.update);
    window.lenis = lenis;

    document.addEventListener("click", (event) => {
      const anchor = event.target.closest('a[href^="#"]');
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href === "#") {
        event.preventDefault();
        return;
      }

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      lenis.scrollTo(target, {
        offset: -80,
        duration: state.reducedMotion ? 0 : 1.4
      });
    });

    return lenis;
  }

  function setActiveNav(id) {
    $$(".desktop-nav a").forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
    });
  }

  function initNavigation() {
    const header = $("#site-header");
    const toggle = $(".menu-toggle", header);
    const menu = $("#mobile-menu");
    const menuLinks = $$("nav a", menu);

    const updateHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 60);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    const menuTimeline = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
    menuTimeline
      .set(menu, { autoAlpha: 1 })
      .to(menu, { opacity: 1, duration: 0.35 }, 0)
      .to(menuLinks, { y: 0, opacity: 1, duration: 0.55, stagger: 0.055 }, 0.08)
      .fromTo(
        $(".mobile-menu-footer", menu),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4 },
        0.28
      );

    const openMenu = () => {
      state.menuOpen = true;
      header.classList.add("menu-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
      menu.setAttribute("aria-hidden", "false");
      window.lenis?.stop();
      menuTimeline.play();
    };

    const closeMenu = () => {
      state.menuOpen = false;
      header.classList.remove("menu-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      menu.setAttribute("aria-hidden", "true");
      menuTimeline.reverse();
      window.lenis?.start();
    };

    toggle.addEventListener("click", () => (state.menuOpen ? closeMenu() : openMenu()));
    menuLinks.forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && state.menuOpen) {
        closeMenu();
        toggle.focus();
      }
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 1024 && state.menuOpen) closeMenu();
    });

    ["home", "film-tiers", "why-us", "gallery", "process", "faq", "contact"].forEach((id) => {
      const section = document.getElementById(id);
      if (!section) return;
      ScrollTrigger.create({
        trigger: section,
        start: "top 45%",
        end: "bottom 45%",
        onToggle: (self) => self.isActive && setActiveNav(id)
      });
    });
  }

  /* -------------------- initCursor -------------------- */
  function initCursor() {
    if (!state.finePointer || state.reducedMotion) return;

    const dot = $(".cursor-dot");
    const ring = $(".cursor-ring");
    const dotX = gsap.quickSetter(dot, "x", "px");
    const dotY = gsap.quickSetter(dot, "y", "px");
    const ringX = gsap.quickTo(ring, "x", { duration: 0.15, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.15, ease: "power3.out" });
    const dotScale = gsap.quickTo(dot, "scale", { duration: 0.2, ease: "power3.out" });
    const ringScale = gsap.quickTo(ring, "scale", { duration: 0.28, ease: "power3.out" });

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, opacity: 0 });

    window.addEventListener("pointermove", (event) => {
      dotX(event.clientX);
      dotY(event.clientY);
      ringX(event.clientX);
      ringY(event.clientY);
      gsap.to([dot, ring], { opacity: 1, duration: 0.2, overwrite: "auto" });
    });

    document.addEventListener("pointerover", (event) => {
      const interactive = event.target.closest("a, button, .magnetic, .gallery-item");
      const textInput = event.target.closest("input, textarea, select");

      if (textInput) {
        gsap.to([dot, ring], { opacity: 0, duration: 0.15 });
        return;
      }

      if (interactive) {
        ringScale(2.2);
        dotScale(0.35);
        dot.classList.toggle("is-cta", Boolean(interactive.closest(".button, .mobile-book")));
      }
    });

    document.addEventListener("pointerout", (event) => {
      const interactive = event.target.closest("a, button, .magnetic, .gallery-item");
      if (interactive && !interactive.contains(event.relatedTarget)) {
        ringScale(1);
        dotScale(1);
        dot.classList.remove("is-cta");
      }

      if (event.target.closest("input, textarea, select")) {
        gsap.to([dot, ring], { opacity: 1, duration: 0.15 });
      }
    });

    document.documentElement.addEventListener("mouseleave", () => {
      gsap.to([dot, ring], { opacity: 0, duration: 0.2 });
    });
  }

  /* -------------------- initMagnetic -------------------- */
  function initMagnetic() {
    if (!state.finePointer || state.reducedMotion || window.innerWidth < 1024) return;

    $$(".magnetic").forEach((element) => {
      const moveX = gsap.quickTo(element, "x", { duration: 0.45, ease: "power3.out" });
      const moveY = gsap.quickTo(element, "y", { duration: 0.45, ease: "power3.out" });

      element.addEventListener("pointermove", (event) => {
        const rect = element.getBoundingClientRect();
        moveX((event.clientX - rect.left - rect.width / 2) * 0.22);
        moveY((event.clientY - rect.top - rect.height / 2) * 0.28);
      });

      element.addEventListener("pointerleave", () => {
        moveX(0);
        moveY(0);
      });
    });
  }

  /* -------------------- initHero -------------------- */
  function initHero() {
    const hero = $(".hero");
    const video = $("#hero-video");
    const titleParts = $$('[data-hero-split]');
    const titleChars = titleParts.flatMap(splitText);
    const introElements = [$(".hero-eyebrow"), $(".hero-sub"), ...$$(".hero-actions .button"), $(".hero-specs")];

    gsap.set(titleChars, { y: 60, opacity: 0, rotateX: -65 });
    gsap.set(introElements, { y: 24, opacity: 0 });
    gsap.set($(".hero-side-note"), { opacity: 0, x: 20 });

    const playIntro = () => {
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      timeline
        .to(titleChars, {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: state.reducedMotion ? 0.01 : 0.82,
          stagger: state.reducedMotion ? 0 : 0.02
        })
        .to($(".hero-eyebrow"), { y: 0, opacity: 1, duration: 0.5 }, 0.05)
        .to($(".hero-sub"), { y: 0, opacity: 1, duration: 0.6 }, 0.44)
        .to($$(".hero-actions .button"), { y: 0, opacity: 1, duration: 0.55, stagger: 0.08 }, 0.52)
        .to($(".hero-specs"), { y: 0, opacity: 1, duration: 0.55 }, 0.72)
        .to($(".hero-side-note"), { x: 0, opacity: 1, duration: 0.5 }, 0.75);
    };

    const setVideoDuration = () => {
      state.heroDuration = Number.isFinite(video.duration) ? video.duration : 0;
      if (!state.reducedMotion && window.innerWidth >= 1024) video.pause();
    };

    if (video.readyState >= 1) setVideoDuration();
    else video.addEventListener("loadedmetadata", setVideoDuration, { once: true });

    video.play().catch(() => {
      // The poster remains a complete visual fallback when autoplay is blocked.
    });

    if (!state.reducedMotion) {
      const desktop = gsap.matchMedia();
      desktop.add("(min-width: 1024px)", () => {
        const playhead = { progress: 0 };
        const scrub = gsap.timeline({
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "+=100%",
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true
          }
        });

        scrub
          .to(playhead, {
            progress: 1,
            ease: "none",
            onUpdate: () => {
              if (state.heroDuration > 0) {
                video.currentTime = clamp(0, playhead.progress * (state.heroDuration - 0.08), state.heroDuration - 0.04);
              }
            }
          }, 0)
          .to(titleChars, {
            y: (index) => -50 - index * 0.4,
            opacity: 0,
            stagger: 0.004,
            ease: "none"
          }, 0)
          .to($(".hero-copy"), { y: -70, ease: "none" }, 0)
          .to($(".hero-glow"), { xPercent: -28, yPercent: 25, scale: 1.2, ease: "none" }, 0)
          .to(video, { scale: 1.12, filter: "saturate(.7) contrast(1.2) brightness(.42)", ease: "none" }, 0);

        return () => {
          scrub.scrollTrigger?.kill();
          scrub.kill();
          video.play().catch(() => {});
        };
      });
    }

    return playIntro;
  }

  /* -------------------- initPreloader -------------------- */
  function initPreloader(playHeroIntro) {
    const preloader = $("#preloader");
    const strokes = $$(".shield-stroke, .car-stroke", preloader);
    const arrows = $$(".heat-arrows path", preloader);
    const wordChars = $$('[data-preloader-split]', preloader).flatMap(splitText);
    const tag = $(".preloader-tag", preloader);
    const content = $(".preloader-content", preloader);
    const topHalf = $(".preloader-half--top", preloader);
    const bottomHalf = $(".preloader-half--bottom", preloader);

    window.lenis?.stop();
    strokes.forEach((stroke) => {
      const length = stroke.getTotalLength();
      gsap.set(stroke, { strokeDasharray: length, strokeDashoffset: length });
    });
    gsap.set(arrows, { x: -26, opacity: 0 });
    gsap.set(wordChars, { y: 26, opacity: 0 });
    gsap.set(tag, { y: 10, opacity: 0 });

    const complete = () => {
      preloader.style.display = "none";
      document.body.classList.remove("is-loading");
      window.lenis?.start();
      playHeroIntro?.();
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };

    if (state.reducedMotion) {
      gsap.set([strokes, arrows, wordChars, tag], { clearProps: "all", opacity: 1 });
      gsap.to(preloader, { opacity: 0, duration: 0.25, onComplete: complete });
      return;
    }

    const timeline = gsap.timeline({ defaults: { ease: "power3.out" }, onComplete: complete });
    timeline
      .to(strokes, { strokeDashoffset: 0, duration: 0.52, stagger: 0.06 })
      .to(arrows, { x: 0, opacity: 1, duration: 0.3, stagger: 0.07 }, 0.32)
      .to(wordChars, { y: 0, opacity: 1, duration: 0.38, stagger: 0.025 }, 0.63)
      .to(tag, { y: 0, opacity: 1, duration: 0.26 }, 0.94)
      .to(content, { opacity: 0, scale: 0.96, duration: 0.28, ease: "power2.in" }, 1.36)
      .to(topHalf, { yPercent: -102, duration: 0.68, ease: "power4.inOut" }, 1.52)
      .to(bottomHalf, { yPercent: 102, duration: 0.68, ease: "power4.inOut" }, 1.52);
  }

  /* -------------------- initMarquee -------------------- */
  function initMarquee() {
    if (state.reducedMotion) return;

    const createMarquee = (track, duration) => {
      if (!track) return null;
      const tween = gsap.to(track, {
        xPercent: -50,
        duration,
        repeat: -1,
        ease: "none"
      });

      const container = track.parentElement;
      container.addEventListener("mouseenter", () => gsap.to(tween, { timeScale: 0, duration: 0.35 }));
      container.addEventListener("mouseleave", () => gsap.to(tween, { timeScale: 1, duration: 0.55 }));
      state.marqueeTweens.push(tween);
      return tween;
    };

    const tickerTween = createMarquee($("[data-marquee]"), 26);
    const testimonialTween = createMarquee($("[data-testimonial-track]"), 42);
    let settle;

    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const velocity = clamp(-2.8, self.getVelocity() / 950, 2.8);
        [tickerTween, testimonialTween].filter(Boolean).forEach((tween) => tween.timeScale(1 + Math.abs(velocity)));
        settle?.kill();
        settle = gsap.delayedCall(0.16, () => {
          [tickerTween, testimonialTween].filter(Boolean).forEach((tween) => gsap.to(tween, { timeScale: 1, duration: 0.65 }));
        });
      }
    });
  }

  function setTierActive(index) {
    $$('[data-tier-tab]').forEach((tab, tabIndex) => tab.setAttribute("aria-selected", String(tabIndex === index)));
    $$('[data-tier-card]').forEach((card, cardIndex) => card.classList.toggle("is-active", cardIndex === index));
  }

  /* -------------------- initTiers -------------------- */
  function initTiers() {
    const section = $(".film-tiers");
    const viewport = $(".tiers-viewport");
    const row = $("#tiers-row");
    const cards = $$('[data-tier-card]');
    const tabs = $$('[data-tier-tab]');

    const goToTier = (index) => {
      const card = cards[index];
      if (!card) return;
      setTierActive(index);

      if (window.innerWidth < 1024 || state.reducedMotion || !state.tiersTrigger) {
        viewport.scrollTo({
          left: card.offsetLeft - (viewport.clientWidth - card.clientWidth) / 2,
          behavior: state.reducedMotion ? "auto" : "smooth"
        });
        return;
      }

      const trigger = state.tiersTrigger;
      const progress = index / Math.max(1, cards.length - 1);
      window.lenis?.scrollTo(trigger.start + (trigger.end - trigger.start) * progress, {
        duration: 1.2
      });
    };

    tabs.forEach((tab, index) => tab.addEventListener("click", () => goToTier(index)));
    tabs.forEach((tab, index) => {
      tab.addEventListener("keydown", (event) => {
        const keyMap = {
          ArrowLeft: (index - 1 + tabs.length) % tabs.length,
          ArrowRight: (index + 1) % tabs.length,
          Home: 0,
          End: tabs.length - 1
        };
        if (!(event.key in keyMap)) return;
        event.preventDefault();
        const nextIndex = keyMap[event.key];
        tabs[nextIndex].focus();
        goToTier(nextIndex);
      });
    });

    const updateMobileTier = () => {
      const center = viewport.scrollLeft + viewport.clientWidth / 2;
      let closest = 0;
      let distance = Infinity;
      cards.forEach((card, index) => {
        const cardCenter = card.offsetLeft + card.clientWidth / 2;
        const nextDistance = Math.abs(center - cardCenter);
        if (nextDistance < distance) {
          distance = nextDistance;
          closest = index;
        }
      });
      setTierActive(closest);
    };
    viewport.addEventListener("scroll", updateMobileTier, { passive: true });

    if (!state.reducedMotion) {
      const desktop = gsap.matchMedia();
      desktop.add("(min-width: 1024px)", () => {
        const tween = gsap.to(row, {
          x: () => -Math.max(0, row.scrollWidth - window.innerWidth + Math.max(30, (window.innerWidth - section.clientWidth) / 2)),
          ease: "none",
          scrollTrigger: {
            trigger: viewport,
            start: "top 15%",
            end: () => `+=${Math.max(window.innerWidth, row.scrollWidth - window.innerWidth + 520)}`,
            pin: viewport,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const index = Math.round(self.progress * (cards.length - 1));
              setTierActive(index);
            }
          }
        });
        state.tiersTrigger = tween.scrollTrigger;

        return () => {
          state.tiersTrigger = null;
          tween.scrollTrigger?.kill();
          tween.kill();
          gsap.set(row, { clearProps: "transform" });
        };
      });
    }

    if (state.finePointer && !state.reducedMotion) {
      cards.forEach((card) => {
        const rotateX = gsap.quickTo(card, "rotateX", { duration: 0.45, ease: "power3.out" });
        const rotateY = gsap.quickTo(card, "rotateY", { duration: 0.45, ease: "power3.out" });

        card.addEventListener("pointermove", (event) => {
          const rect = card.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;
          rotateX(clamp(-6, y * -12, 6));
          rotateY(clamp(-6, x * 12, 6));
        });

        card.addEventListener("pointerleave", () => {
          rotateX(0);
          rotateY(0);
        });
      });
    }

    setTierActive(0);
  }

  /* -------------------- initHeatSlider -------------------- */
  function initHeatSlider() {
    const comparison = $("#heat-compare");
    const range = $(".heat-range", comparison);
    if (!comparison || !range) return;

    const update = (value) => comparison.style.setProperty("--split", `${value}%`);
    range.addEventListener("input", () => update(range.value));
    range.addEventListener("change", () => update(range.value));

    if (!state.reducedMotion) {
      const proxy = { value: 50 };
      gsap.timeline({
        scrollTrigger: {
          trigger: comparison,
          start: "top 78%",
          once: true
        }
      })
        .to(proxy, { value: 63, duration: 0.9, ease: "power3.inOut", onUpdate: () => update(proxy.value) })
        .to(proxy, { value: 50, duration: 0.7, ease: "power3.inOut", onUpdate: () => update(proxy.value) });
    }
  }

  /* -------------------- initGallery -------------------- */
  function initGallery() {
    const section = $(".gallery");
    const viewport = $(".gallery-viewport", section);
    const row = $("#gallery-row", section);
    const items = $$(".gallery-item", section);
    const counter = $("#gallery-current");

    const setCount = (index) => {
      counter.textContent = String(index + 1).padStart(2, "0");
    };

    const updateMobileGallery = () => {
      const center = viewport.scrollLeft + viewport.clientWidth / 2;
      let closest = 0;
      let distance = Infinity;
      items.forEach((item, index) => {
        const itemCenter = item.offsetLeft + item.clientWidth / 2;
        const nextDistance = Math.abs(center - itemCenter);
        if (nextDistance < distance) {
          distance = nextDistance;
          closest = index;
        }
      });
      setCount(closest);
    };
    viewport.addEventListener("scroll", updateMobileGallery, { passive: true });

    if (!state.reducedMotion) {
      const desktop = gsap.matchMedia();
      desktop.add("(min-width: 1024px)", () => {
        const travel = () => Math.max(0, row.scrollWidth - window.innerWidth);
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: viewport,
            start: "top 18%",
            end: () => `+=${travel() + window.innerWidth * 0.35}`,
            pin: viewport,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => setCount(Math.round(self.progress * (items.length - 1)))
          }
        });

        timeline
          .to(row, { x: () => -travel(), ease: "none" }, 0)
          .to($$(".gallery-item img", section), { xPercent: -4, ease: "none" }, 0);
        state.galleryTrigger = timeline.scrollTrigger;

        return () => {
          state.galleryTrigger = null;
          timeline.scrollTrigger?.kill();
          timeline.kill();
          gsap.set(row, { clearProps: "transform" });
        };
      });
    }

    setCount(0);
  }

  /* -------------------- initProcess -------------------- */
  function initProcess() {
    const timeline = $(".timeline");
    const fill = $(".timeline-spine span", timeline);
    const nodes = $$(".process-node", timeline);

    if (state.reducedMotion) {
      gsap.set(fill, { scaleY: 1 });
      gsap.set(nodes, { scale: 1, opacity: 1 });
      return;
    }

    gsap.to(fill, {
      scaleY: 1,
      ease: "none",
      scrollTrigger: {
        trigger: timeline,
        start: "top 62%",
        end: "bottom 55%",
        scrub: true
      }
    });

    nodes.forEach((node) => {
      gsap.from(node, {
        scale: 0.3,
        opacity: 0,
        duration: 0.45,
        ease: "back.out(2)",
        scrollTrigger: { trigger: node, start: "top 78%", once: true }
      });
    });
  }

  /* -------------------- initFAQ -------------------- */
  function initFAQ() {
    const items = $$(".faq-item");

    items.forEach((item) => {
      const button = $("button", item);
      const answer = $(".faq-answer", item);
      const chevron = $("button > i", item);
      const initiallyOpen = item.classList.contains("is-open");
      gsap.set(answer, { height: initiallyOpen ? "auto" : 0 });
      gsap.set(chevron, { rotate: initiallyOpen ? 45 : 0 });

      button.addEventListener("click", () => {
        const willOpen = !item.classList.contains("is-open");

        items.forEach((other) => {
          const otherAnswer = $(".faq-answer", other);
          const otherButton = $("button", other);
          const otherChevron = $("button > i", other);
          other.classList.remove("is-open");
          otherButton.setAttribute("aria-expanded", "false");
          gsap.to(otherAnswer, { height: 0, duration: state.reducedMotion ? 0 : 0.42, ease: "power3.inOut" });
          gsap.to(otherChevron, { rotate: 0, duration: state.reducedMotion ? 0 : 0.35 });
        });

        if (willOpen) {
          item.classList.add("is-open");
          button.setAttribute("aria-expanded", "true");
          gsap.to(answer, { height: "auto", duration: state.reducedMotion ? 0 : 0.48, ease: "power3.inOut" });
          gsap.to(chevron, { rotate: 45, duration: state.reducedMotion ? 0 : 0.35, ease: "power3.out" });
        }
      });
    });
  }

  function initSectionReveals() {
    $$('[data-split-reveal]').forEach((heading) => {
      const chars = splitText(heading);

      if (state.reducedMotion) {
        gsap.from(chars, {
          opacity: 0,
          y: 10,
          duration: 0.25,
          scrollTrigger: { trigger: heading, start: "top 88%", once: true }
        });
        return;
      }

      gsap.from(chars, {
        yPercent: 115,
        opacity: 0,
        rotateX: -50,
        duration: 0.75,
        stagger: 0.018,
        ease: "power3.out",
        scrollTrigger: { trigger: heading, start: "top 82%", once: true }
      });
    });

    $$(".reveal-copy, .reveal-media, .feature-list li, .stats > div, .tier-card").forEach((element, index) => {
      gsap.from(element, {
        y: state.reducedMotion ? 10 : 36,
        opacity: 0,
        duration: state.reducedMotion ? 0.25 : 0.75,
        delay: (index % 4) * 0.025,
        ease: "power3.out",
        scrollTrigger: { trigger: element, start: "top 86%", once: true }
      });
    });
  }

  function initGlobalEffects() {
    const progress = $(".scroll-progress span");
    const glows = $$(".glow");

    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => gsap.set(progress, { scaleX: self.progress })
    });

    if (state.reducedMotion) return;

    gsap.to(document.body, {
      "--noise-x": "140px",
      "--noise-y": "-110px",
      duration: 0.7,
      repeat: -1,
      yoyo: true,
      ease: "steps(2)"
    });

    glows.forEach((glow, index) => {
      gsap.to(glow, {
        xPercent: index % 2 ? 10 : -12,
        yPercent: index % 3 ? -9 : 13,
        scale: 1.12,
        duration: 6 + index * 0.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    });

    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const velocity = clamp(-5, self.getVelocity() / 450, 5);
        gsap.to(glows, { skewY: velocity, duration: 0.6, overwrite: "auto" });
      }
    });
  }

  function init() {
    if (!window.gsap || !window.ScrollTrigger) {
      document.body.classList.remove("is-loading");
      $("#preloader")?.remove();
      return;
    }

    initReducedMotion();
    initLenis();
    initNavigation();
    initCursor();
    initMagnetic();

    const playHeroIntro = initHero();
    initPreloader(playHeroIntro);
    initMarquee();
    initTiers();
    initHeatSlider();
    initGallery();
    initProcess();
    initFAQ();
    initSectionReveals();
    initGlobalEffects();

    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
