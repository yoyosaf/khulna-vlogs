import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';

declare global {
  var _postgresPool: Pool | undefined;
  var _drizzleDb: NodePgDatabase<typeof schema> | undefined;
}

export function isPostgresConfigured(): boolean {
  const host = process.env.SQL_HOST?.trim();
  const dbName = process.env.SQL_DB_NAME?.trim();
  const user = process.env.SQL_USER?.trim();
  if (!host || !dbName || !user) return false;
  // Cloud Run Unix sockets (/cloudsql/...) are only reachable inside GCP/Cloud Run
  if (process.env.VERCEL && host.startsWith('/cloudsql/')) return false;
  return true;
}

export const createPool = (): Pool => {
  if (!global._postgresPool) {
    const parsedPort = process.env.SQL_PORT ? Number(process.env.SQL_PORT) : undefined;
    global._postgresPool = new Pool({
      host: process.env.SQL_HOST,
      port: Number.isFinite(parsedPort) ? parsedPort : undefined,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DB_NAME,
      ssl:
        process.env.SQL_SSL === 'true'
          ? { rejectUnauthorized: false }
          : undefined,
      max: 10,
      connectionTimeoutMillis: 15000,
    });

    global._postgresPool.on('error', (err) => {
      console.error(
        JSON.stringify({
          level: 'error',
          scope: 'postgres-pool',
          event: 'idle_client_error',
          errorMessage: err?.message || String(err),
        })
      );
    });
  }
  return global._postgresPool;
};

export function getDb(): NodePgDatabase<typeof schema> {
  if (!global._drizzleDb) {
    global._drizzleDb = drizzle(createPool(), { schema });
  }
  return global._drizzleDb;
}

export const db: NodePgDatabase<typeof schema> = new Proxy(
  {} as NodePgDatabase<typeof schema>,
  {
    get(_target, prop, receiver) {
      const instance = getDb();
      const value = Reflect.get(instance, prop, receiver);
      return typeof value === 'function' ? value.bind(instance) : value;
    },
  }
);
