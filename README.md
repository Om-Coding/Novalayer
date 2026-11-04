# Novalayer

A React + Vite storefront for small-batch 3D-printed fidgets, desk helpers, and custom items. Orders are guest requests; there is no sign-in or email authentication.

## Run locally

```sh
npm install
npm run dev
```

The storefront and sample catalog work without Supabase. To save orders and load the live catalog:

1. Create a Supabase project.
2. Run [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL Editor.
3. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from the project API settings.
4. Restart the Vite dev server.

The browser uses only the Supabase anon key. Row-level security lets guests read active products and submit pending order requests; guest access cannot read submitted orders. Do not put a service-role key in the frontend.

Orders are requests, not payments. The customer is asked for a name and a preferred contact method so the shop can confirm the order.

## Publish on GitHub Pages

The `main` branch has a GitHub Actions workflow that builds and deploys the site. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**. The workflow builds with the `/Novalayer/` URL base.

To connect Supabase on the published site, add a repository Actions variable named `VITE_SUPABASE_URL` and a repository Actions secret named `VITE_SUPABASE_ANON_KEY`. The anon key is intended for browser use; never add a service-role key. Without these values, the published site shows the sample catalog and cannot submit order requests.
