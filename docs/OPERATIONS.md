# Operations Runbook — Northside Discovery Centre

---

## 1. Applying Database Migrations

To apply new migrations to a local or remote Supabase instance:

```bash
# Local development stack
supabase db reset

# Push migrations to linked production project
supabase db push
```

*Important: Never execute `seed.sql` on production databases. Production databases only receive migrations `0001` through `0003`.*

---

## 2. Key & Secret Rotation Procedures

### Rotating `RATE_LIMIT_SALT`
- Generating a new 32-byte hex salt:
  ```bash
  openssl rand -hex 32
  ```
- Update `RATE_LIMIT_SALT` in your environment or Vercel project dashboard.
- Redploy the application.
- **Impact**: Completely safe. It instantly resets active 24-hour rate limit hash buckets without disturbing feedback rows or short plans.

### Rotating the Supabase Publishable Key
- Generate or roll the publishable (anon) key in the Supabase Dashboard API settings.
- Update `SUPABASE_PUBLISHABLE_KEY` in environment variables.
- Redeploy the application.
- **Critical Security Notice**: **Never use, paste, or configure the `service_role` key.** The application is built to run exclusively with the publishable/anon key.

---

## 3. Free-Tier Pausing Recovery

On Supabase free-tier projects, databases pause automatically after prolonged inactivity.

### Symptoms
- `GET /api/health?deep=1` returns `"storeReachable": false`.
- The public website continues to function seamlessly in degraded Mode A.
- Feedback widget is silently hidden; share button copies full query links.

### Recovery
1. Open your project in the Supabase web dashboard.
2. Click **Resume Project**.
3. Once active, `/api/health?deep=1` automatically reports `"storeReachable": true` with zero application downtime.
4. An automated daily keepalive cron (`/api/cron/keepalive` with `CRON_SECRET`) runs at 03:00 UTC to maintain database activity.

---

## 4. Emergency Killswitch: Disabling All Database Features Instantly

If the database is undergoing maintenance or experiencing an attack, you can disable all database functionality in under 10 seconds:

1. In your deployment dashboard (or `.env`), set:
   ```env
   DATA_STORE="off"
   ```
2. Redeploy or restart the process.
3. The store adapter switches immediately to `OffDataStore`. All core features, exhibit details, ticket calculations, and visit planning continue operating normally without network calls.
