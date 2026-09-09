# janmikes.cz

Personal one-pager for [Jan Mikeš](https://janmikes.cz) — tech founder & engineer.

Hand-written static HTML. No framework, no build step, no dependencies, no tracking,
no cookies. One file plus a few assets.

## Structure

```
index.html          the whole site (inline CSS, no JS)
assets/             optimised portrait (WebP + JPEG) and OG image
favicon.svg         terminal-prompt favicon
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
