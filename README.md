# janmikes.cz

Personal one-pager for [Jan Mikeš](https://janmikes.cz) — tech founder & engineer.

Hand-written static HTML. No framework, no build step, no tracking, no cookies.
One small script (assets/year.js) makes the activity band scrubbable; the page works without it. Fonts are self-hosted, so the site makes no third-party requests.

## Structure

```
index.html          home page
slides/index.html   talks and slides
assets/site.css     shared styles (tokens, light + dark)
assets/fonts/       Hanken Grotesk + JetBrains Mono (woff2, latin + latin-ext)
assets/             optimised portrait (WebP + JPEG) and OG image
favicon.svg         "J" with an accent háček
assets/year.js      scrubbing readout for the activity band
assets/talks/       title-slide thumbnails for the talks page
tools/activity.py   regenerates the GitHub activity band in index.html
.github/workflows/  deploy to Pages on push and daily (refreshes the band)
CNAME               custom domain: janmikes.cz
robots.txt          + sitemap.xml
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
