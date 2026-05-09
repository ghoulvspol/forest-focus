#!/usr/bin/env python3
"""Fetch the Artificial Analysis Intelligence Index.

Scrapes https://artificialanalysis.ai/ (no auth required), extracts the
per-model {label, vendor, intelligence, reasoning} tuples from the
Next.js App Router RSC payload, and caches to disk per day.

Output columns (text mode):
  Rank  Intelligence  R  Vendor       Model Name                AA URL

Where R = 'Y' if it's a reasoning model (thinks before answering → slower
first token), blank otherwise.
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import ssl
import subprocess
import sys
import urllib.error
import urllib.request
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

AA_URL = "https://artificialanalysis.ai/leaderboards/models"
CACHE_DIR = Path.home() / ".cache" / "mify-model-gateway"
USER_AGENT = "Mozilla/5.0 (mify-gateway-skill)"


def fetch_aa_html() -> str:
    """Fetch via curl first (uses system cert store / keychain), urllib as fallback.

    The macOS Python framework ships its own SSL store that is often out of
    sync with the system one, causing 'CERTIFICATE_VERIFY_FAILED' on perfectly
    normal HTTPS sites. curl follows the system store and just works.
    """
    curl = shutil.which("curl")
    if curl:
        try:
            out = subprocess.run(
                [curl, "-sSL", "--max-time", "30", "-A", USER_AGENT, AA_URL],
                check=True,
                capture_output=True,
                text=True,
            )
            return out.stdout
        except subprocess.CalledProcessError as e:
            last_curl_err = e.stderr.strip() or f"exit {e.returncode}"
    else:
        last_curl_err = "curl not found in PATH"

    # Fallback: urllib with default context
    try:
        req = urllib.request.Request(AA_URL, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except (urllib.error.URLError, ssl.SSLError) as e:
        raise RuntimeError(f"curl: {last_curl_err}; urllib: {e}") from e


def extract_models(html: str) -> list[dict]:
    """Pull full benchmark records out of the leaderboard RSC payload."""
    chunks = re.findall(r'self\.__next_f\.push\(\[\d+,\s*"(.+?)"\]\)', html, re.S)
    big = "".join(
        c.encode("utf-8").decode("unicode_escape", errors="ignore") for c in chunks
    )

    # Benchmark data record (leaderboard row). intelligenceIndex may be null for
    # models that haven't been scored yet — we drop those.
    pattern = re.compile(
        r'"id":"(?P<id>[^"]+)",'
        r'"name":"(?P<name>[^"]+)",'
        r'"shortName":"(?P<short>[^"]+)",'
        r'"slug":"(?P<slug>[^"]+)",'
        r'"releaseDate":"?(?P<release>[^",]*)"?,'
        r'"reasoningModel":(?P<reasoning>true|false),'
        r'"deprecated":(?P<deprecated>true|false),'
        r'"modelCreatorId":"[^"]+",'
        r'"modelCreatorName":"(?P<vendor>[^"]+)",'
        r'"modelCreatorSlug":"[^"]+",'
        r'"modelCreatorCountry":"(?P<country>[^"]*)",'
        r'"modelCreatorColor":"[^"]+",'
        r'"modelCreatorLogo":"[^"]+",'
        r'"intelligenceIndex":(?P<iq>null|[\d.]+),'
        r'"intelligenceIndexIsEstimated":(?P<estimated>true|false)'
    )

    # Optional extras that may or may not follow
    extras_pat = re.compile(
        r'"codingIndex":(?P<coding>null|[\d.]+),'
        r'"agenticIndex":(?P<agentic>null|[\d.]+)'
    )

    seen: dict[str, dict] = {}
    for m in pattern.finditer(big):
        if m.group("deprecated") == "true":
            continue
        if m.group("iq") == "null":
            continue

        mid = m.group("id")
        if mid in seen:
            continue

        # Look ahead up to 500 chars for coding/agentic indexes
        tail = big[m.end() : m.end() + 500]
        extras = extras_pat.search(tail)

        seen[mid] = {
            "id": mid,
            "slug": m.group("slug"),
            "name": m.group("name"),
            "label": m.group("short"),
            "vendor": m.group("vendor"),
            "country": m.group("country"),
            "release_date": m.group("release") or None,
            "reasoning": m.group("reasoning") == "true",
            "intelligence": float(m.group("iq")),
            "intelligence_estimated": m.group("estimated") == "true",
            "coding": (
                float(extras.group("coding"))
                if extras and extras.group("coding") != "null"
                else None
            ),
            "agentic": (
                float(extras.group("agentic"))
                if extras and extras.group("agentic") != "null"
                else None
            ),
            "url": f"https://artificialanalysis.ai/models/{m.group('slug')}",
        }

    return sorted(seen.values(), key=lambda x: -x["intelligence"])


def cache_file(d: date) -> Path:
    return CACHE_DIR / f"aa-{d.isoformat()}.json"


def load_or_fetch(refresh: bool) -> dict:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    today = date.today()
    cf = cache_file(today)

    if cf.exists() and not refresh:
        return json.loads(cf.read_text(encoding="utf-8"))

    try:
        html = fetch_aa_html()
    except (RuntimeError, urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as e:
        yesterday = cache_file(today - timedelta(days=1))
        if yesterday.exists():
            print(
                f"⚠ fetch failed ({e}); using yesterday's cache",
                file=sys.stderr,
            )
            return json.loads(yesterday.read_text(encoding="utf-8"))
        sys.exit(
            f"Cannot reach {AA_URL}: {e}\n"
            "If you're behind a corporate proxy, set HTTP_PROXY / HTTPS_PROXY and retry.\n"
            "No cached copy from yesterday either."
        )

    models = extract_models(html)
    if not models:
        sys.exit(
            "Fetched the page but could not extract any model rows.\n"
            "The page HTML structure may have changed — update the regex in extract_models()."
        )

    payload = {
        "fetched_at": datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
        "source": AA_URL,
        "models": models,
    }
    cf.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return payload


def print_table(models: list[dict]) -> None:
    if not models:
        print("No matches.")
        return

    vendor_w = max(len(m["vendor"]) for m in models) + 1
    name_w = max(len(m["label"]) for m in models) + 1

    print(
        f"{'#':>3}  {'IQ':>5}  R  {'Cty':<3}  "
        f"{'Vendor':<{vendor_w}}  {'Model':<{name_w}}  Released"
    )
    print("-" * (10 + 3 + vendor_w + name_w + 20))
    for i, m in enumerate(models, 1):
        r_flag = "Y" if m["reasoning"] else " "
        iq_str = f"{m['intelligence']:>5.1f}"
        if m["intelligence_estimated"]:
            iq_str = f"~{m['intelligence']:>4.1f}"
        country = (m.get("country") or "?").upper()[:3]
        release = (m.get("release_date") or "")[:10]
        print(
            f"{i:>3}  {iq_str}  {r_flag}  {country:<3}  "
            f"{m['vendor']:<{vendor_w}}  {m['label']:<{name_w}}  {release}"
        )


def main() -> None:
    p = argparse.ArgumentParser(
        description="Fetch Artificial Analysis Intelligence Index (cached daily).",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Examples:\n"
            "  fetch_aa_rankings.py --top 10               # today's top 10\n"
            "  fetch_aa_rankings.py --no-reasoning --top 5  # fastest first-token models\n"
            "  fetch_aa_rankings.py --json                 # raw JSON for programmatic use\n"
            "  fetch_aa_rankings.py --refresh              # bypass today's cache\n"
        ),
    )
    p.add_argument("--top", type=int, default=20, help="number of rows (default 20)")
    p.add_argument(
        "--no-reasoning",
        action="store_true",
        help="drop reasoning models (they think before replying → slower TTFT)",
    )
    p.add_argument(
        "--vendor",
        help="substring filter on vendor (Anthropic, OpenAI, Moonshot, ...)",
    )
    p.add_argument(
        "--country",
        help="filter by model creator country code (us, cn, fr, ...)",
    )
    p.add_argument("--refresh", action="store_true", help="bypass today's cache")
    p.add_argument("--json", action="store_true", help="emit raw JSON")
    args = p.parse_args()

    payload = load_or_fetch(args.refresh)
    models = payload["models"]

    if args.no_reasoning:
        models = [m for m in models if not m["reasoning"]]
    if args.vendor:
        v = args.vendor.lower()
        models = [m for m in models if v in m["vendor"].lower()]
    if args.country:
        c = args.country.lower()
        models = [m for m in models if (m.get("country") or "").lower() == c]

    models = models[: args.top]

    if args.json:
        print(json.dumps(
            {
                "fetched_at": payload["fetched_at"],
                "source": payload["source"],
                "models": models,
            },
            ensure_ascii=False,
            indent=2,
        ))
        return

    print(f"Source: {payload['source']}  Fetched: {payload['fetched_at']}\n")
    print_table(models)
    print(f"\n(Showing {len(models)} rows. R=Y means reasoning model — slower first token.)")


if __name__ == "__main__":
    main()
