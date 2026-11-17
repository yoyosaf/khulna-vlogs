import { eq, sql } from 'drizzle-orm';
import { db } from './index.ts';
import { users } from './schema.ts';

export async function getOrCreateUser(
  uid: string,
  email: string,
  displayName?: string | null
) {
  try {
    const allowedAdmins = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.uid, uid))
      .limit(1);

    if (existing.length > 0) {
      const current = existing[0];
      if (
        allowedAdmins.includes(email.toLowerCase()) &&
        current.role !== 'admin'
      ) {
        const updated = await db
          .update(users)
          .set({ role: 'admin', email, displayName: displayName || current.displayName })
          .where(eq(users.uid, uid))
          .returning();
        return updated[0];
      }
      return current;
    }

    const adminCountResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.role, 'admin'));
    const adminCount = adminCountResult[0]?.count ?? 0;

    const shouldBeAdmin =
      allowedAdmins.includes(email.toLowerCase()) ||
      (allowedAdmins.length === 0 && adminCount === 0);

    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        displayName: displayName || email.split('@')[0],
        role: shouldBeAdmin ? 'admin' : 'viewer',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          displayName: displayName || email.split('@')[0],
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database error in getOrCreateUser:', error);
    throw new Error('Failed to synchronize user profile.', { cause: error });
  }
}
