/* VEDA SERA — interactions */
(function () {
  "use strict";

  /* footer year */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* header state on scroll */
  var header = document.getElementById("site-header");
  function onScroll() {
    if (window.scrollY > 40) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* reveal on scroll */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  document.querySelectorAll("[data-reveal]").forEach(function (el) { io.observe(el); });

  /* outbound Naver product clicks -> pixel funnel events */
  document.querySelectorAll("[data-naver-product]").forEach(function (a) {
    a.addEventListener("click", function () {
      if (!window.fbq) return;
      var id = a.getAttribute("data-naver-product");
      try {
        fbq("track", "ViewContent", { content_ids: [id], content_type: "product", currency: "KRW" });
        fbq("track", "InitiateCheckout", { content_ids: [id], content_type: "product", currency: "KRW" });
      } catch (e) { /* pixel is best-effort */ }
    });
  });
})();
