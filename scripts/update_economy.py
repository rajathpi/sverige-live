"""Fetch the economy series behind economy/ and write data/economy.json.

Runs in GitHub Actions on a schedule (see .github/workflows/update-data.yml) and
locally with `python scripts/update_economy.py`. Standard library only; uses
certifi's CA bundle when it is installed (Konjunkturinstitutet's certificate
chains to a root that some older system stores lack).

Sources
  SCB, Statistics Sweden   PxWebApi 2.0            CPIF, CPI, unemployment, house prices
  Sveriges Riksbank        SWEA API                policy rate, EUR/SEK
  Konjunkturinstitutet     PxWeb (KonjBar)         Economic Tendency Indicator, consumer confidence
  Sveriges Riksbank        calendar web page       dates of upcoming policy-rate decisions
"""
from __future__ import annotations

import calendar
import html
import json
import re
import ssl
import sys
import time
import urllib.parse
import urllib.request
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

try:
    import certifi
    CTX = ssl.create_default_context(cafile=certifi.where())
except ImportError:  # pragma: no cover
    CTX = ssl.create_default_context()

OUT = Path(__file__).resolve().parent.parent / "data" / "economy.json"
UA = {"User-Agent": "sverige-live/1.0 (+https://github.com/rajathpi/sverige-live)"}
SCB = "https://api.scb.se/ov0104/v2beta/api/v2/tables"
KI = "https://statistik.konj.se/PxWeb/api/v1/sv/KonjBar/indikatorer/Indikatorm.px"
RB = "https://api.riksbank.se/swea/v1/Observations"
RB_CAL = "https://www.riksbank.se/sv/press-och-publicerat/kalender/"


def get(url: str, data: bytes | None = None, tries: int = 3, raw: bool = False):
    headers = dict(UA)
    if data is not None:
        headers["Content-Type"] = "application/json"
    for i in range(tries):
        try:
            req = urllib.request.Request(url, data=data, headers=headers)
            with urllib.request.urlopen(req, context=CTX, timeout=40) as r:
                body = r.read()
                return body.decode("utf-8", "replace") if raw else json.loads(body)
        except Exception as e:  # noqa: BLE001 (network errors are retried, then raised)
            if i == tries - 1:
                raise RuntimeError(f"{url[:90]}: {e}") from e
            time.sleep(2 * (i + 1))


# ---------------------------------------------------------------- SCB
def scb(table: str, codes: dict[str, str], since: str) -> tuple[list, str | None]:
    """Return [[period, value], ...] and the table's last-updated timestamp."""
    q = {f"valueCodes[{k}]": v for k, v in codes.items()}
    q.update({"valueCodes[Tid]": f"from({since})", "lang": "en", "outputFormat": "json-stat2"})
    d = get(f"{SCB}/{table}/data?" + urllib.parse.urlencode(q, safe="()[]"))  # '+' must be sent as %2B
    periods = list(d["dimension"]["Tid"]["category"]["index"])
    vals = d["value"]
    return [[p, v] for p, v in zip(periods, vals) if v is not None], d.get("updated")


def period_to_iso(p: str) -> str:
    if "M" in p:
        y, m = p.split("M")
        return f"{y}-{m}"
    if "K" in p:
        y, q = p.split("K")
        return f"{y}-Q{q}"
    return p


# ---------------------------------------------------------------- Riksbank
def riksbank(series: str, since: str) -> list:
    rows = get(f"{RB}/{series}/{since}")
    return [[r["date"], r["value"]] for r in rows if r.get("value") is not None]


def riksbank_decisions() -> list[str]:
    """Upcoming 'Publicering av penningpolitiskt beslut' dates from the public calendar."""
    try:
        page = html.unescape(get(RB_CAL, raw=True))
    except Exception as e:  # noqa: BLE001
        print("warning: riksbank calendar:", e, file=sys.stderr)
        return []
    today = date.today().isoformat()
    found = set()
    for m in re.finditer(r"Publicering av penningpolitiskt beslut", page):
        window = page[m.start(): m.start() + 2500]
        for d in re.findall(r"(20\d\d-\d\d-\d\d)", window)[:1]:
            if d >= today:
                found.add(d)
    return sorted(found)


