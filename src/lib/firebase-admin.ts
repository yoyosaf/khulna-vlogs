import fs from 'node:fs';
import path from 'node:path';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

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
  } catch (err) {
    console.warn('Could not read firebase-applet-config.json:', err);
  }

  return 'eternal-episode-sw2pc';
}

if (!getApps().length) {
  initializeApp({
    projectId: resolveFirebaseProjectId(),
  });
}

export const adminAuth = getAuth();
