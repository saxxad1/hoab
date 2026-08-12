import { config } from "dotenv";

config({ path: ".env.local" });
config();

process.env.DATABASE_URL = process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL;

const { seedDatabase } = await import("../db/seed");
const { closeDatabase } = await import("../db");

try {
  await seedDatabase();
  console.log("HOAB Supabase seed completed.");
} finally {
  await closeDatabase();
}
