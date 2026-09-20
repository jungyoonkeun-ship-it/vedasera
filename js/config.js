/* ============================================================
   VEDA SERA — store configuration
   Fill in your real keys/IDs below, commit, and push.
   Nothing here is secret except nothing — the Supabase anon key
   is designed to be public (row-level security protects the data).
   NEVER put the Supabase service_role key or PortOne API secret here.
   ============================================================ */
window.VS_CONFIG = {
  /* Meta Pixel ID from Events Manager (e.g. "1234567890123456").
     Until this is set, pixel calls are skipped safely. */
  pixelId: "REPLACE_WITH_PIXEL_ID",

  supabase: {
    url: "REPLACE_WITH_SUPABASE_URL",          // e.g. https://xyzcompany.supabase.co
    anonKey: "REPLACE_WITH_SUPABASE_ANON_KEY",  // anon public key (NOT service_role)
  },

  /* PortOne (https://www.portone.io) — create a store, then register
     one channel for card payments and one for KakaoPay (test mode is
     fine while building). Paste the keys here when ready. */
  portone: {
    storeId: "REPLACE_WITH_PORTONE_STORE_ID",
    channelKeyCard: "REPLACE_WITH_PORTONE_CARD_CHANNEL_KEY",
    channelKeyKakao: "REPLACE_WITH_PORTONE_KAKAO_CHANNEL_KEY",
  },

  /* TODO(Ryan): replace with the real catalog — name, KRW price,
     image path (under assets/), and short description. */
  products: [
    {
      id: "signature-mat",
      name: "Signature Handwoven Mat",
      price: 189000,
      image: "assets/product.jpg",
      desc: "Our iconic mat — traditionally handwoven cotton surface, finished for contemporary ritual.",
    },
    {
      id: "mat-detail",
      name: "The Weave — Detail Edition",
      price: 149000,
      image: "assets/detail.jpg",
      desc: "A closer study of the weave. Same slow craft, distilled.",
    },
    {
      id: "ritual-set",
      name: "Ritual Set",
      price: 249000,
      image: "assets/final.jpg",
      desc: "Mat and companions for movement, rest, and the spaces in between.",
    },
  ],
};
