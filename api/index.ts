import type { Express } from 'express';

let cachedApp: Express | null = null;

async function getApp(): Promise<Express> {
  if (!cachedApp) {
    const mod = await import('../src/server/createApp.js');
    cachedApp = mod.createApp();
  }
  return cachedApp;
}

export default async function handler(req: any, res: any) {
  try {
    const app = await getApp();
    await new Promise<void>((resolve, reject) => {
      let settled = false;
      const done = () => {
        if (!settled) {
          settled = true;
          resolve();
        }
      };

      res.once('finish', done);
      res.once('close', done);

      app(req, res, (err?: any) => {
        if (err) {
          if (!settled) {
            settled = true;
            reject(err);
          }
          return;
        }
        done();
      });
    });
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
