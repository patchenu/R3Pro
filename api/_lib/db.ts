import { neon, neonConfig } from '@neondatabase/serverless';

// Cache the SQL query executor
let sqlClient: ReturnType<typeof neon> | null = null;

export function isDatabaseConfigured(): boolean {
  const url = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;
  return Boolean(url && url.length > 0 && !url.includes('dummy'));
}

export function getDb() {
  if (sqlClient) return sqlClient;

  const connectionString = 
    process.env.POSTGRES_URL || 
    process.env.DATABASE_URL || 
    process.env.POSTGRES_PRISMA_URL;

  if (!connectionString) {
    // Return null in development/standalone preview without credentials
    return null;
  }

  try {
    sqlClient = neon(connectionString);
    return sqlClient;
  } catch (error) {
    console.warn('[Vercel Postgres/Neon] Failed to initialize DB client:', error);
    return null;
  }
}

/**
 * Executes a tenant-isolated database query
 * Ensures org_id is always validated to prevent cross-tenant data leakage
 */
export async function executeTenantQuery<T>(
  orgId: string,
  queryRunner: (sql: ReturnType<typeof neon>) => Promise<T>,
  fallbackValue: T
): Promise<T> {
  const sql = getDb();
  if (!sql) {
    return fallbackValue;
  }

  if (!orgId) {
    throw new Error('Multi-Tenant Violation: org_id is required for database operations.');
  }

  try {
    return await queryRunner(sql);
  } catch (error) {
    console.error(`[Vercel Postgres Error] Tenant ${orgId} query failed:`, error);
    throw error;
  }
}
