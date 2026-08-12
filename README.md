# HOAB Official Website & Management System

Production-oriented V1 for the Houseboat Owners Association of Bangladesh.

## Included

- bilingual public website foundation (Bangla and English)
- database-backed registered houseboat directory and individual profiles
- leadership, news, events, resources, membership, FAQ and contact modules
- public authorised-agent directory and verification
- real B2B application submission, private document upload and status tracking
- protected admin console with role-based writes
- houseboat, category, leadership, agent, news, event, page, resource and user CRUD
- B2B review, approval and automatic agent-ID generation
- CSV/XLSX houseboat import and CSV exports
- public media library backed by object storage
- contact-message workflow, settings and audit logs
- SEO metadata, sitemap, robots policy, social sharing image and branded errors

## Run locally

Requirements: Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open the Local URL printed in the terminal. The local development server provisions its own D1 and R2-compatible storage state. Local `/admin` access uses a development administrator identity.

For production, copy `.env.example` to `.env` only when you need local environment overrides. Never commit secrets.

## Verify

```bash
npm run build
npx tsc --noEmit
npm run lint
npm audit --omit=dev
```

Database migrations live in `drizzle/` and are packaged with every Sites deployment. Operational content is seeded only when a new database is empty, then remains fully editable from `/admin`.

## Production access

The hosted admin uses Sign in with ChatGPT. `ADMIN_EMAILS` contains comma-separated bootstrap super-admin addresses. Additional administrators and scoped roles can be managed from the admin console.

Sensitive B2B documents are stored in the private `UPLOADS` bucket. Only authenticated administrators can download them. Public media is deliberately served through `/media/*`.

## Deployment

`.openai/hosting.json` declares:

- D1 binding: `DB`
- R2 binding: `UPLOADS`

The same application can be hosted on Sites or adapted to another Cloudflare Workers-compatible host. A different platform needs equivalent database, object-storage and identity bindings.
