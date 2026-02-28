# Error Handling in MistralHR

This document explains how errors are captured, logged, and displayed to users across the MistralHR application.

---

## Architecture Overview

```
┌──────────────────────────────────────────────┐
│  Server (RSC / API routes)                   │
│  ┌────────────────────────────────────────┐  │
│  │ instrumentation.ts → onRequestError()  │  │
│  │ Structured JSON logs with digest,      │  │
│  │ path, routeType, renderSource          │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│  Client (Browser)                            │
│  ┌────────────────────────────────────────┐  │
│  │ app/global-error.tsx  (root boundary)  │  │
│  │ app/error.tsx         (app boundary)   │  │
│  │ app/(protected)/error.tsx              │  │
│  │ Per-component try/catch (e.g. chat)    │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

## Error Boundaries

Next.js `error.tsx` files act as React Error Boundaries. Each catches unhandled errors thrown by child components and renders a fallback UI.

| File | Scope | Notes |
|------|-------|-------|
| `app/global-error.tsx` | Entire app (including root layout) | Must include its own `<html>` and `<body>` tags |
| `app/error.tsx` | Pages under root layout | Catches errors from `/login` and any future root-level pages |
| `app/(protected)/error.tsx` | Protected pages (`/chat`, `/policies`, …) | Shows "Try again" + "Go to Chat" actions |

### Error Digest

In production builds, Next.js replaces error messages with a generic string for security. Each error receives a unique **digest** (hash). The error boundaries display this digest so users can reference it when reporting issues, and the server-side logs include the same digest for correlation.

### Custom 404 Page

`app/not-found.tsx` provides a branded 404 page when users navigate to a route that does not exist.

## Server-Side Logging

### `instrumentation.ts`

The `onRequestError` hook runs on every unhandled server-side error (Server Components, API routes, middleware). It outputs structured JSON:

```json
{
  "level": "error",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "digest": "abc123",
  "message": "Connection refused",
  "method": "GET",
  "path": "/chat",
  "routerKind": "App Router",
  "routePath": "/chat",
  "routeType": "page",
  "renderSource": "react-server-components"
}
```

Log aggregators (Azure Monitor, Datadog, Splunk) can parse these structured logs for alerting and dashboards.

### API Route Error Handling

The `/api/chat` route handler already catches errors within the SSE stream and:

1. Logs them via `console.error("[Chat API] Error:", error)`
2. Falls back to demo responses when Mistral or DB calls fail
3. Sends a client-visible error event via the SSE stream

## Client-Side Error Handling

### Chat Page (`app/(protected)/chat/page.tsx`)

The chat page wraps its streaming fetch in a `try/catch` block:

- **AbortError** — silently ignored (user cancelled)
- **Other errors** — displayed inline as a warning message (`⚠️ ...`)

This is an example of component-level error handling that supplements the error boundary.

## Adding External Error Reporting (e.g. Sentry)

To integrate a service like Sentry:

1. Install the SDK: `npm install @sentry/nextjs`
2. Update `instrumentation.ts` to initialise Sentry in the `register()` function
3. Forward errors in `onRequestError()`:
   ```ts
   const Sentry = await import("@sentry/nextjs");
   Sentry.captureException(error, { extra: { request, context } });
   ```
4. Add Sentry's browser SDK initialisation in `app/layout.tsx` or a client provider

## Conventions

- **Never expose stack traces or internal error messages to end-users in production.** Use the error digest for correlation.
- **Always log errors server-side with structured JSON** so they are parseable by log aggregators.
- **Error boundaries should provide actionable UI** — "Try again" buttons, links to safe routes.
- **Component-level try/catch** is appropriate for interactive features (e.g. streaming chat) where inline feedback is better than a full-page error.
