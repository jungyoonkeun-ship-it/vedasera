/* VEDA SERA CRM — login + orders */
(function () {
  "use strict";
  var cfg = window.VS_CONFIG || {};
  function isPlaceholder(v) { return !v || /REPLACE_WITH/i.test(v); }
  var ok = !isPlaceholder(cfg.supabase && cfg.supabase.url) && !isPlaceholder(cfg.supabase && cfg.supabase.anonKey);

  var $ = function (id) { return document.getElementById(id); };
  var sb = null;
  if (ok && window.supabase) sb = window.supabase.createClient(cfg.supabase.url, cfg.supabase.anonKey);
  else { $("crm-setup-warn").hidden = false; $("login-form").querySelector("button").disabled = true; }

  var STATUSES = ["paid", "preparing", "shipped", "delivered", "cancelled", "refunded"];

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function krw(n) { return "₩" + Number(n).toLocaleString("ko-KR"); }
  function fmtDate(iso) {
    var d = new Date(iso);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" +
           String(d.getDate()).padStart(2, "0") + " " +
           String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  }

  $("login-form").addEventListener("submit", async function (ev) {
    ev.preventDefault();
    var err = $("login-err"); err.hidden = true;
    try {
      var { error } = await sb.auth.signInWithPassword({
        email: $("login-email").value.trim(),
        password: $("login-password").value,
      });
      if (error) throw error;
      showDash();
    } catch (e) {
      err.textContent = e.message || "Sign-in failed."; err.hidden = false;
    }
  });

  $("logout-btn").addEventListener("click", async function () {
    await sb.auth.signOut();
    $("dash-view").hidden = true; $("login-view").hidden = false;
  });
  $("refresh-btn").addEventListener("click", loadOrders);

  async function showDash() {
    $("login-view").hidden = true; $("dash-view").hidden = false;
    await loadOrders();
  }

  async function loadOrders() {
    var body = $("orders-body"); body.innerHTML = "";
    var { data, error } = await sb.from("orders").select("*").order("created_at", { ascending: false });
    if (error) { $("orders-empty").hidden = false; $("orders-empty").textContent = "Couldn't load orders: " + error.message; return; }
    $("orders-empty").hidden = data.length > 0;

    var revenue = 0, open = 0;
    data.forEach(function (o) {
      if (o.status !== "cancelled" && o.status !== "refunded") revenue += Number(o.total_amount) || 0;
      if (o.status === "paid" || o.status === "preparing") open++;
    });
    $("stats").innerHTML =
      stat(data.length, "ORDERS") + stat(krw(revenue), "REVENUE") + stat(open, "TO FULFILL");
    function stat(v, l) { return '<div class="stat"><b>' + esc(v) + "</b><span>" + l + "</span></div>"; }

    data.forEach(function (o) {
      var tr = document.createElement("tr");
      var items = (o.items || []).map(function (i) { return esc(i.name) + " ×" + i.qty; }).join("<br>");
      var opts = STATUSES.map(function (s) {
        return '<option value="' + s + '"' + (o.status === s ? " selected" : "") + ">" + s + "</option>";
      }).join("");
      tr.innerHTML =
        "<td>" + esc(fmtDate(o.created_at)) + "</td>" +
        "<td><strong>" + esc(o.order_no) + "</strong><span class='sub'>" + esc(o.payment_id || "") + "</span></td>" +
        "<td>" + esc(o.customer_name) + "<span class='sub'>" + esc(o.customer_phone) + "</span>" +
          (o.customer_email ? "<span class='sub'>" + esc(o.customer_email) + "</span>" : "") +
          "<span class='sub'>" + esc([o.postcode, o.address, o.address_detail].filter(Boolean).join(" ")) + "</span>" +
          (o.memo ? "<span class='sub'>Memo: " + esc(o.memo) + "</span>" : "") + "</td>" +
        "<td>" + items + "</td>" +
        "<td><strong>" + krw(o.total_amount) + "</strong></td>" +
        "<td>" + esc(o.pay_method || "") + "</td>" +
        '<td><select class="status">' + opts + "</select></td>";
      tr.querySelector(".status").addEventListener("change", async function (ev) {
        var sel = ev.target; sel.disabled = true;
        var { error } = await sb.from("orders").update({ status: sel.value }).eq("id", o.id);
        if (error) { alert("Couldn't update: " + error.message); sel.value = o.status; }
        else { o.status = sel.value; loadOrders(); }
        sel.disabled = false;
      });
      body.appendChild(tr);
    });
  }

  // if already signed in, skip login
  (async function () {
    if (!sb) return;
    var { data } = await sb.auth.getSession();
    if (data && data.session) showDash();
  })();
})();
