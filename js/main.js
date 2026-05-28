(function () {
  "use strict";

  const nav = document.querySelector(".main-nav");
  const toggle = document.querySelector(".nav-toggle");
  const header = document.querySelector(".site-header");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
      toggle.setAttribute(
        "aria-expanded",
        nav.classList.contains("open") ? "true" : "false"
      );
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", function (e) {
      if (
        nav.classList.contains("open") &&
        !nav.contains(e.target) &&
        !toggle.contains(e.target)
      ) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  if (header) {
    window.addEventListener("scroll", function () {
      header.classList.toggle("scrolled", window.scrollY > 40);
    });
  }

  document.querySelectorAll(".faq-question").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const item = btn.closest(".faq-item");
      const wasOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item").forEach(function (i) {
        i.classList.remove("open");
      });
      if (!wasOpen) item.classList.add("open");
    });
  });

  const counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    const runCounter = function (el) {
      const target = parseInt(el.getAttribute("data-count"), 10);
      const suffix = el.getAttribute("data-suffix") || "";
      const duration = 1800;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target + suffix;
      }

      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    counters.forEach(function (c) {
      observer.observe(c);
    });
  }

  document.querySelectorAll("form[data-validate]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const msg = form.querySelector(".form-message");
      let valid = true;

      form.querySelectorAll("[required]").forEach(function (field) {
        if (!field.value.trim()) {
          valid = false;
          field.style.borderColor = "#dc2626";
        } else {
          field.style.borderColor = "";
        }
      });

      const email = form.querySelector('input[type="email"]');
      if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        valid = false;
        email.style.borderColor = "#dc2626";
      }

      if (!msg) return;

      if (valid) {
        msg.className = "form-message success";
        msg.textContent =
          "Thank you! Your message has been recorded. We will contact you shortly.";
        form.reset();
      } else {
        msg.className = "form-message error";
        msg.textContent = "Please fill in all required fields correctly.";
      }
    });
  });

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const featuredCarousel = document.querySelector("[data-featured-carousel]");
  if (featuredCarousel) {
    const viewport = featuredCarousel.querySelector(".featured-carousel__viewport");
    const track = featuredCarousel.querySelector(".featured-carousel__track");
    const slides = featuredCarousel.querySelectorAll(".featured-carousel__slide");
    const btnPrev = featuredCarousel.querySelector(".featured-carousel__arrow--prev");
    const btnNext = featuredCarousel.querySelector(".featured-carousel__arrow--next");
    if (!viewport || !track || !slides.length || !btnPrev || !btnNext) return;

    function gapPx() {
      const g = getComputedStyle(track).gap || getComputedStyle(track).columnGap;
      const n = parseFloat(g, 10);
      return isNaN(n) ? 28 : n;
    }

    let index = 0;
    let slidesPerView = 3;
    let autoplayTimer = null;
    const AUTOPLAY_MS = 5500;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function requestedPerView() {
      const w = window.innerWidth;
      if (w < 640) return 1;
      if (w < 992) return 2;
      return 3;
    }

    function maxIndex() {
      return Math.max(0, slides.length - slidesPerView);
    }

    function apply() {
      const gap = gapPx();
      slidesPerView = Math.min(requestedPerView(), slides.length);
      const vw = viewport.clientWidth;
      if (!vw) return;
      const slideW = (vw - gap * (slidesPerView - 1)) / slidesPerView;
      slides.forEach(function (s) {
        s.style.width = slideW + "px";
      });
      const max = maxIndex();
      if (index > max) index = max;
      const offset = index * (slideW + gap);
      track.style.transform = "translateX(-" + offset + "px)";
    }

    function goNext() {
      const max = maxIndex();
      index = index >= max ? 0 : index + 1;
      apply();
    }

    function goPrev() {
      const max = maxIndex();
      index = index <= 0 ? max : index - 1;
      apply();
    }

    function startAutoplay() {
      if (prefersReducedMotion || maxIndex() === 0) return;
      stopAutoplay();
      autoplayTimer = setInterval(goNext, AUTOPLAY_MS);
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    btnNext.addEventListener("click", function () {
      goNext();
      startAutoplay();
    });
    btnPrev.addEventListener("click", function () {
      goPrev();
      startAutoplay();
    });

    var resizeT = null;
    window.addEventListener("resize", function () {
      clearTimeout(resizeT);
      resizeT = setTimeout(apply, 120);
    });

    featuredCarousel.addEventListener("mouseenter", stopAutoplay);
    featuredCarousel.addEventListener("mouseleave", startAutoplay);
    featuredCarousel.addEventListener("focusin", stopAutoplay);
    featuredCarousel.addEventListener("focusout", function (e) {
      if (!featuredCarousel.contains(e.relatedTarget)) {
        startAutoplay();
      }
    });

    apply();
    window.addEventListener("load", apply);
    if (!prefersReducedMotion) {
      startAutoplay();
    }
  }
})();
