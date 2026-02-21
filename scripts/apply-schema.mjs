import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_URL = "postgresql://neondb_owner:npg_vu50yCxklAOJ@ep-fragrant-shape-a81eiwmh-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require";

const sql = neon(DB_URL);
const schema = readFileSync(join(__dirname, "../prisma/schema.sql"), "utf8");

// Strip line comments, split on semicolons
const statements = schema
  .replace(/--[^\n]*/g, "")
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

console.log(`Applying ${statements.length} statements...`);

for (const stmt of statements) {
  try {
    // Call neon as a regular function with a raw string query
    await sql(stmt, []);
    console.log("  ✓", stmt.slice(0, 70).replace(/\s+/g, " "));
  } catch (e) {
    if (e.message.includes("already exists")) {
      console.log("  ~ already exists:", stmt.slice(0, 50).replace(/\s+/g, " "));
    } else {
      console.error("  ✗ ERROR:", e.message);
    }
  }
}

console.log("\nDone.");


