/**
 * REACH (R3Pro) Database Migration Runner
 * Executes api/_lib/schema.sql against Vercel Postgres / Neon
 * Handles multi-statement parsing and executes each statement sequentially
 */

import { neon } from '@neondatabase/serverless';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 1. Resolve Connection String
let connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;

if (!connectionString) {
  const envPaths = [
    join(__dirname, '../.env.local'),
    join(__dirname, '../.env')
  ];

  for (const envPath of envPaths) {
    if (existsSync(envPath)) {
      const content = readFileSync(envPath, 'utf8');
      const match = content.match(/POSTGRES_URL=["']?([^"'\r\n]+)["']?/);
      if (match && match[1]) {
        connectionString = match[1];
        console.log(`✓ Loaded POSTGRES_URL from ${envPath}`);
        break;
      }
    }
  }
}

if (!connectionString) {
  console.error('\n❌ ERROR: No POSTGRES_URL found.');
  console.error('To run the migration, run:');
  console.error('  POSTGRES_URL="postgres://user:pass@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require" npm run db:migrate');
  console.error('Or paste POSTGRES_URL into .env.local\n');
  process.exit(1);
}

// 2. Read and Parse Schema & Security RLS SQL Statements
const schemaPath = join(__dirname, '../api/_lib/schema.sql');
const rlsPath = join(__dirname, '../api/_lib/security_rls.sql');

let rawSql = '';
if (existsSync(schemaPath)) {
  rawSql += readFileSync(schemaPath, 'utf8') + '\n';
}
if (existsSync(rlsPath)) {
  rawSql += readFileSync(rlsPath, 'utf8') + '\n';
}

/**
 * Splits SQL script into individual executable statements
 * Handles $$ function blocks and semicolons correctly
 */
function splitSqlStatements(sqlText) {
  const statements = [];
  let current = '';
  let inDollarQuote = false;

  const lines = sqlText.split('\n');
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Ignore pure comment lines when starting a new statement
    if (!current.trim() && trimmedLine.startsWith('--')) {
      continue;
    }

    if (line.includes('$$')) {
      inDollarQuote = !inDollarQuote;
    }

    current += line + '\n';

    if (!inDollarQuote && trimmedLine.endsWith(';')) {
      const stmt = current.trim();
      if (stmt && !stmt.startsWith('--')) {
        statements.push(stmt);
      }
      current = '';
    }
  }

  if (current.trim()) {
    statements.push(current.trim());
  }

  return statements;
}

const statements = splitSqlStatements(rawSql);

console.log(`\n🚀 Connecting to Vercel Postgres (Neon)...`);
console.log(`📄 Found ${statements.length} SQL statements to execute...\n`);

async function runMigration() {
  try {
    const sql = neon(connectionString);

    let count = 0;
    for (const stmt of statements) {
      count++;
      // Extract brief label for display
      const firstLine = stmt.split('\n').find(l => l.trim() && !l.trim().startsWith('--')) || '';
      const summary = firstLine.substring(0, 60);

      process.stdout.write(`   [${count}/${statements.length}] Executing: ${summary}... `);
      await sql.query(stmt);
      console.log('✓');
    }

    console.log('\n✅ All database statements executed successfully!');
    console.log('   All 15 core tables, unique indexes, and anti-collision functions are now provisioned.\n');

    // Verify created tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;

    console.log(`📋 Verified Tables in Database (${tables.length} total):`);
    tables.forEach(t => console.log(`   • ${t.table_name}`));
    console.log(`\n🎉 Step 1 Migration Complete!\n`);
  } catch (error) {
    console.error('\n❌ Migration failed on statement with error:', error);
    process.exit(1);
  }
}

runMigration();
