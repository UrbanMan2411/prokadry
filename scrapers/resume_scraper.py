#!/usr/bin/env python3
"""
Scrape resume cards/details from hh.ru and Avito with Scrapling and export
normalized records for the Prisma importer.

Examples:
  python scrapers/resume_scraper.py --source avito --query "специалист по закупкам" --limit 50 --out data/imports/avito.jsonl --fetcher stealthy
  python scrapers/resume_scraper.py --source hh --query "специалист по закупкам" --limit 50 --out data/imports/hh.jsonl --fetcher stealthy
  python scrapers/resume_scraper.py --source avito --query "контрактный управляющий" --limit 50 --out data/imports/avito2.jsonl --fetcher stealthy --headful
"""

from __future__ import annotations

import argparse
import json
import os
import random
import re
import sys
import time
from dataclasses import asdict, dataclass
from datetime import date
from pathlib import Path
from typing import Iterable
from urllib.parse import quote_plus, urljoin

# Set playwright browsers path so patchright finds installed Chromium
_BROWSERS_PATH = os.path.join(os.environ.get("LOCALAPPDATA", ""), "ms-playwright")
if not os.path.isdir(_BROWSERS_PATH):
    _BROWSERS_PATH = r"C:\playwright-browsers"
if os.path.isdir(_BROWSERS_PATH):
    os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", _BROWSERS_PATH)

try:
    from scrapling.fetchers import DynamicFetcher, Fetcher, StealthyFetcher
except ImportError as exc:
    raise SystemExit(
        "Scrapling is not installed. Run: pip install 'scrapling[all]'"
    ) from exc


AVITO_BASE = "https://www.avito.ru"
AVITO_SEARCH = f"{AVITO_BASE}/rossiya/vakansii_i_rezume/rezume"
HH_BASE = "https://hh.ru"
HH_SEARCH = f"{HH_BASE}/search/resume"

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

CITY_REGION = {
    "Москва": "Москва",
    "Санкт-Петербург": "Санкт-Петербург",
    "Казань": "Республика Татарстан",
    "Набережные Челны": "Республика Татарстан",
    "Новосибирск": "Новосибирская область",
    "Екатеринбург": "Свердловская область",
    "Краснодар": "Краснодарский край",
    "Нижний Новгород": "Нижегородская область",
    "Ростов-на-Дону": "Ростовская область",
    "Самара": "Самарская область",
    "Уфа": "Республика Башкортостан",
    "Красноярск": "Красноярский край",
    "Пермь": "Пермский край",
    "Воронеж": "Воронежская область",
    "Иркутск": "Иркутская область",
    "Владивосток": "Приморский край",
    "Тюмень": "Тюменская область",
    "Омск": "Омская область",
    "Челябинск": "Челябинская область",
    "Саратов": "Саратовская область",
}


@dataclass
class ResumeRecord:
    source: str
    sourceId: str
    firstName: str
    lastName: str
    patronymic: str | None
    gender: str
    birthDate: str
    position: str
    city: str
    region: str
    salaryFrom: int | None
    experienceYears: int
    education: str
    workMode: str
    about: str
    workExperiences: list[dict]


def clean_text(value: object | None) -> str:
    if value is None:
        return ""
    return re.sub(r"\s+", " ", str(value)).strip()


def selector_text(node: object, *selectors: str) -> str:
    for selector in selectors:
        try:
            value = node.css(selector).get()
        except Exception:
            value = None
        value = clean_text(value)
        if value:
            return value
    return ""


def selector_all_text(node: object, *selectors: str) -> list[str]:
    out: list[str] = []
    for selector in selectors:
        try:
            values = node.css(selector).getall()
        except Exception:
            values = []
        for value in values:
            text = clean_text(value)
            if text and text not in out:
                out.append(text)
    return out


def _accept_avito_cookies(page: object) -> None:
    """page_action callback: accept Avito cookie consent if shown."""
    try:
        btn = page.query_selector('[data-marker="cookie-alert/button"]')
        if btn:
            btn.click()
            page.wait_for_timeout(1000)
    except Exception:
        pass


def _accept_hh_cookies(page: object) -> None:
    """page_action callback: accept hh.ru cookie consent if shown."""
    try:
        for sel in ['[data-qa="cookie-agreement-button"]', 'button[class*="cookie"]']:
            btn = page.query_selector(sel)
            if btn:
                btn.click()
                page.wait_for_timeout(1000)
                break
    except Exception:
        pass


