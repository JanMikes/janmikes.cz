#!/usr/bin/env python3
"""Refresh the "last 12 months" GitHub activity strip in index.html.

Fetches the contribution calendar with the GitHub CLI (`gh auth login` first)
and rewrites everything between the activity markers in index.html.

    python3 tools/activity.py [github-login]
"""
import json
import math
import re
import subprocess
import sys
from pathlib import Path

LOGIN = sys.argv[1] if len(sys.argv) > 1 else "janmikes"
INDEX = Path(__file__).resolve().parent.parent / "index.html"

QUERY = """
query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar { weeks { contributionDays { date contributionCount } } }
    }
  }
}
"""

STEP, BAR, HEIGHT = 3, 1.6, 48


def fetch_days(login):
    out = subprocess.run(
        ["gh", "api", "graphql", "-f", f"query={QUERY}", "-f", f"login={login}"],
        check=True, capture_output=True, text=True,
    ).stdout
    weeks = json.loads(out)["data"]["user"]["contributionsCollection"]["contributionCalendar"]["weeks"]
    days = [d for w in weeks for d in w["contributionDays"]]
    return days[-365:]


def render(days):
    counts = [d["contributionCount"] for d in days]
    peak = max(counts) or 1
    busy = sorted(counts)[int(len(counts) * 0.9)]  # top 10% of days get the accent
    total, active = sum(counts), sum(1 for c in counts if c)
    summary = f"{total:,} contributions · active on {active} of {len(counts)} days"

    bars = []
    for i, (day, c) in enumerate(zip(days, counts)):
        x, data = i * STEP, f'data-d="{day["date"]}" data-c="{c}"'
        if c == 0:
            bars.append(f'<rect class="a0" x="{x}" y="{HEIGHT - 1}" width="{BAR}" height="1" {data}/>')
            continue
        h = max(2.0, HEIGHT * math.sqrt(c / peak))  # sqrt keeps quiet days visible
        cls = "a2" if c >= busy else "a1"
        bars.append(f'<rect class="{cls}" x="{x}" y="{HEIGHT - h:.1f}" width="{BAR}" height="{h:.1f}" {data}/>')

    return (
        f'<figcaption class="year__head"><span>last 365 days on <a href="https://github.com/{LOGIN}">GitHub</a></span>'
        f'<span class="year__readout" data-summary="{summary}">{summary}</span></figcaption>\n'
        f'          <svg class="pulse" viewBox="0 0 {len(counts) * STEP} {HEIGHT}" preserveAspectRatio="none" '
        f'role="img" aria-label="{total:,} GitHub contributions in the last 365 days, on {active} of them">'
        + "".join(bars) + "</svg>"
    )


def main():
    html = INDEX.read_text()
    block = render(fetch_days(LOGIN))
    new, n = re.subn(
        r"(<!-- activity:start -->).*?(<!-- activity:end -->)",
        lambda m: f"{m.group(1)}\n          {block}\n          {m.group(2)}",
        html, flags=re.S,
    )
    if n != 1:
        sys.exit("activity markers not found in index.html")
    INDEX.write_text(new)
    print("index.html: activity strip updated")


if __name__ == "__main__":
    main()
