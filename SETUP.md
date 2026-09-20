# VEDA SERA DTC setup — Ryan's checklist

The store code is done. Four things need your input before it can take
real orders. Do them in any order; each one unblocks a piece.

## 1. Meta Pixel ID (unblocks: ad tracking)

1. Go to **Events Manager** → **Connect data sources** → **Web** → **Meta Pixel**.
2. Name it (e.g. `VEDA SERA`), enter `https://vedasera.com`.
3. Copy the numeric **Pixel ID**.
4. Open `js/config.js`, replace `REPLACE_WITH_PIXEL_ID`, commit, push.

The same pixel automatically appears in Business Suite, Business
Settings, and Ads Manager — one pixel covers all three.

## 2. Supabase project (unblocks: order storage + CRM)

1. Create a free project at https://supabase.com.
2. **SQL editor** → new query → paste everything from `supabase/schema.sql` → Run.
3. **Authentication** → **Users** → **Add user** → create the CRM login
   (email + password). This is what unlocks `vedasera.com/crm.html`.
4. **Project Settings** → **API**: copy the **Project URL** and the
   **anon public** key (never the service_role key).
5. Paste both into `js/config.js`, commit, push.

## 3. PortOne (unblocks: card / KakaoPay payments)

1. Sign up at https://www.portone.io (the friend's business will need
   its 사업자등록증 for live approval — **test mode works immediately**).
2. Create a store → note the **Store ID**.
3. Register two payment channels (both can be test mode for now):
   - card channel → **Channel key**
   - KakaoPay channel → **Channel key**
4. Paste all three into `js/config.js`, commit, push.

Until real keys are in, checkout shows a clear "store setup incomplete"
message instead of failing silently.

## 4. Real catalog (unblocks: selling the actual products)

Open `js/config.js` → `products` array. Replace the three placeholder
products with the real ones: `id`, `name`, `price` (KRW), `image`
(path under `assets/`), `desc`. Commit, push. The shop page renders
whatever is in that array — no other code changes needed.

---

## How it works

- `shop.html` — catalog, cart drawer, checkout (Daum address search),
  PortOne payment, Meta Pixel events (ViewContent / AddToCart /
  InitiateCheckout / Purchase).
- `crm.html` — password login (Supabase Auth), live order list, order
  status management (paid → preparing → shipped → delivered).
- Orders land in the Supabase `orders` table the moment payment succeeds.
- `index.html` — Pixel base code added; nav SHOP now points to `shop.html`.

## Later upgrades (optional)

- **Conversions API**: server-side event backup for iOS14+ signal loss.
- **Payment webhook verification**: confirm every payment server-side via
  a Supabase Edge Function instead of trusting the browser callback.
- **Naver Pay / TossPay**: extra PortOne channels, same one-line pattern.
