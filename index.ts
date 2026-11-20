// Minimal static server for Bollywood Discovery.
// Serves the site files from ./public, generates /sitemap.xml dynamically
// from the request's own origin (so it always lists the live URL),
// and answers /healthz for the Railway healthcheck.

import { join } from "node:path";

const PUBLIC_DIR = join(import.meta.dir, "..", "public");

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".xml": "application/xml",
};

function sitemapXml(origin: string) {
  const loc = origin.replace(/\/$/, "");
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `  <url><loc>${loc}/</loc></url>\n` +
    `</urlset>\n`
  );
}

const port = Number(process.env.PORT || 3000);

Bun.serve({
  port,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    if (path === "/healthz") {
      return new Response(
        JSON.stringify({ ok: true, service: "bollywood-discovery-static" }),
        { headers: { "content-type": "application/json" } }
      );
    }

    if (path === "/sitemap.xml") {
      const origin = process.env.SITE_URL || `${url.protocol}//${url.host}`;
      return new Response(sitemapXml(origin), {
        headers: { "content-type": "application/xml" },
      });
    }

    const filePath = path === "/" ? "/index.html" : path;
    const safe = join(PUBLIC_DIR, decodeURIComponent(filePath));
    if (!safe.startsWith(PUBLIC_DIR)) {
      return new Response("Not found", { status: 404 });
    }
    const file = Bun.file(safe);
    if (!(await file.exists())) {
      return new Response("Not found", { status: 404 });
    }
    const ext = safe.slice(safe.lastIndexOf(".")).toLowerCase();
    return new Response(file, {
      headers: { "content-type": MIME[ext] || "application/octet-stream" },
    });
  },
});

console.log(`bollywood-discovery-static listening on port ${port}`);
