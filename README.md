# janmikes.cz

Personal one-pager for [Jan Mikeš](https://janmikes.cz) — tech founder & engineer.

Hand-written static HTML. No framework, no build step, no tracking, no cookies.
Two small scripts: assets/glass.js draws the animated glass background, assets/year.js makes the activity band scrubbable. The page works without either. Fonts are self-hosted, so the site makes no third-party requests.

## Structure

```
index.html          home page (styles inline)
slides/index.html   talks and slides
assets/site.css     shared styles (tokens, light + dark)
assets/fonts/       Hanken Grotesk + JetBrains Mono (woff2, latin + latin-ext)
assets/             optimised portrait (WebP + JPEG) and OG image
favicon.svg         "J" with an accent háček
assets/year.js      scrubbing readout for the activity band
assets/glass.js     animated fluted-glass background (WebGL, decorative, ~7 KB)
assets/talks/       title-slide thumbnails for the talks page
tools/activity.py   regenerates the GitHub activity band in index.html
.github/workflows/  deploy to Pages on push and daily (refreshes the band)
CNAME               custom domain: janmikes.cz
robots.txt          + sitemap.xml (AI crawlers explicitly allowed)
llms.txt            plain-text summary for AI answer engines
```

## Local preview

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deployment

GitHub Pages, deployed by GitHub Actions (`.github/workflows/deploy.yml`) on every push to
`master` and once a day. Each run refreshes the "last 365 days" activity band from the GitHub
API before publishing, so it stays current without committing anything back.

To refresh the committed snapshot locally: `python3 tools/activity.py` (needs `gh auth login`).

The domain sits behind Cloudflare, which caches `assets/site.css`. After changing the CSS,
bump the `?v=` number on its `<link>` in both `index.html` and `slides/index.html`.

DNS for the apex domain should point at GitHub Pages:

```
A     janmikes.cz   185.199.108.153
A     janmikes.cz   185.199.109.153
A     janmikes.cz   185.199.110.153
A     janmikes.cz   185.199.111.153
```

## Licence

The repository keeps its original [Unlicense](LICENSE) (public domain) for the code.
The portrait photo is personal — please don't reuse that one.
