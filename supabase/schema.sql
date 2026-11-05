create extension if not exists pgcrypto;

create table if not exists public.products (
  id text primary key,
  name text not null,
  category text not null check (category in ('Collectibles', 'Accessories', 'Home & desk', 'Toys')),
  description text not null,
  price_cents integer not null check (price_cents >= 0),
  art text not null check (art in ('miniature', 'phonecase', 'vase', 'keychain', 'toycar', 'toolholder')),
  badge text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null check (char_length(btrim(customer_name)) between 1 and 100),
  contact text not null check (char_length(btrim(contact)) between 2 and 200),
  note text not null default '' check (char_length(note) <= 1500),
  order_items jsonb not null check (
    case
      when jsonb_typeof(order_items) = 'array'
        then jsonb_array_length(order_items) between 1 and 30
      else false
    end
  ),
  subtotal_cents integer not null check (subtotal_cents between 0 and 100000000),
  status text not null default 'pending',
  currency text not null default 'usd',
  customer_email text,
  stripe_session_id text,
  stripe_payment_intent_id text,
  shipping_details jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.custom_requests (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null check (char_length(btrim(customer_name)) between 1 and 100),
  contact text not null check (char_length(btrim(contact)) between 2 and 200),
  idea_description text not null check (char_length(btrim(idea_description)) between 10 and 3000),
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'declined')),
  created_at timestamptz not null default now()
);

alter table public.products drop constraint if exists products_category_check;
alter table public.products drop constraint if exists products_art_check;
update public.products
set
  category = case
    when category in ('Collectibles', 'Accessories', 'Home & desk', 'Toys') then category
    else 'Collectibles'
  end,
  art = case
    when art in ('miniature', 'phonecase', 'vase', 'keychain', 'toycar', 'toolholder') then art
    else 'miniature'
  end;
alter table public.products
  add constraint products_category_check
  check (category in ('Collectibles', 'Accessories', 'Home & desk', 'Toys'));
alter table public.products
  add constraint products_art_check
  check (art in ('miniature', 'phonecase', 'vase', 'keychain', 'toycar', 'toolholder'));

alter table public.orders add column if not exists currency text not null default 'usd';
alter table public.orders add column if not exists customer_email text;
alter table public.orders add column if not exists stripe_session_id text;
alter table public.orders add column if not exists stripe_payment_intent_id text;
alter table public.orders add column if not exists shipping_details jsonb;
alter table public.orders add column if not exists paid_at timestamptz;
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders
  add constraint orders_status_check
  check (status in ('pending', 'paid', 'cancelled'));

create unique index if not exists orders_stripe_session_id_key
  on public.orders (stripe_session_id)
  where stripe_session_id is not null;

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.custom_requests enable row level security;

drop policy if exists "Anyone can view active products" on public.products;
create policy "Anyone can view active products"
  on public.products for select
  to anon
  using (active = true);

drop policy if exists "Guests can submit order requests" on public.orders;

revoke all on table public.orders from public, anon, authenticated;
grant all on table public.orders to service_role;
revoke all on table public.custom_requests from public, anon, authenticated;
grant all on table public.custom_requests to service_role;
grant select on table public.products to anon;
grant select, insert, update on table public.products to service_role;

update public.products
set active = false
where id not in ('miniature', 'phonecase', 'vase', 'keychain', 'toycar', 'toolholder');

insert into public.products
  (id, name, category, description, price_cents, art, badge, active, sort_order)
values
  ('miniature', 'Miniature Figure', 'Collectibles', 'High-quality miniature figures perfect for gaming or collecting.', 500, 'miniature', 'Collector favorite', true, 1),
  ('phonecase', 'Phone Case', 'Accessories', 'Custom phone cases designed to fit your device perfectly.', 1500, 'phonecase', 'Made for you', true, 2),
  ('vase', 'Decorative Vase', 'Home & desk', 'Beautiful decorative vases to enhance your home decor.', 2500, 'vase', null, true, 3),
  ('keychain', 'Keychain', 'Accessories', 'Personalized keychains with custom designs and text.', 300, 'keychain', 'Make it yours', true, 4),
  ('toycar', 'Toy Car', 'Toys', 'Fun toy cars with moving parts, great for kids and collectors.', 1200, 'toycar', null, true, 5),
  ('toolholder', 'Tool Holder', 'Home & desk', 'Practical tool holders to organize your workspace efficiently.', 1800, 'toolholder', 'Desk helper', true, 6)
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  description = excluded.description,
  price_cents = excluded.price_cents,
  art = excluded.art,
  badge = excluded.badge,
  active = excluded.active,
  sort_order = excluded.sort_order;
