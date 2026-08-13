import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const file = (path) => readFile(new URL(path, root), "utf8");

test("targets standard Next.js on Vercel", async () => {
  const [packageJson, vercel] = await Promise.all([file("package.json"), file("vercel.json")]);
  assert.match(packageJson, /"dev": "next dev"/);
  assert.match(packageJson, /"build": "next build"/);
  assert.match(packageJson, /"@supabase\/supabase-js"/);
  assert.match(packageJson, /"postgres"/);
  assert.match(vercel, /"framework": "nextjs"/);
  await assert.rejects(access(new URL(".openai/hosting.json", root)));
  await assert.rejects(access(new URL("vite.config.ts", root)));
});

test("uses PostgreSQL with protected Supabase resources", async () => {
  const [schema, migration] = await Promise.all([
    file("db/schema.ts"),
    file("drizzle/0000_tired_virginia_dare.sql"),
  ]);
  assert.match(schema, /from "drizzle-orm\/pg-core"/);
  assert.doesNotMatch(schema, /sqliteTable|drizzle-orm\/sqlite-core/);
  assert.match(migration, /ENABLE ROW LEVEL SECURITY/);
  assert.match(migration, /'public-media'/);
  assert.match(migration, /'b2b-documents'/);
  assert.match(migration, /REVOKE ALL .* FROM anon, authenticated/s);
});

test("uses signed direct uploads and Supabase Auth", async () => {
  const [applicationRoute, applicationPage, adminAuth] = await Promise.all([
    file("app/api/b2b/applications/route.ts"),
    file("app/b2b/apply/page.tsx"),
    file("app/admin-auth.ts"),
  ]);
  assert.match(applicationRoute, /createSignedUploadUrl/);
  assert.match(applicationPage, /uploadToSignedUrl/);
  assert.match(adminAuth, /supabase\.auth\.getUser\(\)/);
  assert.doesNotMatch(adminAuth, /oai-authenticated-user|ChatGPT/);
});

test("avoids pipelined database reads through the Supabase transaction pooler", async () => {
  const [publicData, adminOverview, adminConsole] = await Promise.all([
    file("db/public-data.ts"),
    file("app/api/admin/overview/route.ts"),
    file("app/admin/AdminConsole.tsx"),
  ]);
  assert.doesNotMatch(publicData, /Promise\.all\(/);
  assert.doesNotMatch(adminOverview, /Promise\.all\(/);
  assert.match(adminConsole, /ADMIN_LOAD_TIMEOUT_MS/);
  assert.match(adminConsole, /AbortController/);
});

test("imports real-world houseboat workbooks and permanently deletes records", async () => {
  const [importRoute, recordsRoute, adminOverview] = await Promise.all([
    file("app/api/admin/import/houseboats/route.ts"),
    file("app/api/admin/records/[entity]/route.ts"),
    file("app/api/admin/overview/route.ts"),
  ]);
  assert.match(importRoute, /read-excel-file\/node/);
  assert.match(importRoute, /headerRowIndex\(rows\)/);
  assert.match(importRoute, /normalizeMembershipNumber/);
  assert.match(importRoute, /filter\(\(record\) => record\.membership_number\)/);
  assert.match(importRoute, /category: record\.category \|\| ""/);
  assert.doesNotMatch(recordsRoute, /houseboats:\s*\{[^}]*softDelete:\s*true/);
  assert.match(adminOverview, /isNull\(houseboats\.archivedAt\)/);
});

test("keeps site typography readable and admin navigation stationary", async () => {
  const globalCss = await file("app/globals.css");
  assert.match(globalCss, /body\s*\{[^}]*font-size:\s*16px/);
  assert.match(globalCss, /\.desktop-nav a\s*\{[^}]*font-size:\s*14px/);
  assert.match(globalCss, /\.admin-shell\s*\{[^}]*height:\s*100dvh[^}]*overflow:\s*hidden/);
  assert.match(globalCss, /\.admin-sidebar\s*\{[^}]*height:\s*100dvh[^}]*overflow-y:\s*auto/);
  assert.match(globalCss, /\.admin-content\s*\{[^}]*overflow-y:\s*auto/);
  assert.match(globalCss, /\.ornament\s*\{[^}]*width:\s*140px[^}]*height:\s*140px/);
  assert.match(globalCss, /\.stat-grid > div\s*\{[^}]*min-height:\s*152px/);
  assert.match(globalCss, /\.boat-card\s*\{[^}]*display:\s*grid/);
  assert.match(globalCss, /\.admin-shell\s*\{[^}]*grid-template-columns:\s*260px 1fr/);
  assert.match(globalCss, /\.admin-record-row\s*\{[^}]*min-height:\s*64px/);
});

test("uses one content field without a public language switch", async () => {
  const [publicSite, contentPages, adminConsole, publicData, recordsRoute, exportRoute] = await Promise.all([
    file("app/components/PublicSite.tsx"),
    file("app/components/ContentPages.tsx"),
    file("app/admin/AdminConsole.tsx"),
    file("db/public-data.ts"),
    file("app/api/admin/records/[entity]/route.ts"),
    file("app/api/admin/export/[entity]/route.ts"),
  ]);
  for (const source of [publicSite, contentPages, adminConsole, publicData, recordsRoute, exportRoute]) {
    assert.doesNotMatch(source, /nameBn|titleBn|descriptionBn|designationBn|bioBn|excerptBn|contentBn/);
    assert.doesNotMatch(source, /name_bn|title_bn|description_bn|designation_bn|bio_bn|excerpt_bn|content_bn/);
  }
  assert.doesNotMatch(publicSite, /onLanguage|hoab-language|>\s*বাংলা\s*</);
  assert.match(adminConsole, /\["name_en","Name","text"\]/);
  assert.match(adminConsole, /\["designation_en","Position","text"\]/);
});

test("keeps retired management sections out of the admin panel", async () => {
  const [adminConsole, adminOverview] = await Promise.all([
    file("app/admin/AdminConsole.tsx"),
    file("app/api/admin/overview/route.ts"),
  ]);
  for (const label of ["Events", "Resources", "Media library", "Contact messages", "Admin users", "Audit logs"]) {
    assert.doesNotMatch(adminConsole, new RegExp(`\\[\\"[^\\"]+\\",\\"${label}\\"\\]`));
  }
  assert.doesNotMatch(adminOverview, /from\(events\)|from\(resources\)|from\(enquiries\)|from\(mediaAssets\)|from\(auditLogs\)|from\(adminUsers\)/);
  assert.match(adminConsole, /Member photo/);
  assert.match(adminConsole, /uploadAdminMedia/);
});
