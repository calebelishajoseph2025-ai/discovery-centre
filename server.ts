/**
 * Northside Discovery Centre - Express API Server & Vite Dev Server Integration.
 * Implements all typed API routes from §2.6.6 with strict Zod validation,
 * rate limiting, uniform error shapes, and store integration.
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { CENTRE_FACTS } from './src/content/centre.ts';
import { EXHIBITS, ExhibitSlug } from './src/content/exhibits.ts';
import { FAQS } from './src/content/faq.ts';
import { getStatus } from './src/lib/status.ts';
import { quote } from './src/lib/pricing.ts';
import { buildPlan } from './src/lib/plan-engine.ts';
import { toICS } from './src/lib/ics.ts';
import { heatmap, bestArrival } from './src/lib/busyness.ts';
import {
  PlanInputSchema,
  FeedbackInputSchema,
  ShortPlanPayloadSchema,
  FavouriteActionSchema,
} from './src/lib/schemas.ts';
import { decodePlanInput, encodePlanInput } from './src/lib/share.ts';
import { planHash } from './src/lib/plan-hash.ts';
import { generateShortCode } from './src/lib/short-code.ts';
import {
  planRateLimiter,
  feedbackRateLimiter,
  shortPlanRateLimiter,
  favouritesRateLimiter,
} from './src/lib/rate-limit.ts';
import { formatErrorResponse } from './src/lib/respond.ts';
import { getStore, getVisitorKey } from './src/store/index.ts';
import { RateLimited, StoreUnavailable } from './src/store/errors.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';

// Request body parser
app.use(express.json({ limit: '64kb' }));

// Helper to get client IP
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

// Security Headers Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self'; connect-src 'self' ws: wss: https:; worker-src 'self'; manifest-src 'self'; frame-ancestors *; base-uri 'self'; form-action 'self'"
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// Structured request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const elapsed = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path} -> ${res.statusCode} (${elapsed}ms)`);
    }
  });
  next();
});

/* ==========================================================================
   API ENDPOINTS
   ========================================================================== */

// 1. GET /api/health
app.get('/api/health', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  const store = getStore();
  const isDeep = req.query.deep === '1' || req.query.deep === 'true';

  if (!isDeep) {
    return res.json({
      ok: true,
      version: '2.0.0',
      store: store.mode,
    });
  }

  // Deep check rate limited to 10/min
  const storeReachable = await store.ping();
  return res.json({
    ok: true,
    version: '2.0.0',
    store: store.mode,
    storeReachable,
  });
});

// 2. GET /api/centre
app.get('/api/centre', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.json(CENTRE_FACTS);
});

// 3. GET /api/status
app.get('/api/status', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  let atDate = new Date();
  if (typeof req.query.at === 'string') {
    const parsed = new Date(req.query.at);
    if (!isNaN(parsed.getTime())) {
      atDate = parsed;
    }
  }
  const result = getStatus(atDate);
  res.json(result);
});

// 4. GET /api/exhibits
app.get('/api/exhibits', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  let list = [...EXHIBITS];

  if (typeof req.query.interest === 'string') {
    const interest = req.query.interest.toLowerCase();
    list = list.filter((e) => e.interests.includes(interest));
  }

  if (typeof req.query.maxMinutes === 'string') {
    const maxMinutes = parseInt(req.query.maxMinutes, 10);
    if (!isNaN(maxMinutes)) {
      list = list.filter((e) => e.durationMinutes <= maxMinutes);
    }
  }

  res.json({ exhibits: list });
});

// 5. GET /api/exhibits/:slug
app.get('/api/exhibits/:slug', (req: Request, res: Response) => {
  const slug = req.params.slug as ExhibitSlug;
  const exhibit = EXHIBITS.find((e) => e.slug === slug);

  if (!exhibit) {
    return res
      .status(404)
      .json(
        formatErrorResponse(
          'NOT_FOUND',
          `Exhibit with slug '${req.params.slug}' not found`
        )
      );
  }

  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.json(exhibit);
});

// 6. GET /api/tickets/quote
app.get('/api/tickets/quote', (req: Request, res: Response) => {
  const adults = parseInt(req.query.adults as string, 10);
  const children =
    req.query.children !== undefined
      ? parseInt(req.query.children as string, 10)
      : 0;

  if (isNaN(adults) || isNaN(children)) {
    return res
      .status(400)
      .json(
        formatErrorResponse('VALIDATION_ERROR', 'Adult and child counts must be numbers', [
          { path: 'adults', issue: 'must be integer' },
        ])
      );
  }

  try {
    const quoteResult = quote(adults, children);
    res.json(quoteResult);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid ticket parameters';
    return res
      .status(400)
      .json(formatErrorResponse('VALIDATION_ERROR', msg, [{ path: 'party', issue: msg }]));
  }
});

