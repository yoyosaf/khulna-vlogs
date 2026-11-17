import { NextFunction, Request, Response } from 'express';
import { DecodedIdToken } from 'firebase-admin/auth';
import { getAdminAuth } from '../lib/firebase-admin.js';
import { DatabaseNotConfiguredError, getOrCreateUser } from '../db/users.js';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
  dbUser?: {
    id: number;
    uid: string;
    email: string;
    displayName: string | null;
    role: string;
  };
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  let authClient;
  try {
    authClient = getAdminAuth();
  } catch (initError: any) {
    console.error(
      JSON.stringify({
        level: 'error',
        scope: 'middleware/auth',
        event: 'firebase_admin_unavailable',
        errorCode: initError?.code || null,
        errorMessage: initError?.message || String(initError),
      })
    );
    return res.status(500).json({ error: 'Authentication service initialization failed' });
  }

  let decodedToken: DecodedIdToken;
  try {
    decodedToken = await authClient.verifyIdToken(token);
    req.user = decodedToken;
  } catch (error: any) {
    console.warn(
      JSON.stringify({
        level: 'warn',
        scope: 'middleware/auth',
        event: 'invalid_id_token',
        errorCode: error?.code || null,
        errorMessage: error?.message || String(error),
      })
    );
    return res.status(401).json({
      error: `Unauthorized: ${error?.code || 'Invalid token'}`,
    });
  }

  try {
    const dbUser = await getOrCreateUser(
      decodedToken.uid,
      decodedToken.email || '',
      decodedToken.name || null
    );
    req.dbUser = dbUser;
    next();
  } catch (error: any) {
    if (error instanceof DatabaseNotConfiguredError) {
      return res.status(503).json({ error: error.message });
    }
    console.error(
      JSON.stringify({
        level: 'error',
        scope: 'middleware/auth',
        event: 'db_user_sync_failed',
        errorCode: error?.code || null,
        errorMessage: error?.message || String(error),
      })
    );
    return res.status(500).json({ error: 'Failed to load user profile from database' });
  }
};

export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  await requireAuth(req, res, async () => {
    if (!req.dbUser || req.dbUser.role !== 'admin') {
      return res
        .status(403)
        .json({ error: 'Forbidden: Administrator privileges required' });
    }
    next();
  });
};
