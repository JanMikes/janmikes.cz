# janmikes.cz

Personal one-pager for [Jan Mikeš](https://janmikes.cz) — tech founder & engineer.

Hand-written static HTML. No framework, no build step, no JavaScript, no tracking,
no cookies. Fonts are self-hosted, so the site makes no third-party requests.

## Structure

```
index.html          home page
slides/index.html   talks and slides
assets/site.css     shared styles (tokens, light + dark)
assets/fonts/       Hanken Grotesk + JetBrains Mono (woff2, latin + latin-ext)
assets/             optimised portrait (WebP + JPEG) and OG image
favicon.svg         "J" with an accent háček
CNAME               custom domain: janmikes.cz
robots.txt          + sitemap.xml
```

## Local preview

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deployment

Served by GitHub Pages from the `master` branch, root directory.
Push to `master` and it goes live at <https://janmikes.cz>.

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