// 7. POST /api/plan
app.post('/api/plan', (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const { allowed, retryAfterSeconds } = planRateLimiter.take(ip);
  if (!allowed) {
    res.setHeader('Retry-After', String(retryAfterSeconds));
    return res
      .status(429)
      .json(
        formatErrorResponse(
          'RATE_LIMITED',
          'Too many planning requests. Please wait a moment.'
        )
      );
  }

  const parsed = PlanInputSchema.safeParse(req.body);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => ({
      path: i.path.join('.'),
      issue: i.message,
    }));
    return res
      .status(400)
      .json(formatErrorResponse('VALIDATION_ERROR', 'Invalid plan input parameters', details));
  }

  const plan = buildPlan(parsed.data);
  res.json({ plan });
});

// 8. GET /api/plan/ics
app.get('/api/plan/ics', (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const { allowed, retryAfterSeconds } = planRateLimiter.take(ip);
  if (!allowed) {
    res.setHeader('Retry-After', String(retryAfterSeconds));
    return res
      .status(429)
      .json(formatErrorResponse('RATE_LIMITED', 'Too many calendar requests'));
  }

  const decodeRes = decodePlanInput(req.query as Record<string, string>);
  if (!decodeRes.success || !decodeRes.data) {
    return res
      .status(400)
      .json(
        formatErrorResponse(
          'VALIDATION_ERROR',
          'Invalid parameters for calendar export',
          decodeRes.errors?.map((e) => ({ path: 'query', issue: e }))
        )
      );
  }

  const plan = buildPlan(decodeRes.data);
  const icsText = toICS(plan, decodeRes.data.date);

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="northside-discovery-visit.ics"'
  );
  res.send(icsText);
});

// 9. GET /api/faq
app.get('/api/faq', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  let list = FAQS;

  if (typeof req.query.q === 'string' && req.query.q.trim()) {
    const q = req.query.q.toLowerCase().trim();
    list = list.filter(
      (f) =>
        f.question.en.toLowerCase().includes(q) ||
        f.question.ta.toLowerCase().includes(q) ||
        f.answer.en.toLowerCase().includes(q) ||
        f.answer.ta.toLowerCase().includes(q)
    );
  }

  res.json({ faqs: list });
});

// 10. GET /api/best-time
app.get('/api/best-time', (req: Request, res: Response) => {
  let dayOfWeek = 2; // Default Tuesday
  if (typeof req.query.dayOfWeek === 'string') {
    const d = parseInt(req.query.dayOfWeek, 10);
    if (!isNaN(d) && d >= 0 && d <= 6) {
      dayOfWeek = d;
    }
  } else if (typeof req.query.date === 'string') {
    const parsed = new Date(req.query.date);
    if (!isNaN(parsed.getTime())) {
      dayOfWeek = parsed.getDay();
    }
  }

  const duration = parseInt(req.query.duration as string, 10);
  if (isNaN(duration) || duration < 15 || duration > 300) {
    return res
      .status(400)
      .json(
        formatErrorResponse(
          'VALIDATION_ERROR',
          'duration must be an integer between 15 and 300 minutes',
          [{ path: 'duration', issue: 'out of range' }]
        )
      );
  }

  res.setHeader('Cache-Control', 's-maxage=3600');
  const suggestion = bestArrival({ dayOfWeek, durationMinutes: duration });
  const heatmapRows = heatmap();

  res.json({
    dayOfWeek,
    heatmap: heatmapRows,
    suggestion,
  });
});

// 11. POST /api/feedback
app.post('/api/feedback', async (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const store = getStore();

  const { allowed, retryAfterSeconds } = feedbackRateLimiter.take(ip);
  if (!allowed) {
    res.setHeader('Retry-After', String(retryAfterSeconds));
    return res
      .status(429)
      .json(formatErrorResponse('RATE_LIMITED', 'Feedback rate limit exceeded'));
  }

  // Check store-backed visitor limiter
  const visitorKey = getVisitorKey(ip);
  const storeAllowed = await store.rateLimit.take('feedback', visitorKey, 5, 3600);
  if (!storeAllowed) {
    res.setHeader('Retry-After', '3600');
    return res
      .status(429)
      .json(formatErrorResponse('RATE_LIMITED', 'Hourly feedback quota exceeded'));
  }

  const parsed = FeedbackInputSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json(
        formatErrorResponse(
          'VALIDATION_ERROR',
          'Invalid feedback submission',
          parsed.error.issues.map((i) => ({ path: i.path.join('.'), issue: i.message }))
        )
      );
  }

  // Validate comment does not contain control characters
  if (parsed.data.comment) {
    // eslint-disable-next-line no-control-regex
    if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(parsed.data.comment)) {
      return res
        .status(400)
        .json(
          formatErrorResponse('VALIDATION_ERROR', 'Comment contains invalid control characters')
        );
    }
  }

  try {
    const hash = await planHash(parsed.data.plan);
    await store.feedback.submit(parsed.data, hash);
    res.status(201).json({ success: true });
  } catch (err: unknown) {
    if (err instanceof RateLimited) {
      res.setHeader('Retry-After', String(err.retryAfterSeconds));
      return res.status(429).json(formatErrorResponse('RATE_LIMITED', err.message));
    }
    if (err instanceof StoreUnavailable) {
      return res
        .status(503)
        .json(formatErrorResponse('STORE_UNAVAILABLE', 'Feedback service temporarily offline'));
    }
    return res
      .status(500)
      .json(formatErrorResponse('INTERNAL', 'Failed to store feedback'));
  }
});

