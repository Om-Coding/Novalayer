create extension if not exists pgcrypto;

create table if not exists public.products (
  id text primary key,
  name text not null,
  category text not null check (category in ('Fidgets', 'Desk & utility', 'Custom')),
  description text not null,
  price_cents integer not null check (price_cents >= 0),
  art text not null check (art in ('hex', 'cone', 'ring', 'cube', 'bighex', 'stand', 'cable', 'id')),
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
  status text not null default 'pending' check (status = 'pending'),
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.orders enable row level security;

drop policy if exists "Anyone can view active products" on public.products;
create policy "Anyone can view active products"
  on public.products for select
  to anon
  using (active = true);

drop policy if exists "Guests can submit order requests" on public.orders;
create policy "Guests can submit order requests"
  on public.orders for insert
  to anon
  with check (
    status = 'pending'
    and char_length(btrim(customer_name)) between 1 and 100
    and char_length(btrim(contact)) between 2 and 200
    and char_length(note) <= 1500
    and case
      when jsonb_typeof(order_items) = 'array'
        then jsonb_array_length(order_items) between 1 and 30
      else false
    end
  );

revoke all on table public.orders from public, anon, authenticated;
grant insert on table public.orders to anon;
grant select on table public.products to anon;

insert into public.products
  (id, name, category, description, price_cents, art, badge, active, sort_order)
values
  ('hexagon-fidget', 'Hexagon fidget', 'Fidgets', 'Flip it, fold it, watch it bloom. The satisfying little desk escape.', 200, 'hex', 'A favorite', true, 1),
  ('cone-fidget', 'Cone fidget', 'Fidgets', 'A twisty, spiraling little wonder for wandering hands.', 200, 'cone', 'So satisfying', true, 2),
  ('fidget-ring', 'Gear fidget ring', 'Fidgets', 'Tiny gears, endless spins. Your pocket-sized happy place.', 100, 'ring', 'Pocket-sized', true, 3),
  ('infinity-cube', 'Infinity cube', 'Fidgets', 'One little cube, infinite flips. Go on, give it a try.', 300, 'cube', null, true, 4),
  ('big-hexagon', 'Big hexagon', 'Fidgets', 'The original bloom, just a little more to love.', 300, 'bighex', 'Big energy', true, 5),
  ('phone-stand', 'Easy-view phone stand', 'Desk & utility', 'A handy little home for your phone. Videos, calls, all set.', 400, 'stand', null, true, 6),
  ('cable-buddy', 'Cable buddy', 'Desk & utility', 'Keeps your charging cable right where you left it.', 200, 'cable', 'Desk helper', true, 7),
  ('custom-id-card', 'Custom ID card', 'Custom', 'A little card with your style on it. School-appropriate, always.', 500, 'id', null, true, 8)
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  description = excluded.description,
  price_cents = excluded.price_cents,
  art = excluded.art,
  badge = excluded.badge,
  active = excluded.active,
  sort_order = excluded.sort_order;
