/**
 * Next.js Instrumentation — Server-side error and request logging.
 *
 * This file is loaded once when the Next.js server starts. It registers
 * an `onRequestError` handler that captures RSC, SSR, and API route
 * errors with their digest, path, and method for production monitoring.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Initialization hook — runs once on server start.
  // Use this to set up external error-reporting SDKs (e.g., Sentry)
  // when adding a third-party service in the future.

  const hasMistralKey = !!process.env.MISTRAL_API_KEY;
  const hasDb = !!process.env.DATABASE_URL;

  if (!hasMistralKey) {
    console.warn(
      "[MistralHR] MISTRAL_API_KEY is not set. " +
      "The chat API will run in demo mode with static canned responses. " +
      "Set MISTRAL_API_KEY in .env.local (development) or your hosting platform's " +
      "environment variables (Vercel/Railway/Azure) to enable AI-powered chat."
    );
  } else {
    const mode = hasDb ? "full RAG mode (Mistral + DB)" : "Mistral-only mode (no DB)";
    console.info(`[MistralHR] MISTRAL_API_KEY detected — starting in ${mode}.`);
  }
}

export async function onRequestError(
  error: { digest: string; message: string; stack?: string },
  request: { path: string; method: string; headers: Record<string, string> },
  context: { routerKind: string; routePath: string; routeType: string; renderSource: string },
) {
  // Log with structured data so log aggregators (Azure Monitor, Datadog, etc.) can parse it.
  const logEntry: Record<string, string | undefined> = {
    level: "error",
    timestamp: new Date().toISOString(),
    digest: error.digest,
    message: error.message,
    method: request.method,
    path: request.path,
    routerKind: context.routerKind,
    routePath: context.routePath,
    routeType: context.routeType,
    renderSource: context.renderSource,
  };

  // Include stack traces only in development to avoid leaking internals in production logs.
  if (process.env.NODE_ENV === "development") {
    logEntry.stack = error.stack;
  }

  console.error(JSON.stringify(logEntry));

  // Future: forward to an external error-tracking service.
  // Example with Sentry:
  //   const Sentry = await import("@sentry/nextjs");
  //   Sentry.captureException(error, { extra: { request, context } });
}