// 12. GET /api/feedback/summary
app.get('/api/feedback/summary', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  const store = getStore();
  const summary = await store.feedback.summary();
  res.json(summary);
});

// 13. POST /api/plan/short
app.post('/api/plan/short', async (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const store = getStore();

  const { allowed, retryAfterSeconds } = shortPlanRateLimiter.take(ip);
  if (!allowed) {
    res.setHeader('Retry-After', String(retryAfterSeconds));
    return res
      .status(429)
      .json(formatErrorResponse('RATE_LIMITED', 'Too many short link creations'));
  }

  const parsed = ShortPlanPayloadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json(
        formatErrorResponse(
          'VALIDATION_ERROR',
          'Invalid short plan input',
          parsed.error.issues.map((i) => ({ path: i.path.join('.'), issue: i.message }))
        )
      );
  }

  const canonicalParams = encodePlanInput(parsed.data.input);
  const fallbackPath = `/plan?${canonicalParams.toString()}`;

  // Check store availability
  if (store.mode === 'off') {
    return res.status(503).json(
      formatErrorResponse('STORE_UNAVAILABLE', 'Short links are currently unavailable', undefined, {
        path: fallbackPath,
      })
    );
  }

  try {
    let code = '';
    let created = false;
    // Up to 3 attempts on collision
    for (let attempt = 0; attempt < 3; attempt++) {
      code = generateShortCode();
      created = await store.shortPlans.create(code, parsed.data);
      if (created) break;
    }

    if (!created) {
      return res.status(503).json(
        formatErrorResponse('STORE_UNAVAILABLE', 'Could not generate short code', undefined, {
          path: fallbackPath,
        })
      );
    }

    const expiresAt = new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString();
    return res.status(201).json({
      code,
      path: `/p/${code}`,
      expiresAt,
    });
  } catch {
    return res.status(503).json(
      formatErrorResponse('STORE_UNAVAILABLE', 'Short links unavailable', undefined, {
        path: fallbackPath,
      })
    );
  }
});

// 14. GET /api/plan/short/:code
app.get('/api/plan/short/:code', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  const code = req.params.code;
  const store = getStore();

  try {
    const payload = await store.shortPlans.get(code);
    if (!payload) {
      return res
        .status(404)
        .json(formatErrorResponse('NOT_FOUND', `Short plan code '${code}' not found or expired`));
    }
    return res.json(payload);
  } catch {
    return res
      .status(503)
      .json(formatErrorResponse('STORE_UNAVAILABLE', 'Short plan lookup unavailable'));
  }
});

// 15. GET /api/favourites
app.get('/api/favourites', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  const store = getStore();
  try {
    const counts = await store.favourites.counts();
    res.json({
      available: store.mode !== 'off',
      counts,
    });
  } catch {
    res.json({
      available: false,
      counts: {},
    });
  }
});

// 16. POST /api/favourites/:slug
app.post('/api/favourites/:slug', async (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const store = getStore();

  const slug = req.params.slug as ExhibitSlug;
  const exhibitExists = EXHIBITS.some((e) => e.slug === slug);
  if (!exhibitExists) {
    return res
      .status(404)
      .json(formatErrorResponse('NOT_FOUND', `Unknown exhibit slug: ${slug}`));
  }

  const { allowed, retryAfterSeconds } = favouritesRateLimiter.take(ip);
  if (!allowed) {
    res.setHeader('Retry-After', String(retryAfterSeconds));
    return res
      .status(429)
      .json(formatErrorResponse('RATE_LIMITED', 'Too many favourite adjustments'));
  }

  const parsed = FavouriteActionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json(formatErrorResponse('VALIDATION_ERROR', "Action must be 'add' or 'remove'"));
  }

  const delta = parsed.data.action === 'add' ? 1 : -1;

  try {
    const updatedCount = await store.favourites.adjust(slug, delta);
    res.json({ count: updatedCount });
  } catch (err: unknown) {
    if (err instanceof StoreUnavailable) {
      return res
        .status(503)
        .json(formatErrorResponse('STORE_UNAVAILABLE', 'Favourites store unavailable'));
    }
    return res
      .status(500)
      .json(formatErrorResponse('INTERNAL', 'Failed to update favourite'));
  }
});

// 17. GET /api/cron/keepalive
app.get('/api/cron/keepalive', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return res
      .status(401)
      .json(formatErrorResponse('UNAUTHORIZED', 'Invalid or missing authorization'));
  }

  const store = getStore();
  const ok = await store.ping();

  return res.json({
    ok: true,
    store: store.mode,
    storeReachable: ok,
  });
});

/* ==========================================================================
   Vercel / SPA / Static Serving Setup
   ========================================================================== */

async function startServer() {
  if (!isProduction) {
    // In dev: mount Vite middlewares
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production: serve dist directory
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `[Northside Discovery Centre] Server running on http://0.0.0.0:${PORT} (Mode: ${process.env.DATA_STORE || 'auto'})`
    );
  });
}

startServer().catch((err) => {
  console.error('[Server Error]', err);
  process.exit(1);
});
