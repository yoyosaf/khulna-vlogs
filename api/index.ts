import type { Express } from 'express';
import { createApp } from '../src/server/createApp.js';

let cachedApp: Express | null = null;

function getApp(): Express {
  if (!cachedApp) {
    cachedApp = createApp();
  }
  return cachedApp;
}

export default function handler(req: any, res: any) {
  try {
    const app = getApp();
    return app(req, res);
  } catch (error: any) {
    console.error(
      JSON.stringify({
        level: 'error',
        scope: 'api/index',
        event: 'serverless_handler_failed',
        method: req?.method,
        url: req?.url,
        errorName: error?.name || 'Error',
        errorCode: error?.code || null,
        errorMessage: error?.message || String(error),
      })
    );
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(
        JSON.stringify({
          error: 'Backend initialization failed',
          code: error?.code || error?.name || 'INTERNAL_SERVER_ERROR',
        })
      );
    }
  }
}
