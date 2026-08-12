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
