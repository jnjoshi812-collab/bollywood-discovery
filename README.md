# Bollywood Discovery — Railway deployment

## Why this exists

The Bollywood Discovery website (50 films, same design, same features) is
currently public on a Muse share link. That link serves the site inside a
frame, so Google Search Console cannot find the verification tag and Google
cannot crawl the page properly. On Railway the HTML is served directly, so
verification, the sitemap and indexing work normally.

## What's inside

- `deployment/public/index.html` — the site (verification tag + SEO
  description + Open Graph tags already in the `<head>`)
- `deployment/public/assets/` — the 50 film posters
- `deployment/server/index.ts` — tiny Bun server: serves the site, generates
  `/sitemap.xml` from the live URL, answers `/healthz`
- `deployment/Dockerfile`, `railway.json` — Railway config (Dockerfile
  builder, `/healthz` healthcheck)
- No database, no accounts, no secrets, no environment variables needed.

## Deploy on Railway

1. Extract this ZIP and push the folder to a GitHub repo.
2. Railway → New Project → Deploy from GitHub repo (pick the repo).
   The Dockerfile is auto-detected via `railway.json`.
3. No Volume needed (nothing is stored — the site is static files).
   No env vars needed.
4. Wait for the deploy, then open the URL:
   `https://<your-service>.up.railway.app`
5. Check: home page loads; `/healthz` returns `{"ok":true,...}`;
   `/sitemap.xml` lists your live URL; view-source shows the
   `google-site-verification` tag in the `<head>`.

## Cost — read before deploying

Railway starts with a free trial credit. A tiny static site like this uses
very little, but Railway is a pay-as-you-go service — check the plan and
usage in your Railway dashboard before going beyond the trial. Nothing in
this package creates a charge by itself; deploying is your decision on your
own Railway account. If you'd rather use a free static host (Netlify /
Vercel drag-drop), the `deployment/public/` folder works there too — but the
sitemap then needs its URL filled in after deploy (the Railway server
generates it automatically).

## After deploy — Search Console (new URL)

1. In Search Console, add a property for the NEW Railway URL (URL prefix,
   the exact URL).
2. Choose HTML tag verification — the tag is already in the page — click
   Verify. It should pass now that the HTML is served directly.
3. Sitemaps → submit `<new-url>/sitemap.xml`.
4. URL Inspection → paste the new URL → Request indexing.
5. Indexing takes days to weeks; ranking for "Bollywood Discovery" builds
   gradually with traffic and links. Do not expect it on day one.

## Notes

- The old Muse public link stays live and unchanged unless you decide
  otherwise. The new Railway URL becomes the one to tell Google about.
- The Docker image build was NOT verified while packaging (no Docker here)
  — Railway builds it on deploy. If the build fails there, send the error
  and it will be fixed.
- Weekly new-film updates: the Monday check still updates the Muse copy.
  After the move, new films need to reach the Railway copy too — say the
  word and that will be wired up (re-deploy with the updated files).
