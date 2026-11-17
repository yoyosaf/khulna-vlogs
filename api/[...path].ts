import { createApp } from '../src/server/createApp.ts';

const app = createApp();

export default function handler(req: any, res: any) {
  return app(req, res);
}
