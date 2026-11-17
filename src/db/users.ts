import { eq } from 'drizzle-orm';
import { db, isPostgresConfigured } from './index.js';
import { users } from './schema.js';

export const SUPER_ADMIN_EMAILS = [
  'babayoyosaf@gmail.com',
  'realsafikul@gmail.com',
] as const;

export function getAllowedAdminEmails(): string[] {
  const envAdmins = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return Array.from(new Set([...SUPER_ADMIN_EMAILS, ...envAdmins]));
}

export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.includes(
    email.trim().toLowerCase() as (typeof SUPER_ADMIN_EMAILS)[number]
  );
}

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super(
      'PostgreSQL database is not configured for this environment. Set SQL_HOST, SQL_USER, SQL_PASSWORD, and SQL_DB_NAME in environment variables.'
    );
    this.name = 'DatabaseNotConfiguredError';
  }
}

export async function getOrCreateUser(
  uid: string,
  email: string,
  displayName?: string | null
) {
  if (!isPostgresConfigured()) {
    throw new DatabaseNotConfiguredError();
  }

  const normalizedEmail = email.trim().toLowerCase();
  const allowedAdmins = getAllowedAdminEmails();
  const isAuthorizedAdmin = allowedAdmins.includes(normalizedEmail);

  try {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.uid, uid))
      .limit(1);

    if (existing.length > 0) {
      const current = existing[0];
      if (isAuthorizedAdmin && current.role !== 'admin') {
        const updated = await db
          .update(users)
          .set({
            role: 'admin',
            email,
            displayName: displayName || current.displayName,
          })
          .where(eq(users.uid, uid))
          .returning();
        return updated[0];
      }
      return current;
    }

    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        displayName: displayName || email.split('@')[0],
        role: isAuthorizedAdmin ? 'admin' : 'viewer',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          displayName: displayName || email.split('@')[0],
          ...(isAuthorizedAdmin ? { role: 'admin' } : {}),
        },
      })
      .returning();

    return result[0];
  } catch (error: any) {
    console.error(
      JSON.stringify({
        level: 'error',
        scope: 'db/users',
        event: 'get_or_create_user_failed',
        errorCode: error?.code || null,
        errorMessage: error?.message || String(error),
      })
    );
    throw new Error('Failed to synchronize user profile.', { cause: error });
  }
}
