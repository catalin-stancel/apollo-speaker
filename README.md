# Apollo — product site

Single-page product site for the **Apollo** active two-way monitor (YellowGrid audio lab).
The page is fully self-contained: `public/index.html` inlines three.js and every image as a
data URI, so it makes **zero external requests** and needs no build step to serve.

## Deploy on Render (static site)

**Dashboard route (recommended):**
1. Render → **New → Static Site** → connect this repo (`catalin-stancel/apollo-speaker`).
2. **Publish directory:** `public`
3. **Build command:** leave empty.
4. Create — served at `https://apollo-speaker.onrender.com` (free, on Render's CDN).

**Blueprint route (alternative):** `render.yaml` in the repo root defines the same static
service; use Render → **New → Blueprint** if you prefer.

This service is independent of the `gan-trading` web service (different repo, different
service, no shared disk or Blueprint) — deploying or changing it cannot affect that app.

## Regenerating the page

The page is built by `tools/build_site.js` (Node, no dependencies):

```bash
cd tools && node build_site.js
```

It writes the built HTML; copy the result to `public/index.html` and commit.
`tools/` is not part of the published site (only `public/` is served).