def _build_stealthy_kwargs(source: str, headless: bool, use_chrome: bool) -> dict:
    kwargs: dict = {
        "headless": headless,
        "network_idle": True,
        "block_ads": True,
        "locale": "ru-RU",
        "timezone_id": "Europe/Moscow",
        "retries": 2,
        "page_action": _accept_avito_cookies if source == "avito" else _accept_hh_cookies,
    }
    if use_chrome and os.path.isfile(CHROME_PATH):
        kwargs["real_chrome"] = True
        kwargs["executable_path"] = CHROME_PATH
    return kwargs


def fetch_page(url: str, fetcher: str, *, source: str, headless: bool, wait: float, use_chrome: bool = False):
    if wait > 0:
        time.sleep(wait + random.random() * 0.5)

    if fetcher == "fetch":
        return Fetcher.get(url, impersonate="chrome", stealthy_headers=True)

    if fetcher == "dynamic":
        return DynamicFetcher.fetch(
            url,
            headless=headless,
            network_idle=True,
            block_ads=True,
            locale="ru-RU",
            page_action=_accept_avito_cookies if source == "avito" else _accept_hh_cookies,
            **({"executable_path": CHROME_PATH} if use_chrome and os.path.isfile(CHROME_PATH) else {}),
        )

    if fetcher == "stealthy":
        return StealthyFetcher.fetch(url, **_build_stealthy_kwargs(source, headless, use_chrome))

    raise ValueError(f"Unknown fetcher: {fetcher}")


def parse_salary(text: str) -> int | None:
    match = re.search(r"(\d[\d\s]{2,})", text.replace("\xa0", " "))
    if not match:
        return None
    return int(re.sub(r"\D", "", match.group(1)))


def parse_experience_years(text: str) -> int:
    lower = text.lower()
    if "без опыта" in lower:
        return 0
    years = re.search(r"(\d+)\s*(?:лет|год|года)", lower)
    if years:
        return int(years.group(1))
    months = re.search(r"(\d+)\s*(?:месяц|месяца|месяцев)", lower)
    if months:
        return round(int(months.group(1)) / 12)
    return 0


def normalize_city(raw: str) -> str:
    city = clean_text(raw).split(",")[0].replace("Город", "").strip()
    return city or "Москва"


def fallback_name(source: str, source_id: str) -> tuple[str, str]:
    suffix = re.sub(r"\W+", "", source_id)[-8:] or str(abs(hash(source_id)))[-8:]
    return "Соискатель", f"{source}{suffix}"


def make_record(
    *,
    source: str,
    source_id: str,
    position: str,
    city: str,
    salary_text: str,
    experience_text: str,
    about: str,
    skills: Iterable[str],
    name_text: str = "",
) -> ResumeRecord:
    first_name, last_name = fallback_name(source, source_id)
    name_parts = [p for p in clean_text(name_text).split(" ") if p]
    if len(name_parts) >= 2:
        first_name, last_name = name_parts[1], name_parts[0]
    elif len(name_parts) == 1 and len(name_parts[0]) < 40:
        first_name = name_parts[0]

    city = normalize_city(city)
    skill_line = ", ".join(list(dict.fromkeys(clean_text(s) for s in skills if clean_text(s)))[:20])
    about_parts = [about]
    if skill_line:
        about_parts.append(f"Навыки: {skill_line}")

    return ResumeRecord(
        source=source,
        sourceId=source_id,
        firstName=first_name,
        lastName=last_name,
        patronymic=None,
        gender="MALE",
        birthDate=date(1985, 1, 1).isoformat(),
        position=position or "Специалист по закупкам",
        city=city,
        region=CITY_REGION.get(city, city),
        salaryFrom=parse_salary(salary_text),
        experienceYears=parse_experience_years(experience_text or about),
        education="higher",
        workMode="office",
        about="\n\n".join(p for p in about_parts if p)[:5000],
        workExperiences=[],
    )


def avito_search_url(query: str, page: int) -> str:
    params = f"q={quote_plus(query)}"
    if page > 1:
        params += f"&p={page}"
    return f"{AVITO_SEARCH}?{params}"


