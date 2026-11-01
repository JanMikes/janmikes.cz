# janmikes.cz

Static site, no build step. GitHub Pages deploys `master`; commit and push straight to it.

## Adding a talk (`slides/<slug>/index.html`)

- Copy an existing talk page as the template (meta line with venue/date, JSON-LD `@graph`, "Related talks" block).
- Slides go to `assets/talks/<slug>/NN.webp`, thumbnails to `assets/talks/<slug>.webp` (640×360) and `.jpg` (1200×675).
- Also update `slides/index.html`, `sitemap.xml` (`lastmod` = today) and `llms.txt`.
- Never publish secrets or customer data from slides: pixelate them.
- Cloudflare caches `assets/site.css`: when you change it, bump `?v=N` on every page.

## Code blocks: syntax highlighting

Highlighting is pre-rendered into the HTML with Pygments (no JS). The colours come from the `--hl-*` variables in `site.css`.
Write a new block as `<pre><code class="language-php">…escaped code…</code></pre>`, then run:

```
uv run --no-project --with pygments python tools/highlight.py slides/<slug>/index.html
```

It adds the token spans and the `data-lang` label. Already highlighted blocks are skipped.
Languages: php, yaml, neon, json, bash, console (`$` prompts + output), docker, xml, sql, javascript, twig, diff.
Leave ASCII diagrams and plain logs as `<pre>` with no `<code>`.
