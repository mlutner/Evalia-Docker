import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATABASE CONNECTION WARNING
// ═══════════════════════════════════════════════════════════════════════════════
const dbUrl = process.env.DATABASE_URL;
const isLocalDb = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');
const isNeonDb = dbUrl.includes('neon.tech');

console.log('\n' + '═'.repeat(70));
if (isLocalDb) {
  console.log('⚠️  DATABASE: LOCAL DOCKER (localhost)');
  console.log('⚠️  WARNING: This database is for LOCAL DEVELOPMENT ONLY!');
  console.log('⚠️  Real survey data is in the Replit/Neon production database.');
  console.log('⚠️  To access real data, use DATABASE_URL from Replit Secrets.');
} else if (isNeonDb) {
  console.log('✅ DATABASE: PRODUCTION (Neon/Replit)');
  console.log('✅ Connected to production database with real survey data.');
} else {
  console.log('ℹ️  DATABASE: Custom connection');
  console.log('ℹ️  URL pattern:', dbUrl.split('@')[1]?.split('/')[0] || 'unknown');
}
console.log('═'.repeat(70) + '\n');

const pool = new pg.Pool({
  connectionString: dbUrl,
});

export const db = drizzle(pool, { schema });