# ---------------------------------------------------------------- Konjunkturinstitutet (PxWeb v1, POST)
def ki(codes: list[str], since: str) -> tuple[dict, str | None]:
    meta = get(KI)
    per = next(v for v in meta["variables"] if v["code"] == "Period")["values"]
    per = [p for p in per if p >= since]
    body = {"query": [{"code": "Indikator", "selection": {"filter": "item", "values": codes}},
                      {"code": "Period", "selection": {"filter": "item", "values": per}}],
            "response": {"format": "json-stat2"}}
    d = get(KI, data=json.dumps(body).encode())
    ind = list(d["dimension"]["Indikator"]["category"]["index"])
    periods = list(d["dimension"]["Period"]["category"]["index"])
    vals = d["value"]
    out = {c: [] for c in ind}
    for i, c in enumerate(ind):
        for j, p in enumerate(periods):
            v = vals[i * len(periods) + j]
            if v is not None:
                out[c].append([period_to_iso(p), v])
    # the data response carries a 9999 placeholder; the folder listing has the real timestamp
    listing = get(KI.rsplit("/", 1)[0] + "/")
    upd = next((t.get("updated") for t in listing if t.get("id") == KI.rsplit("/", 1)[1]), None)
    return out, (upd + "Z") if upd and not upd.endswith("Z") else upd


# ---------------------------------------------------------------- helpers
def yoy(points: list, lag: int) -> list:
    return [[points[i][0], round((points[i][1] / points[i - lag][1] - 1) * 100, 1)] for i in range(lag, len(points))]


def add_months(d: date, n: int) -> date:
    m = d.month - 1 + n
    y, m = d.year + m // 12, m % 12 + 1
    return date(y, m, min(d.day, calendar.monthrange(y, m)[1]))


def expected_next(updated: str | None, months: int) -> str | None:
    """Same day-of-month as the last release, `months` later, moved off weekends. Marked as an estimate."""
    if not updated:
        return None
    d = datetime.fromisoformat(updated.replace("Z", "+00:00")).date()
    n = add_months(d, months)
    while n <= date.today():
        n = add_months(n, months)
    while n.weekday() >= 5:
        n += timedelta(days=1)
    return n.isoformat()


def monthly_last(points: list) -> list:
    """Daily series -> last observation per month."""
    last = {}
    for d, v in points:
        last[d[:7]] = v
    return [[k, v] for k, v in sorted(last.items())]


