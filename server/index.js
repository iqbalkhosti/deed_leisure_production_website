import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

import checkoutRouter        from './routes/checkout.js';
import webhookRouter         from './routes/webhook.js';
import refundRouter          from './routes/refund.js';
import analyticsRouter       from './routes/analytics.js';
import connectRouter         from './routes/connect.js';
import deleteUserRouter      from './routes/deleteUser.js';
import discountCodesRouter   from './routes/discountCodes.js';
import sendEmailRouter       from './routes/sendEmail.js';
import designRequestsRouter  from './routes/designRequests.js';
import { startAutoCloseJob } from './jobs/autoClose.js';

const app  = express();
const PORT = process.env.PORT || 4242;
const isProd = process.env.NODE_ENV === 'production';

// ── Security headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = new Set([
  'https://deed-jet.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
]);

// Matches ANY Vercel deployment for this project (preview + branch deploys)
const vercelPattern = /^https:\/\/deed[a-z0-9-]*\.vercel\.app$/;

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.has(origin)) return cb(null, true);
    if (vercelPattern.test(origin)) return cb(null, true);
    console.warn(`[CORS] Rejected origin: ${origin}`);
    cb(null, false);
  },
  credentials: true,
}));

// ── Rate limiting ─────────────────────────────────────────────────────────────
// Global: 200 req / 15 min per IP
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
}));

// Tighter limit on checkout to prevent abuse
app.use('/checkout', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many checkout attempts, please try again later.' },
}));

// ── Webhook route MUST use raw body before express.json() ────────────────────
app.use('/webhook', express.raw({ type: 'application/json' }), webhookRouter);

// ── JSON body parser ─────────────────────────────────────────────────────────
// Design Studio submissions include a generated mockup PNG. Individual payloads
// are bounded again by the route and rate limiter below.
app.use(express.json({ limit: '8mb' }));

// ── Health ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/checkout',              checkoutRouter);
app.use('/admin/refund',          refundRouter);
app.use('/admin/analytics',       analyticsRouter);
app.use('/admin/connect',         connectRouter);
app.use('/admin/delete-user',     deleteUserRouter);
app.use('/admin/discount-codes',  discountCodesRouter);
app.use('/discount',              discountCodesRouter);
app.use('/vendor/send-email',     sendEmailRouter);
app.use('/design-requests', rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many mockup requests. Please try again in an hour.' },
}));
app.use('/design-requests',       designRequestsRouter);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[unhandled error]', err);
  const status = err.status ?? err.statusCode ?? 500;
  // Never leak stack traces to clients in production
  const message = isProd ? 'An unexpected error occurred.' : (err.message ?? 'Internal server error');
  res.status(status).json({ error: message });
});

// ── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
  startAutoCloseJob();
});
