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
}

export async function onRequestError(
  error: { digest: string; message: string; stack?: string },
  request: { path: string; method: string; headers: Record<string, string> },
  context: { routerKind: string; routePath: string; routeType: string; renderSource: string },
) {
  // Log with structured data so log aggregators (Azure Monitor, Datadog, etc.) can parse it.
  console.error(JSON.stringify({
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
  }));

  // Future: forward to an external error-tracking service.
  // Example with Sentry:
  //   const Sentry = await import("@sentry/nextjs");
  //   Sentry.captureException(error, { extra: { request, context } });
}
