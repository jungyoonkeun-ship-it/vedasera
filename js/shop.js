/* VEDA SERA shop — catalog, cart, checkout, PortOne, Supabase, pixel events */
(function () {
  "use strict";
  var cfg = window.VS_CONFIG || {};
  var PRODUCTS = cfg.products || [];
  var FREE_SHIP_OVER = 150000;
  var SHIP_FEE = 3000;

  function isPlaceholder(v) { return !v || /REPLACE_WITH/i.test(v); }
  var setupOk = {
    supabase: !isPlaceholder(cfg.supabase && cfg.supabase.url) && !isPlaceholder(cfg.supabase && cfg.supabase.anonKey),
    portone: !isPlaceholder(cfg.portone && cfg.portone.storeId) &&
             !isPlaceholder(cfg.portone && cfg.portone.channelKeyCard) &&
             !isPlaceholder(cfg.portone && cfg.portone.channelKeyKakao),
  };

  var sb = null;
  if (setupOk.supabase && window.supabase) {
    sb = window.supabase.createClient(cfg.supabase.url, cfg.supabase.anonKey);
  }

  function krw(n) { return "₩" + Number(n).toLocaleString("ko-KR"); }
  function $(id) { return document.getElementById(id); }
  function byId(id) { return PRODUCTS.find(function (p) { return p.id === id; }); }

  /* ---------- cart state ---------- */
  var cart = {};
  try { cart = JSON.parse(localStorage.getItem("vs_cart") || "{}"); } catch (e) { cart = {}; }
  function saveCart() { localStorage.setItem("vs_cart", JSON.stringify(cart)); }
  function cartCount() {
    return Object.keys(cart).reduce(function (n, id) { return n + (cart[id] || 0); }, 0);
  }
  function cartSubtotal() {
    return Object.keys(cart).reduce(function (s, id) {
      var p = byId(id); return p ? s + p.price * cart[id] : s;
    }, 0);
  }
  function shippingFee(sub) { return sub === 0 || sub >= FREE_SHIP_OVER ? 0 : SHIP_FEE; }

  /* ---------- product grid ---------- */
  function renderProducts() {
    var grid = $("product-grid");
    grid.innerHTML = "";
    PRODUCTS.forEach(function (p) {
      var card = document.createElement("article");
      card.className = "product-card";
      card.innerHTML =
        '<div class="pimg"><img src="' + p.image + '" alt="' + esc(p.name) + '" loading="lazy"></div>' +
        "<h3>" + esc(p.name) + "</h3>" +
        '<div class="pprice">' + krw(p.price) + "</div>";
      card.addEventListener("click", function () { openQuickView(p); });
      grid.appendChild(card);
    });
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- quick view ---------- */
  var qvProduct = null, qvQty = 1;
  function openQuickView(p) {
    qvProduct = p; qvQty = 1;
    $("qv-image").src = p.image; $("qv-image").alt = p.name;
    $("qv-name").textContent = p.name;
    $("qv-price").textContent = krw(p.price);
    $("qv-desc").textContent = p.desc;
    $("qv-qty").textContent = "1";
    openModal("qv-modal");
    if (window.fbq) fbq("track", "ViewContent", {
      content_ids: [p.id], content_type: "product",
      value: p.price, currency: "KRW",
    });
  }

  /* ---------- modals ---------- */
  var overlay = $("overlay");
  function openModal(id) { $(id).hidden = false; overlay.hidden = false; document.body.style.overflow = "hidden"; }
  function closeModal(id) { $(id).hidden = true; overlay.hidden = true; document.body.style.overflow = ""; }
  document.querySelectorAll("[data-close]").forEach(function (b) {
    b.addEventListener("click", function () { closeModal(b.getAttribute("data-close")); });
  });
  overlay.addEventListener("click", function () {
    ["qv-modal", "checkout-modal", "success-modal"].forEach(closeModal);
    closeCart();
  });

  /* ---------- cart drawer ---------- */
  var drawer = $("cart-drawer");
  function openCart() { renderCart(); drawer.hidden = false; overlay.hidden = false; document.body.style.overflow = "hidden"; }
  function closeCart() { drawer.hidden = true; if ($("qv-modal").hidden && $("checkout-modal").hidden && $("success-modal").hidden) { overlay.hidden = true; document.body.style.overflow = ""; } }
  $("cart-fab").addEventListener("click", openCart);
  $("cart-close").addEventListener("click", closeCart);

  function renderCart() {
    var box = $("cart-items"); box.innerHTML = "";
    var ids = Object.keys(cart).filter(function (id) { return cart[id] > 0 && byId(id); });
    if (!ids.length) {
      box.innerHTML = '<div class="cart-empty">Your cart is empty.</div>';
    }
    ids.forEach(function (id) {
      var p = byId(id), q = cart[id];
      var line = document.createElement("div");
      line.className = "cart-line";
      line.innerHTML =
        '<img src="' + p.image + '" alt="' + esc(p.name) + '">' +
        "<div><h4>" + esc(p.name) + "</h4>" +
        '<p class="lp">' + krw(p.price) + "</p>" +
        '<div class="qty"><button data-a="dec" aria-label="Decrease">−</button><span>' + q + "</span>" +
        '<button data-a="inc" aria-label="Increase">＋</button></div></div>' +
        '<div class="line-right"><div>' + krw(p.price * q) + '</div><button class="rm" data-a="rm">remove</button></div>';
      line.querySelectorAll("button").forEach(function (b) {
        b.addEventListener("click", function () {
          var a = b.getAttribute("data-a");
          if (a === "inc") cart[id]++;
          if (a === "dec") cart[id]--;
          if (a === "rm") delete cart[id];
          if (cart[id] <= 0) delete cart[id];
          saveCart(); renderCart(); updateFab();
        });
      });
      box.appendChild(line);
    });
    $("cart-subtotal").textContent = krw(cartSubtotal());
  }
  function updateFab() { $("cart-count").textContent = cartCount(); }

  $("qv-minus").addEventListener("click", function () { if (qvQty > 1) { qvQty--; $("qv-qty").textContent = qvQty; } });
  $("qv-plus").addEventListener("click", function () { qvQty++; $("qv-qty").textContent = qvQty; });
  $("qv-add").addEventListener("click", function () {
    if (!qvProduct) return;
    cart[qvProduct.id] = (cart[qvProduct.id] || 0) + qvQty;
    saveCart(); updateFab(); closeModal("qv-modal"); openCart();
    if (window.fbq) fbq("track", "AddToCart", {
      content_ids: [qvProduct.id], content_type: "product",
      value: qvProduct.price * qvQty, currency: "KRW",
    });
  });

  /* ---------- checkout ---------- */
  $("checkout-btn").addEventListener("click", function () {
    if (!cartCount()) return;
    closeCart(); openCheckout();
  });

  function openCheckout() {
    var warn = $("setup-warn");
    var okAll = setupOk.supabase && setupOk.portone;
    warn.hidden = okAll;
    $("pay-btn").disabled = !okAll;
    renderSummary();
    $("form-err").hidden = true;
    openModal("checkout-modal");
    if (window.fbq) fbq("track", "InitiateCheckout", {
      content_ids: Object.keys(cart), num_items: cartCount(),
      value: cartSubtotal(), currency: "KRW",
    });
  }

  function renderSummary() {
    var sub = cartSubtotal(), ship = shippingFee(sub);
    var html = "";
    Object.keys(cart).forEach(function (id) {
      var p = byId(id); if (!p) return;
      html += '<div class="os-line"><span>' + esc(p.name) + " × " + cart[id] +
              "</span><span>" + krw(p.price * cart[id]) + "</span></div>";
    });
    html += '<div class="os-line"><span>Shipping</span><span>' +
            (ship === 0 ? "Free" : krw(ship)) + "</span></div>";
    html += '<div class="os-total"><span>Total</span><strong>' + krw(sub + ship) + "</strong></div>";
    $("order-summary").innerHTML = html;
  }

  $("addr-search").addEventListener("click", function () {
    if (!window.daum || !daum.Postcode) { alert("Address search is unavailable right now."); return; }
    new daum.Postcode({
      oncomplete: function (data) {
        $("f-postcode").value = data.zonecode;
        $("f-address").value = data.roadAddress || data.jibunAddress;
      },
    }).open();
  });

  function orderNo() {
    var d = new Date(), p = function (n) { return String(n).padStart(2, "0"); };
    var s = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", r = "";
    for (var i = 0; i < 4; i++) r += s[Math.floor(Math.random() * s.length)];
    return "VS-" + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + "-" + r;
  }

  $("checkout-form").addEventListener("submit", function (ev) {
    ev.preventDefault();
    pay();
  });

  function fail(msg) {
    var e = $("form-err"); e.textContent = msg; e.hidden = false;
  }

  async function pay() {
    var f = $("checkout-form");
    var name = f.name.value.trim(),
        phone = f.phone.value.trim(),
        email = f.email.value.trim(),
        postcode = f.postcode.value.trim(),
        address = f.address.value.trim(),
        addressDetail = f.addressDetail.value.trim(),
        memo = f.memo.value.trim();
    if (!name) return fail("Please enter your name.");
    if (!/^[0-9+\- ]{9,}$/.test(phone)) return fail("Please enter a valid phone number.");
    if (!postcode || !address) return fail("Please search and select your address.");
    if (typeof PortOne === "undefined") return fail("Payment library failed to load. Please refresh and try again.");

    var method = f.querySelector('input[name="paymethod"]:checked').value;
    var items = Object.keys(cart).map(function (id) {
      var p = byId(id);
      return { id: p.id, name: p.name, price: p.price, qty: cart[id] };
    });
    var sub = cartSubtotal(), ship = shippingFee(sub), total = sub + ship;
    var no = orderNo();
    var orderName = "VEDA SERA — " + items.map(function (i) { return i.name + " ×" + i.qty; }).join(", ");
    if (orderName.length > 80) orderName = "VEDA SERA order " + no;

    var btn = $("pay-btn"); btn.disabled = true; btn.textContent = "Processing…";
    try {
      var req = {
        storeId: cfg.portone.storeId,
        channelKey: method === "card" ? cfg.portone.channelKeyCard : cfg.portone.channelKeyKakao,
        paymentId: no,
        orderName: orderName,
        totalAmount: total,
        currency: "KRW",
        customer: { fullName: name, phoneNumber: phone },
      };
      if (email) req.customer.email = email;
      if (method === "card") { req.payMethod = "CARD"; }
      else { req.payMethod = "EASY_PAY"; req.easyPay = { easyPayProvider: "KAKAOPAY" }; }

      var res = await PortOne.requestPayment(req);
      if (res.code) throw new Error(res.message || "Payment was not completed.");

      // record the order
      var { error } = await sb.from("orders").insert({
        order_no: no,
        payment_id: res.paymentId || no,
        pay_method: method === "card" ? "CARD" : "KAKAOPAY",
        customer_name: name,
        customer_phone: phone,
        customer_email: email || null,
        postcode: postcode,
        address: address,
        address_detail: addressDetail || null,
        memo: memo || null,
        items: items,
        total_amount: total,
        currency: "KRW",
        status: "paid",
      });
      if (error) throw new Error("Payment succeeded, but we couldn't save your order (" + error.message + "). Please contact us with order no. " + no + ".");

      if (window.fbq) fbq("track", "Purchase", {
        content_ids: items.map(function (i) { return i.id; }),
        content_type: "product",
        value: total, currency: "KRW",
      });

      cart = {}; saveCart(); updateFab();
      closeModal("checkout-modal");
      $("success-order-no").textContent = no;
      openModal("success-modal");
    } catch (err) {
      fail(err && err.message ? err.message : "Something went wrong. Please try again.");
    } finally {
      btn.disabled = false; btn.textContent = "Pay securely";
    }
  }

  /* ---------- init ---------- */
  renderProducts();
  updateFab();
})();
