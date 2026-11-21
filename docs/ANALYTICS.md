# IndiaHealthInfo Analytics — Cloudflare Pages

This is an initial, privacy-conscious analytics implementation inspired by Wayhours. It keeps the public Next.js static export intact and uses Cloudflare Pages Functions for authentication and server-side PostHog reporting.

## Routes
- /admin/login/ — password login
- /admin/analytics/ — protected dashboard; Pages Functions middleware rejects unauthenticated requests
- /api/admin/login, /api/admin/session, /api/admin/logout, /api/admin/analytics — server-only APIs

## Required deployment configuration
In Cloudflare Pages > Settings > Variables and Secrets, configure **encrypted** ADMIN_PASSWORD, ADMIN_SESSION_SECRET (at least 32 random bytes), POSTHOG_PROJECT_ID, POSTHOG_PERSONAL_API_KEY (query:read). Optional POSTHOG_API_HOST defaults to https://us.posthog.com. Create a separate PostHog project for IndiaHealthInfo. Never commit credentials. Cloudflare Pages must deploy the functions/ directory alongside the static out/ directory; check your build/deployment integration supports Pages Functions. Without the server functions, the dashboard must NOT be considered secure. The middleware and API routes must be verified on the deployed domain before use.

## Current functionality and limitations
- Working password login with signed, expiring, HttpOnly Secure SameSite=Strict session cookie, server-side admin route guard and guarded API.
- Date filters: Today, Yesterday, 7/30/90 days (UTC), pageviews, unique visitor IDs, sessions, time series, country/referrer/page breakdown, CSV export, responsive navigation.
- If PostHog isn't configured, dashboard shows unavailable rather than invented metrics.
- Several sidebar modules are scaffolds based on the available pageview breakdowns, NOT complete implementations: realtime active sessions, newly published content, AI bots, visitor journeys, AI insights, scroll tracking, browser/OS/device detail, search engine attribution, new/returning cohorts, engagement and custom ranges. They must not be represented as complete or live.
- Tracking is NOT yet installed on public pages. PostHog will have no IndiaHealthInfo events until a consent-aware collector is added and configured.
- No precise visitor location or raw IP is stored by this implementation.
- Do not enable recording of medical conditions, searches containing health details, forms, or personal health data. Review privacy policy and consent before enabling any tracking.
- Pages Functions require Cloudflare Pages routing. A static-only host that ignores functions/ would expose the HTML without the middleware; verify the deployed environment.

## Deployment smoke tests
1. Unauthenticated GET /admin/analytics/ should redirect to /admin/login/ (302).
2. Unauthenticated GET /api/admin/analytics should return 401.
3. Wrong password should return 401. Correct password sets secure cookie.
4. Authenticated dashboard should load and show 'not connected' until PostHog is configured.
5. After PostHog setup, validate actual $pageview events and country/referrer breakdowns.
