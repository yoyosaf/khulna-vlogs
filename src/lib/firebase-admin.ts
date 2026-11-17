import fs from 'node:fs';
import path from 'node:path';
import type { Auth } from 'firebase-admin/auth';

function resolveFirebaseProjectId(): string {
  if (process.env.FIREBASE_PROJECT_ID?.trim()) {
    return process.env.FIREBASE_PROJECT_ID.trim();
  }
  if (process.env.VITE_FIREBASE_PROJECT_ID?.trim()) {
    return process.env.VITE_FIREBASE_PROJECT_ID.trim();
  }

  try {
    const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const raw = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (raw?.projectId) {
        return String(raw.projectId);
      }
    }
  } catch (err: any) {
    console.warn(
      JSON.stringify({
        level: 'warn',
        scope: 'firebase-admin',
        event: 'config_file_read_failed',
        errorMessage: err?.message || String(err),
      })
    );
  }

  return 'eternal-episode-sw2pc';
}

let cachedAuth: Auth | null = null;
let authInitPromise: Promise<Auth> | null = null;

export async function getAdminAuth(): Promise<Auth> {
  if (cachedAuth) {
    return cachedAuth;
  }
  if (authInitPromise) {
    return authInitPromise;
  }

  authInitPromise = (async () => {
    try {
      const [{ cert, getApps, initializeApp }, { getAuth }] = await Promise.all([
        import('firebase-admin/app'),
        import('firebase-admin/auth'),
      ]);

      if (!getApps().length) {
        const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
        if (serviceAccountJson) {
          const parsed = JSON.parse(serviceAccountJson);
          initializeApp({
            credential: cert(parsed),
            projectId: parsed.project_id || resolveFirebaseProjectId(),
          });
        } else {
          initializeApp({
            projectId: resolveFirebaseProjectId(),
          });
        }
      }

      cachedAuth = getAuth();
      return cachedAuth;
    } catch (error: any) {
      authInitPromise = null;
      console.error(
        JSON.stringify({
          level: 'error',
          scope: 'firebase-admin',
          event: 'initialize_failed',
          errorName: error?.name || 'Error',
          errorCode: error?.code || null,
          errorMessage: error?.message || String(error),
        })
      );
      throw error;
    }
  })();

  return authInitPromise;
}
