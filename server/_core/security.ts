/**
 * Security middleware — rate limiting, headers, input sanitization
 * No extra packages needed: uses built-in Maps for rate limiting
 */
import type { Request, Response, NextFunction } from "express";

// ─── In-Memory Rate Limiter ──────────────────────────────────────────────────
interface RateLimitEntry { count: number; resetAt: number; }
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (entry.resetAt < now) rateLimitStore.delete(key);
  }
}, 5 * 60 * 1000);

function getClientIp(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

export function rateLimit(options: { windowMs: number; max: number; message?: string }) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = getClientIp(req);
    const key = `${ip}:${req.path}`;
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry || entry.resetAt < now) {
      rateLimitStore.set(key, { count: 1, resetAt: now + options.windowMs });
      return next();
    }

    if (entry.count >= options.max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader("Retry-After", retryAfter);
      return res.status(429).json({
        error: options.message ?? "Çok fazla istek. Lütfen bekleyin.",
        retryAfter,
      });
    }

    entry.count++;
    next();
  };
}

// ─── Security Headers ────────────────────────────────────────────────────────
export function securityHeaders() {
  return (_req: Request, res: Response, next: NextFunction) => {
    // Prevent clickjacking
    res.setHeader("X-Frame-Options", "DENY");
    // Prevent MIME sniffing
    res.setHeader("X-Content-Type-Options", "nosniff");
    // XSS protection (legacy)
    res.setHeader("X-XSS-Protection", "1; mode=block");
    // Referrer policy
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    // Content Security Policy
    res.setHeader(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Vite requires these in dev
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https:",
        "frame-ancestors 'none'",
      ].join("; ")
    );
    // Remove server fingerprint
    res.removeHeader("X-Powered-By");
    next();
  };
}

// ─── Input Sanitizer ─────────────────────────────────────────────────────────
export function sanitizeInput(input: unknown): unknown {
  if (typeof input === "string") {
    return input
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .trim();
  }
  if (Array.isArray(input)) return input.map(sanitizeInput);
  if (input && typeof input === "object") {
    return Object.fromEntries(
      Object.entries(input as Record<string, unknown>).map(([k, v]) => [k, sanitizeInput(v)])
    );
  }
  return input;
}

export function sanitizeMiddleware() {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (req.body) req.body = sanitizeInput(req.body);
    if (req.query) req.query = sanitizeInput(req.query) as typeof req.query;
    next();
  };
}

// ─── Admin Login Rate Limiter (stricter) ────────────────────────────────────
export const adminLoginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 5,
  message: "Çok fazla başarısız giriş denemesi. 15 dakika sonra tekrar deneyin.",
});

// ─── General API Rate Limiter ────────────────────────────────────────────────
export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 dakika
  max: 100,
  message: "Çok fazla istek gönderdiniz. Lütfen bekleyin.",
});