# ---------------------------------------------------------------- main
def main() -> int:
    since_m, since_q, since_d = "2000M01", "2000K1", "2000-01-01"
    out = {"generated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), "series": {}, "errors": []}
    S = out["series"]

    def guard(name, f):
        try:
            f()
        except Exception as e:  # noqa: BLE001 (keep the other series; record the failure)
            out["errors"].append(f"{name}: {e}")
            print(f"error: {name}: {e}", file=sys.stderr)

    def cpif():
        pts, upd = scb("TAB6590", {"ContentsCode": "000007ZM"}, since_m)
        S["cpif"] = {"label": "Inflation, CPIF", "unit": "%", "freq": "M", "target": 2.0, "updated": upd,
                     "next": expected_next(upd, 1), "nextExpected": True,
                     "source": "SCB, CPIF annual change (TAB6590)", "url": "https://www.scb.se/en/finding-statistics/statistics-by-subject-area/prices-and-consumption/consumer-price-index/",
                     "points": [[period_to_iso(p), v] for p, v in pts]}

    def cpi():
        pts, upd = scb("TAB6596", {"ContentsCode": "00000804"}, since_m)
        S["cpi"] = {"label": "Inflation, CPI", "unit": "%", "freq": "M", "updated": upd, "next": expected_next(upd, 1), "nextExpected": True,
                    "source": "SCB, CPI annual change (TAB6596)", "url": "https://www.scb.se/en/finding-statistics/statistics-by-subject-area/prices-and-consumption/consumer-price-index/",
                    "points": [[period_to_iso(p), v] for p, v in pts]}

    def unemployment():
        pts, upd = scb("TAB6387", {"Arbetskraftstillh": "ALÖSP", "TypData": "SR_DATA", "Kon": "1+2", "Alder": "tot15-74", "ContentsCode": "000007L9"}, "2001M01")  # series starts 2001
        S["unemployment"] = {"label": "Unemployment rate", "unit": "%", "freq": "M", "updated": upd, "next": expected_next(upd, 1), "nextExpected": True,
                             "source": "SCB, Labour Force Survey, 15–74, seasonally adjusted (TAB6387)", "url": "https://www.scb.se/en/finding-statistics/statistics-by-subject-area/labour-market/labour-force-surveys/labour-force-surveys-lfs/",
                             "points": [[period_to_iso(p), v] for p, v in pts]}
        trend, _ = scb("TAB6387", {"Arbetskraftstillh": "ALÖSP", "TypData": "TC_DATA", "Kon": "1+2", "Alder": "tot15-74", "ContentsCode": "000007L9"}, "2001M01")
        S["unemployment"]["trend"] = [[period_to_iso(p), v] for p, v in trend]

    def houses():
        regions = {"00": "Sweden", "0010": "Greater Stockholm", "0020": "Greater Gothenburg", "0030": "Greater Malmö"}
        S["houses"] = {"label": "House prices", "unit": "% y/y", "freq": "Q", "regions": {}, "source": "SCB, Real estate price index, one- and two-dwelling buildings (TAB1150)",
                       "url": "https://www.scb.se/en/finding-statistics/statistics-by-subject-area/housing-construction-and-building/real-estate-prices-and-registrations-of-title/"}
        for code, name in regions.items():
            pts, upd = scb("TAB1150", {"Region": code, "ContentsCode": "BO0501K2"}, since_q)
            S["houses"]["regions"][name] = {"index": [[period_to_iso(p), v] for p, v in pts], "yoy": [[period_to_iso(p), v] for p, v in yoy(pts, 4)]}
            S["houses"]["updated"] = upd
        S["houses"]["next"] = expected_next(S["houses"].get("updated"), 3)
        S["houses"]["nextExpected"] = True

    def policy():
        pts = riksbank("SECBREPOEFF", since_d)
        changes = [pts[0]] + [p for i, p in enumerate(pts[1:], 1) if p[1] != pts[i - 1][1]]
        S["policy"] = {"label": "Policy rate", "unit": "%", "freq": "D", "updated": pts[-1][0], "latest": pts[-1],
                       "monthly": monthly_last(pts), "changes": changes, "next": None, "nextExpected": False,
                       "source": "Sveriges Riksbank, policy rate (SECBREPOEFF)", "url": "https://www.riksbank.se/en-gb/statistics/interest-rates-and-exchange-rates/policy-rate-deposit-and-lending-rate/"}
        dec = riksbank_decisions()
        S["policy"]["decisions"] = dec
        S["policy"]["next"] = dec[0] if dec else None

    def eursek():
        pts = riksbank("SEKEURPMI", (date.today() - timedelta(days=800)).isoformat())
        S["eursek"] = {"label": "EUR/SEK", "unit": "SEK", "freq": "D", "updated": pts[-1][0], "points": pts, "next": None,
                       "source": "Sveriges Riksbank, EUR/SEK fixing (SEKEURPMI)", "url": "https://www.riksbank.se/en-gb/statistics/interest-rates-and-exchange-rates/"}

    def ki_series():
        data, upd = ki(["KIFI", "bhus"], "2000M01")
        common = {"freq": "M", "updated": upd, "next": expected_next(upd, 1), "nextExpected": True, "url": "https://www.konj.se/english/publications/economic-tendency-survey.html"}
        S["barometer"] = {"label": "Economic Tendency Indicator", "unit": "index (100 = normal)", "points": data.get("KIFI", []),
                          "source": "Konjunkturinstitutet, Barometerindikatorn", **common}
        S["consumers"] = {"label": "Consumer confidence", "unit": "index (100 = normal)", "points": data.get("bhus", []),
                          "source": "Konjunkturinstitutet, Konfidensindikator hushåll", **common}

    for name, f in [("cpif", cpif), ("cpi", cpi), ("unemployment", unemployment), ("houses", houses),
                    ("policy", policy), ("eursek", eursek), ("ki", ki_series)]:
        guard(name, f)

    # keep the last good copy of any series that failed this run
    if OUT.exists() and out["errors"]:
        prev = json.loads(OUT.read_text(encoding="utf-8")).get("series", {})
        for k, v in prev.items():
            S.setdefault(k, {**v, "stale": True})

    OUT.parent.mkdir(parents=True, exist_ok=True)
    if OUT.exists():
        prev = json.loads(OUT.read_text(encoding="utf-8"))
        if prev.get("series") == S and prev.get("errors") == out["errors"]:
            print("no new data; data/economy.json left unchanged")
            return 0
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"wrote {OUT} with {len(S)} series, {len(out['errors'])} errors")
    for k, v in S.items():
        last = (v.get("points") or v.get("monthly") or next(iter(v.get("regions", {}).values()), {}).get("yoy") or [[None, None]])[-1]
        print(f"  {k:13} last {last}  next {v.get('next')}{' (expected)' if v.get('nextExpected') else ''}")
    return 1 if len(out["errors"]) == 7 else 0


if __name__ == "__main__":
    sys.exit(main())
