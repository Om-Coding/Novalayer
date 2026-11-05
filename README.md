# Novalayer

A React + Vite storefront for six small-batch 3D-printed products. Customers check out as guests using Stripe Checkout; no app account or email sign-in is required. Stripe collects the payment email, phone number, and U.S. shipping address. U.S. shipping is free.

## Run locally

```sh
npm install
npm run dev
```

The sample catalog works without Supabase. To load the live catalog and enable payments:

1. In Supabase, run [`supabase/schema.sql`](./supabase/schema.sql) in the SQL Editor. It seeds the six products and prices and restricts order updates to the server.
2. Copy `.env.example` to `.env.local` and add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from Supabase **Project Settings → API**.
3. Install the [Supabase CLI](https://supabase.com/docs/guides/cli) and link the project:

   ```sh
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   ```

4. In Supabase **Edge Functions → Secrets**, configure:
   - `STRIPE_SECRET_KEY` — use an `sk_test_...` key while testing; never put it in a `VITE_` variable or the frontend.
   - `STRIPE_WEBHOOK_SECRET` — the `whsec_...` signing secret for the webhook described below.
   - `SITE_URL` — the full storefront URL, for example `https://om-coding.github.io/Novalayer`.
   - `ALLOWED_ORIGINS` — comma-separated origins, for example `https://om-coding.github.io,http://localhost:5173`.

   Supabase provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to Edge Functions. Do not copy the service-role key into the website.

5. Deploy the two Edge Functions:

   ```sh
   supabase functions deploy create-checkout-session
   supabase functions deploy stripe-webhook
   supabase functions deploy submit-custom-request
   ```

   The functions are intentionally configured for guest requests in `supabase/config.toml`. Checkout validates product IDs and quantities and calculates prices from Supabase on the server. Custom idea descriptions are saved to the private `custom_requests` table; guests cannot read or modify submitted requests.

6. In Stripe **Developers → Webhooks**, add this endpoint:

   ```text
   https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook
   ```

   Subscribe it to `checkout.session.completed`, `checkout.session.expired`, and `checkout.session.async_payment_succeeded`. Copy the endpoint's signing secret (`whsec_...`) into the Supabase `STRIPE_WEBHOOK_SECRET`.

7. Test with Stripe test mode before accepting live payments. Stripe Checkout collects card details; the webhook verifies Stripe's signature and confirms the amount before marking an order paid.

This checkout currently accepts U.S. shipping addresses and charges no shipping fee. Taxes are not automatically calculated; configure Stripe Tax and applicable tax registrations before selling where tax collection is required.

## GitHub Pages

The `main` branch workflow builds and deploys the site. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**. Configure the repository Actions variable `VITE_SUPABASE_URL` and Actions secret `VITE_SUPABASE_ANON_KEY` for the live catalog. The Stripe secret and webhook signing secret belong only in Supabase Edge Function Secrets.
