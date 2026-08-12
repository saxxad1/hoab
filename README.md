# HOAB Official Website & Management System

Production-oriented Next.js application for the Houseboat Owners Association of Bangladesh. The deployment target is Vercel; structured data, authentication and object storage are provided by Supabase.

## Technology

- Next.js 16 and React 19
- Vercel Node.js Functions
- Supabase PostgreSQL
- Drizzle ORM and versioned SQL migrations
- Supabase Storage (`public-media` and private `b2b-documents` buckets)
- Supabase Auth for the administration console

## Included

- bilingual public website foundation
- registered-houseboat directory, filters and individual profiles
- leadership, news, events, resources, membership, FAQ and contact modules
- authorised-agent directory and verification
- B2B application, direct secure document upload and application tracking
- role-protected management console and audit history
- CMS CRUD, CSV/XLSX import, CSV export and media library
- sitemap, robots policy, Open Graph card and responsive layouts

## 1. Create the Supabase project

Create a Supabase project and copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill these values:

- `DATABASE_URL`: the Supabase transaction-pooler PostgreSQL URI. Use port `6543` for Vercel serverless runtime traffic.
- `MIGRATION_DATABASE_URL`: the direct connection URI, or the shared session-pooler URI on port `5432` when your network needs IPv4. This is used only by migration/seed tools.
- `NEXT_PUBLIC_SUPABASE_URL`: Project URL from Supabase API settings.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon/publishable key.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only service-role key. Never expose it in a `NEXT_PUBLIC_` variable.
- `ADMIN_EMAILS`: comma-separated bootstrap super-admin emails.
- `NEXT_PUBLIC_SITE_URL`: local URL initially, then the final Vercel/custom-domain URL.

## 2. Create the database and storage buckets

Run:

```bash
npm install
npm run db:migrate
npm run db:seed
```

The migration creates all 15 application tables, indexes, foreign keys, row-level security and these buckets:

- `public-media`: public images and resource files
- `b2b-documents`: private applicant identity/business documents

The seed command is optional. It adds realistic demonstration content so the site is not empty. Replace those records with verified HOAB data before launch.

## 3. Configure the first administrator

In Supabase Dashboard, open **Authentication → Users → Add user** and create a password-based user whose email exactly matches an address in `ADMIN_EMAILS`.

Public registration is not used. Keep open user sign-up disabled. Additional authenticated users can be assigned scoped application roles in `admin_users` through the management console; create their matching Supabase Auth accounts in the Supabase dashboard.

Local administrator login is at:

```text
http://localhost:3000/admin/login
```

## 4. Run locally

```bash
npm run dev
```

Open `http://localhost:3000`. Local development uses the same Supabase project configured in `.env.local`; it no longer creates a separate D1 database.

## 5. Deploy to Vercel

1. Push this repository to GitHub/GitLab/Bitbucket.
2. Import the repository into Vercel. Vercel detects Next.js automatically.
3. Add the runtime environment variables from `.env.local` to the Vercel project. Use the Supabase transaction-pooler URL for `DATABASE_URL`; `MIGRATION_DATABASE_URL` may remain local because builds do not run migrations.
4. Deploy.
5. Set `NEXT_PUBLIC_SITE_URL` to the production URL and redeploy.
6. Add the Vercel URL and final custom domain to Supabase **Authentication → URL Configuration** as Site URL/redirect URLs.
7. Attach the custom domain in Vercel and configure the DNS records shown by Vercel.

Do not run migrations as part of every Vercel build. Run `npm run db:migrate` deliberately when a reviewed migration is added.

## Secure upload design

B2B files do not pass through a Vercel Function body. The server creates short-lived signed Supabase upload tokens, the browser uploads directly into the private bucket, and the server verifies every object before marking the application submitted. This preserves the 8 MB-per-file requirement and avoids serverless request-size limits.

## Verification

```bash
npm run build
npx tsc --noEmit
npm run lint
npm audit --omit=dev
```

## Data and security notes

- Application tables have RLS enabled and no anon/authenticated REST privileges. Public reads and authorised writes go through validated server routes.
- `SUPABASE_SERVICE_ROLE_KEY` and `DATABASE_URL` are server-only secrets.
- The private B2B bucket is accessed only after an administrator session check.
- Code deployments do not erase PostgreSQL data. Creating a different Supabase project requires an explicit database export/import.
- Configure Supabase database backups/PITR according to the production plan selected for the organisation.
