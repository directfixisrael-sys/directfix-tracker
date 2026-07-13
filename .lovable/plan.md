## Wave 1 - Security Hardening (Critical PII lockdown)

### Goal
Close the wide-open RLS policies on customer/PII tables so anonymous users cannot read, modify, or delete customer data. Keep the app functional by routing public operations through Edge Functions and moving admin operations behind real Supabase Auth.

### Scope of changes

**1. Admin authentication (Supabase Auth)**
- New table `public.user_roles` with enum `app_role` (`admin`, `staff`) and `has_role()` security-definer function.
- New `/admin/login` route using Supabase email/password auth.
- `AdminPanel` gated on `has_role(auth.uid(), 'admin')`. Existing password-based admin gate is removed.
- First admin user provisioned manually via a one-time migration/seed after you provide an email; then the admin logs in with that email + password.

**2. RLS lockdown (migration)**
For every table below, drop the `USING (true)` policies and replace with:
- `SELECT/UPDATE/DELETE` → admin only (`has_role(auth.uid(),'admin')`)
- `INSERT` → allow anon only where truly needed (leads, orders, messages from public site), everything else admin only

Tables locked: `orders`, `leads`, `club_members`, `customer_profiles`, `loyalty_points`, `messages`, `referrals`, `voice_leads`, `coupons`, `admin_reminders`, `announcements`, `blocked_dates`, `promotions`, `repair_types`, `repair_bundles`, `model_repair_prices`, `iphone_models`, `ipad_models`, `voice_agent_settings`, `push_subscriptions`, `site_visits`, `wp_button_clicks`.

Publicly readable (needed for the storefront/order flow): `iphone_models`, `ipad_models`, `repair_types`, `repair_bundles`, `model_repair_prices`, `announcements` (active only), `promotions` (active only), `coupons` (validation only via edge function, not direct SELECT).

**3. Public-facing Edge Functions (replace direct client access)**
- `create-order` — validates + inserts into `orders` with service role. Called from `NewRepairOrder`.
- `lookup-orders-by-phone` — validates phone, returns orders for the customer tracker (`CustomerTracker`).
- `submit-lead` — inserts into `leads`.
- `send-chat-message` — inserts into `messages` scoped to an order id + phone verification.
- `validate-coupon` — checks a coupon code without exposing the coupons table.

Existing PBKDF2 customer-auth flow stays as-is for the customer zone; those edge functions already use service role.

**4. Client updates**
- `src/store/repairStore.ts` — replace direct `orders`/`messages` reads/writes with the new edge functions for public paths; keep direct reads for admin panel (now behind admin auth).
- `src/pages/NewRepairOrder.tsx` — order creation via `create-order`.
- `src/pages/CustomerTracker.tsx` — phone lookup via `lookup-orders-by-phone`.
- Admin components keep using `supabase` client directly; RLS lets them through because the admin session has `admin` role.

**5. Storage buckets**
- `resumes` bucket: keep private, only admin can list/read; upload allowed to anon (already fixed on read).
- `device-images`: keep public read, admin-only write/delete (already partially fixed).

### Not in this wave
- Migrating existing customer PBKDF2 accounts to Supabase Auth.
- Deep audit of every edge function's own input validation.
- Rate limiting on public edge functions (recommended follow-up).

### Rollout order
1. Migration: `user_roles`, `has_role`, all RLS changes (one migration).
2. Provision first admin (needs your email — I will ask before running).
3. Add `/admin/login` + auth guard on `AdminPanel`.
4. Add the 5 new Edge Functions.
5. Update client callers.
6. Verify build + smoke test.

### What you need to provide
- The email address to use for the first admin login. Password can be set on first login via magic link, or you can give me one to seed.

### Expected downtime / risk
- Between step 1 and step 3, the admin panel will be unreachable for anyone not yet in `user_roles`. I will provision your admin in the same migration if you give me the email now.
- Between step 1 and step 5, public order creation/lookup will fail until the edge functions and client updates ship. I will land them in the same message to minimize the window.
