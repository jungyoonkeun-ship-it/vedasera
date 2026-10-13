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

  /* outbound Naver product clicks -> pixel funnel events.
     content_ids use the catalog SKUs (VS-FG-001 / VS-MB-002) so the events
     match the Meta/Google catalog products; value is the verified price so
     Events Manager can report return on ad spend. The data-naver-product
     attribute carries the Naver product ID, mapped here to SKU + price. */
  var NAVER_PRODUCT_MAP = {
    "13748710775": { sku: "VS-FG-001", value: 198000 },
    "13748710776": { sku: "VS-MB-002", value: 198000 }
  };
  document.querySelectorAll("[data-naver-product]").forEach(function (a) {
    a.addEventListener("click", function () {
      if (!window.fbq) return;
      var naverId = a.getAttribute("data-naver-product");
      var mapped = NAVER_PRODUCT_MAP[naverId] || { sku: naverId, value: 198000 };
      var params = {
        content_ids: [mapped.sku],
        content_type: "product",
        value: mapped.value,
        currency: "KRW"
      };
      try {
        fbq("track", "ViewContent", params);
        fbq("track", "InitiateCheckout", params);
      } catch (e) { /* pixel is best-effort */ }
    });
  });
})();
