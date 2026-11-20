# IndiaHealthInfo.com

An independent, **checklist-first medical travel information portal**, with no bookings, no clinical services.

## Included in Phase 1

- Responsive Next.js App Router homepage and original SVG heart-pulse logo
- Interactive 15-step travel checklist (country/treatment labels, browser-local progress, copy, print, reset)
- 5 curated informational guides with official-source references where applicable
- Treatments and destination landing pages
- About, editorial policy, disclaimer and privacy pages
- Static export, metadata, robots.txt and sitemap.xml
- GitHub Actions build pipeline

**Important:** Country and treatment selection personalize the checklist heading only at this stage. They are *not* an eligibility engine or medical risk evaluator. The site is informational, not an official or clinical service. Review legal/medical/immigration language before production.

## Run locally

Use Node.js 22+.

```bash
npm install
npm run dev
# http://localhost:3000
```

## Build a static site

```bash
npm run lint
npm run build
# ./out contains static HTML/CSS/JS
```

## Deployment

**Cloudflare Pages:** Connect this GitHub repository, select Next.js static export (or no framework preset), build command `npm run build`, output directory `out`, and a Node.js 22 runtime. Add `indiahealthinfo.com` as a custom domain. Cloudflare Pages handles HTTPS after domain/DNS validation.

**GitHub Pages:** Host the generated `out/` directory through a GitHub Actions Pages workflow. For a custom apex domain you must configure the DNS records and custom domain in Pages settings. This repository does not automatically publish to GitHub Pages.

## Content management

The initial editorial articles are in `lib/content.ts`. Later, migrate articles to MDX for independent editorial changes and a reviewed GitHub pull-request workflow. Do not automatically publish AI-generated medical content without qualified review.

## Before public launch

1. Have qualified reviewers audit medical content and your policies.
2. Confirm visa references, sources and claims against current official pages.
3. Add public editor contact details, corrections workflow and an appropriate privacy notice before introducing analytics or forms.
4. Configure DNS, hosting, HTTPS and Google Search Console.
5. Verify the site on mobile, audit accessibility and review SEO indexing.

No analytics, tracking cookies, API credentials, payments or back-end user accounts are included in Phase 1.
