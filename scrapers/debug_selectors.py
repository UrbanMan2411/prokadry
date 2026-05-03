#!/usr/bin/env python3
"""
Run this from your terminal to inspect actual page structure.
Usage:
  python scrapers/debug_selectors.py avito
  python scrapers/debug_selectors.py hh
"""
import os, sys, re
from collections import Counter

_bp = os.path.join(os.environ.get("LOCALAPPDATA", ""), "ms-playwright")
if not os.path.isdir(_bp): _bp = r"C:\playwright-browsers"
if os.path.isdir(_bp): os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", _bp)

from scrapling.fetchers import StealthyFetcher

source = sys.argv[1] if len(sys.argv) > 1 else "avito"

if source == "avito":
    url = "https://www.avito.ru/rossiya/vakansii_i_rezume/rezume?q=%D1%81%D0%BF%D0%B5%D1%86%D0%B8%D0%B0%D0%BB%D0%B8%D1%81%D1%82+%D0%BF%D0%BE+%D0%B7%D0%B0%D0%BA%D1%83%D0%BF%D0%BA%D0%B0%D0%BC"
else:
    url = "https://hh.ru/search/resume?text=%D1%81%D0%BF%D0%B5%D1%86%D0%B8%D0%B0%D0%BB%D0%B8%D1%81%D1%82+%D0%BF%D0%BE+%D0%B7%D0%B0%D0%BA%D1%83%D0%BF%D0%BA%D0%B0%D0%BC&area=113"

def accept_cookies(page):
    for sel in ['[data-marker="cookie-alert/button"]', '[data-qa="cookie-agreement-button"]', 'button[class*="cookie"]']:
        try:
            btn = page.query_selector(sel)
            if btn:
                btn.click()
                page.wait_for_timeout(1500)
                break
        except: pass

print(f"Fetching {url} ...", file=sys.stderr)
page = StealthyFetcher.fetch(url, headless=True, network_idle=True, block_ads=True, locale="ru-RU", page_action=accept_cookies)

out = sys.stdout.buffer

out.write(f"\n=== URL: {page.url} ===\n".encode())
out.write(f"Status: {page.status}\n\n".encode())

# Save full HTML for inspection
html_path = f"data/imports/debug_{source}.html"
os.makedirs("data/imports", exist_ok=True)

# Get all tags with their counts
all_tags = page.css("*")
tag_names = Counter()
data_attrs = Counter()
class_fragments = Counter()

for node in all_tags:
    try:
        tag = str(node)[:20]
        # Extract data-* attributes from the repr
    except: pass

# Use regex on the serialized page content
try:
    content = str(page.html) if hasattr(page, 'html') and page.html else ""
except: content = ""

if not content:
    # Try getting text of specific elements
    body_nodes = page.css("body")
    content = str(body_nodes[0]) if body_nodes else ""

out.write(f"Content length: {len(content)}\n\n".encode())

# Find data-marker attributes
markers = re.findall(r'data-marker=["\']([^"\']+)["\']', content)
out.write(b"=== data-marker values (top 20) ===\n")
for k, v in Counter(markers).most_common(20):
    out.write(f"  {v:3d}  {k}\n".encode())

# Find data-qa attributes
qa_attrs = re.findall(r'data-qa=["\']([^"\']+)["\']', content)
out.write(b"\n=== data-qa values (top 20) ===\n")
for k, v in Counter(qa_attrs).most_common(20):
    out.write(f"  {v:3d}  {k}\n".encode())

# CSS selector tests
out.write(b"\n=== CSS selector tests ===\n")
test_selectors = [
    '[data-marker="item"]',
    'article[data-item-id]',
    '[class*="iva-item"]',
    '[class*="item-root"]',
    '[class*="resumeCard"]',
    '[data-qa="resume-serp__resume"]',
    '[data-qa*="resume"]',
    'li[data-sentry-component]',
    'div[data-sentry-component]',
    '[class*="resume-search-item"]',
    'article',
    'li',
    'section',
]
for sel in test_selectors:
    try:
        nodes = page.css(sel)
        if nodes:
            first_text = nodes[0].get_all_text()[:60].replace('\n', ' ') if nodes else ''
            out.write(f"  FOUND {len(nodes):3d}  {sel}  →  {first_text}\n".encode('utf-8', errors='replace'))
    except Exception as e:
        out.write(f"  ERROR        {sel}: {e}\n".encode())

# Save HTML
if content:
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(content)
    out.write(f"\nHTML saved to {html_path} ({len(content)} chars)\n".encode())
else:
    out.write(b"\nNo HTML captured. Try --headful mode.\n")
