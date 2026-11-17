export default function handler(_req: any, res: any) {
  const payload = JSON.stringify({
    success: true,
    message: 'Vercel backend is running',
  });
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(payload);
}
