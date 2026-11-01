"""Syntax-highlight new code blocks in place (Pygments, no runtime JS).

Write a block as <pre><code class="language-php">...</code></pre> (escaped HTML), then run:
    uv run --no-project --with pygments python tools/highlight.py slides/<slug>/index.html
Blocks that already contain <span> are left alone, so re-running is safe.
"""
import html
import re
import sys
from pathlib import Path

from pygments import highlight
from pygments.formatters import HtmlFormatter
from pygments.lexers import get_lexer_by_name

LABEL = {"php": "PHP", "yaml": "YAML", "neon": "NEON", "json": "JSON", "bash": "Shell", "console": "Shell",
         "docker": "Dockerfile", "xml": "XML", "sql": "SQL", "javascript": "JavaScript", "js": "JavaScript",
         "html-twig": "Twig", "twig": "Twig", "html": "HTML", "diff": "Diff", "mongodb": "MongoDB"}
LEXER = {"neon": "yaml", "html-twig": "html+twig", "twig": "html+twig", "mongodb": "javascript"}
FMT = HtmlFormatter(nowrap=True)
BLOCK = re.compile(r'<pre(?: data-lang="[^"]*")?><code class="language-([\w-]+)">(.*?)</code></pre>', re.S)


def render(lang, code):
    opts = dict(stripnl=False, ensurenl=True)
    lexer = LEXER.get(lang, lang)
    if lexer == "php":
        opts["startinline"] = "<?php" not in code
    out = highlight(code, get_lexer_by_name(lexer, **opts), FMT)
    if not code.endswith("\n"):
        out = out.rstrip("\n")
    out = re.sub(r'<span class="w">(\s*)</span>', r"\1", out)
    # Pygments' PHP lexer tags some statement keywords as attributes (Name.Decorator)
    out = re.sub(r'<span class="nd">(if|return|try|catch|foreach|throw|echo)</span>', r'<span class="k">\1</span>', out)
    return f'<pre data-lang="{LABEL.get(lang, lang.upper())}"><code class="language-{lang}">{out}</code></pre>'


for path in map(Path, sys.argv[1:]):
    doc, count = path.read_text(), 0

    def sub(m):
        global count
        if "<span" in m.group(2):
            return m.group(0)
        count += 1
        return render(m.group(1), html.unescape(m.group(2)))

    new = BLOCK.sub(sub, doc)
    if new != doc:
        path.write_text(new)
    print(f"{path}: {count} block(s) highlighted")
