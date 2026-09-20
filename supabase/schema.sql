-- ============================================================
-- VEDA SERA orders table — run this in the Supabase SQL editor
-- (Dashboard → SQL → New query → paste → Run)
-- Then create a CRM login: Dashboard → Authentication → Users
-- → "Add user" → email + password. That login unlocks /crm.html.
-- ============================================================

create table if not exists orders (
  id            uuid primary key default gen_random_uuid(),
  order_no      text unique not null,          -- e.g. VS-20260921-A3F9
  created_at    timestamptz not null default now(),
  payment_id    text,                          -- PortOne paymentId
  pay_method    text,                          -- CARD | KAKAOPAY
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  postcode      text,
  address       text not null,
  address_detail text,
  memo          text,
  items         jsonb not null,                -- [{id,name,price,qty}]
  total_amount  integer not null,              -- KRW
  currency      text not null default 'KRW',
  status        text not null default 'paid'   -- paid | preparing | shipped | delivered | cancelled | refunded
);

alter table orders enable row level security;

-- Anyone (the checkout page) may create an order…
create policy "public can insert orders"
  on orders for insert
  with check (true);

-- …but only a logged-in CRM user may read or update them.
create policy "crm can read orders"
  on orders for select
  using (auth.role() = 'authenticated');

create policy "crm can update orders"
  on orders for update
  using (auth.role() = 'authenticated');
