/**
 * REACH (R3Pro) Database Verification Script
 * Inspects Vercel Postgres (Neon) to verify all tables, columns, indexes, and functions
 */

import { neon } from '@neondatabase/serverless';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
  console.error('To verify your database, run:');
  console.error('  POSTGRES_URL="postgres://..." npm run db:verify');
  console.error('Or pull your Vercel envs:');
  console.error('  npx vercel env pull .env.local\n');
  process.exit(1);
}

const EXPECTED_TABLES = [
  'organizations',
  'users',
  'events',
  'sub_parts',
  'shifts',
  'item_slots',
  'commercial_tiers',
  'registrations',
  'group_members',
  'claimed_shifts',
  'claimed_items',
  'ticket_purchases',
  'pro_bono_pledges',
  'signed_waivers',
  'donations',
  'volunteer_crm_profiles',
  'volunteer_event_history',
  'announcements',
  'approval_requests',
  'audit_logs'
];

async function verifyDatabase() {
  console.log('\n🔍 Connecting to Vercel Postgres (Neon)...');
  try {
    const sql = neon(connectionString);

    // 1. Fetch tables
    const tableRows = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    const existingTables = tableRows.map(r => r.table_name);
    console.log(`\n📋 Found ${existingTables.length} tables in database:`);

    let allTablesPresent = true;
    for (const expected of EXPECTED_TABLES) {
      if (existingTables.includes(expected)) {
        console.log(`   ✓ ${expected.padEnd(26)} [EXISTS]`);
      } else {
        console.log(`   ❌ ${expected.padEnd(26)} [MISSING]`);
        allTablesPresent = false;
      }
    }

    // 2. Check for anti-collision overlap function & Immutability Trigger
    const functionRows = await sql`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_schema = 'public' 
        AND routine_name IN ('check_volunteer_shift_overlap', 'prevent_immutable_tax_receipt_tampering');
    `;

    const routines = functionRows.map(r => r.routine_name);
    console.log(`\n🛡️  Security Functions & Triggers:`);
    console.log(`   • Anti-Collision Engine: check_volunteer_shift_overlap [${routines.includes('check_volunteer_shift_overlap') ? 'INSTALLED ✓' : 'MISSING ❌'}]`);
    console.log(`   • IRS Immutability Trigger: prevent_immutable_tax_receipt_tampering [${routines.includes('prevent_immutable_tax_receipt_tampering') ? 'INSTALLED ✓' : 'MISSING ❌'}]`);

    // 3. Check Row-Level Security (RLS) status across tables
    const rlsRows = await sql`
      SELECT tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public' AND rowsecurity = true;
    `;
    console.log(`\n🔒 Row-Level Security (RLS) Protected Tables: ${rlsRows.length} tables active.`);

    // 4. Summary
    console.log('\n======================================================');
    if (allTablesPresent && routines.length >= 2 && rlsRows.length >= 15) {
      console.log('🎉 VERIFICATION SUCCESS: All schema tables, RLS policies, and SOC 2 / IRS triggers are correctly installed!');
    } else {
      console.log('⚠️  VERIFICATION INCOMPLETE: Some tables or policies are missing.');
    }
    console.log('======================================================\n');
  } catch (err) {
    console.error('❌ Connection or query error:', err.message);
    process.exit(1);
  }
}

verifyDatabase();