def hh_search_url(query: str, page: int) -> str:
    return f"{HH_SEARCH}?text={quote_plus(query)}&area=113&page={page - 1}"


def extract_avito_cards(page: object) -> list[dict]:
    cards = []
    # Try multiple selector strategies
    for item_sel in [
        '[data-marker="item"]',
        'article[data-item-id]',
        '[class*="iva-item-root"]',
        '[class*="item-root_"]',
        'div[data-item-id]',
    ]:
        try:
            nodes = page.css(item_sel)
        except Exception:
            nodes = []
        for node in nodes:
            href = selector_text(
                node,
                'a[href*="/vakansii_i_rezume/"]::attr(href)',
                'a[href*="/rezume/"]::attr(href)',
                'a::attr(href)',
            )
            title = selector_text(
                node,
                '[data-marker="item-title"]::text',
                '[itemprop="name"]::text',
                "h3::text",
                "h2::text",
            )
            if not href or not title:
                continue
            source_id = (
                selector_text(node, "::attr(data-item-id)")
                or selector_text(node, "article::attr(data-item-id)")
                or href.rstrip("/").split("_")[-1].split("?")[0]
            )
            cards.append({
                "source_id": source_id,
                "url": urljoin(AVITO_BASE, href),
                "title": title,
                "city": selector_text(node, '[data-marker="item-location"]::text', '[class*="geo"]::text'),
                "salary": selector_text(node, '[data-marker="item-price"]::text', '[class*="price"]::text'),
            })
        if cards:
            break
    return dedupe_by_url(cards)


def extract_hh_cards(page: object) -> list[dict]:
    cards = []
    for selector in [
        '[data-qa="resume-serp__resume"]',
        '[data-qa*="resume"]',
        ".resume-search-item",
        '[class*="resumeCard"]',
    ]:
        try:
            nodes = page.css(selector)
        except Exception:
            nodes = []
        for node in nodes:
            href = selector_text(node, 'a[href*="/resume/"]::attr(href)', "a::attr(href)")
            title = selector_text(
                node,
                '[data-qa="resume-serp__resume-title"]::text',
                '[data-qa*="resume-title"]::text',
                "h3::text",
                "a::text",
            )
            if not href or not title:
                continue
            source_id = href.rstrip("/").split("/")[-1].split("?")[0]
            cards.append({
                "source_id": source_id,
                "url": urljoin(HH_BASE, href),
                "title": title,
                "city": selector_text(
                    node,
                    '[data-qa="resume-serp__resume-address"]::text',
                    '[data-qa*="address"]::text',
                ),
                "salary": selector_text(
                    node,
                    '[data-qa="resume-serp__resume-compensation"]::text',
                    '[data-qa*="salary"]::text',
                ),
            })
        if cards:
            break
    return dedupe_by_url(cards)


def dedupe_by_url(cards: list[dict]) -> list[dict]:
    seen: set[str] = set()
    out: list[dict] = []
    for card in cards:
        key = card["url"]
        if key in seen:
            continue
        seen.add(key)
        out.append(card)
    return out


def parse_avito_detail(page: object, card: dict) -> ResumeRecord:
    position = (
        selector_text(page, '[data-marker="page-title/title"]::text', "h1::text")
        or card["title"]
    )
    city = (
        selector_text(
            page,
            '[data-marker="delivery-location"]::text',
            '[itemprop="addressLocality"]::text',
        )
        or card["city"]
    )
    salary = (
        selector_text(page, '[data-marker="price-value"]::text', '[itemprop="price"]::text')
        or card["salary"]
    )
    about = selector_text(
        page,
        '[data-marker="item-description/text"]::text',
        '[itemprop="description"]::text',
        '[class*="description"]::text',
    )
    skills = selector_all_text(
        page,
        '[data-marker*="tag"]::text',
        '[class*="params"]::text',
        '[class*="tag"]::text',
    )
    return make_record(
        source="avito",
        source_id=card["source_id"],
        position=position,
        city=city,
        salary_text=salary,
        experience_text=about,
        about=about,
        skills=skills,
    )


def parse_hh_detail(page: object, card: dict) -> ResumeRecord:
    position = (
        selector_text(page, '[data-qa="resume-block-title-position"]::text', "h1::text")
        or card["title"]
    )
    name = selector_text(
        page,
        '[data-qa="resume-personal-name"]::text',
        '[data-qa*="resume-personal"]::text',
    )
    city = (
        selector_text(
            page,
            '[data-qa="resume-personal-address"]::text',
            '[data-qa*="address"]::text',
        )
        or card["city"]
    )
    salary = (
        selector_text(page, '[data-qa="resume-block-salary"]::text', '[data-qa*="salary"]::text')
        or card["salary"]
    )
    experience = selector_text(
        page,
        '[data-qa="resume-block-experience"]::text',
        '[data-qa*="experience"]::text',
    )
    about = selector_text(
        page,
        '[data-qa="resume-block-skills-content"]::text',
        '[data-qa="resume-block-about"]::text',
    )
    skills = selector_all_text(
        page,
        '[data-qa="bloko-tag__text"]::text',
        '[data-qa*="skill"]::text',
    )
    return make_record(
        source="hh",
        source_id=card["source_id"],
        position=position,
        city=city,
        salary_text=salary,
        experience_text=experience,
        about=about,
        skills=skills,
        name_text=name,
    )


def collect(
    source: str,
    query: str,
    limit: int,
    fetcher: str,
    headless: bool,
    wait: float,
    use_chrome: bool,
) -> list[ResumeRecord]:
    records: list[ResumeRecord] = []
    page_no = 1
    while len(records) < limit and page_no <= 10:
        search_url = avito_search_url(query, page_no) if source == "avito" else hh_search_url(query, page_no)
        print(f"[scrape] search page {page_no}: {search_url}", file=sys.stderr)
        try:
            search_page = fetch_page(
                search_url, fetcher,
                source=source, headless=headless,
                wait=wait if page_no > 1 else 0,
                use_chrome=use_chrome,
            )
        except Exception as exc:
            print(f"[scrape] search page error: {exc}", file=sys.stderr)
            break

        cards = extract_avito_cards(search_page) if source == "avito" else extract_hh_cards(search_page)
        print(f"[scrape] found {len(cards)} cards on page {page_no}", file=sys.stderr)
        if not cards:
            break

        for card in cards:
            if len(records) >= limit:
                break
            try:
                print(f"[scrape] detail {card['url']}", file=sys.stderr)
                detail_page = fetch_page(
                    card["url"], fetcher,
                    source=source, headless=headless,
                    wait=wait, use_chrome=use_chrome,
                )
                record = (
                    parse_avito_detail(detail_page, card)
                    if source == "avito"
                    else parse_hh_detail(detail_page, card)
                )
                records.append(record)
            except Exception as exc:
                print(f"[scrape] skipped {card['url']}: {exc}", file=sys.stderr)
        page_no += 1
    return records


def write_jsonl(records: list[ResumeRecord], out: Path) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", encoding="utf-8") as fh:
        for record in records:
            fh.write(json.dumps(asdict(record), ensure_ascii=False) + "\n")


def main() -> int:
    parser = argparse.ArgumentParser(description="Scrape resumes with Scrapling and export JSONL.")
    parser.add_argument("--source", choices=["avito", "hh"], required=True)
    parser.add_argument("--query", required=True)
    parser.add_argument("--limit", type=int, default=50)
    parser.add_argument("--out", default="data/imports/resumes.jsonl")
    parser.add_argument("--fetcher", choices=["fetch", "dynamic", "stealthy"], default="stealthy")
    parser.add_argument("--headful", action="store_true", help="Show browser window.")
    parser.add_argument("--chrome", action="store_true", help="Use installed Chrome instead of patchright.")
    parser.add_argument("--wait", type=float, default=2.0, help="Delay between detail requests (seconds).")
    args = parser.parse_args()

    records = collect(
        source=args.source,
        query=args.query,
        limit=max(1, args.limit),
        fetcher=args.fetcher,
        headless=not args.headful,
        wait=max(0, args.wait),
        use_chrome=args.chrome,
    )
    write_jsonl(records, Path(args.out))
    result = {
        "source": args.source,
        "query": args.query,
        "exported": len(records),
        "out": args.out,
    }
    print(json.dumps(result, ensure_ascii=False))
    return 0 if records else 2


if __name__ == "__main__":
    raise SystemExit(main())
