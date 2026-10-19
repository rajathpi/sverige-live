"""Fetch the salary figures behind loner/ and write data/loner.json.

The page draws its default view (all sectors) from this snapshot without calling SCB, and
fetches everything else live. Runs in GitHub Actions (see .github/workflows/loner-data.yml)
and locally with `python scripts/update_loner.py`. Standard library only; uses certifi's CA
bundle when it is installed.

Contents
  meta   occupation, group and sector names in English and Swedish, years, SCB's notes
  occ    per occupation: [sex][measure][year] monthly kronor, for the "all sectors" sector
  emp    employees per occupation in the latest year
Sources
  SCB salary structure statistics, PxWebApi 2.0: TAB4265 (2014-2022), TAB5932 (2023-),
  TAB5709 (occupation groups), TAB4263/TAB5841 (employees)
"""
from __future__ import annotations

import json
import sys
import time
import urllib.parse
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from update_economy import SCB, get  # noqa: E402  (shares the retrying fetch and the CA bundle)

OUT = Path(__file__).resolve().parent.parent / "data" / "loner.json"
SECTOR = "0"
SEXES = ["1+2", "2", "1"]
MEASURES = ["avg", "med", "p10", "p25", "p75", "p90"]
DISP = {
    "TAB4265": dict(zip(MEASURES, ["000000C5", "000000C6", "000000C7", "000000C8", "000000C9", "000000CA"])),
    "TAB5932": dict(zip(MEASURES, ["000007CD", "000007CE", "000007CF", "000007CG", "000007CH", "000007CI"])),
}
EMP = {"TAB4263": "000000BX", "TAB5841": "000007BE"}
NEW_FROM = 2023
NOT_OCC = {"0000", "0001", "0002"}


def scb_data(table: str, sel: dict[str, list[str]], lang: str = "en") -> dict:
    q = {f"valueCodes[{k}]": ",".join(v) for k, v in sel.items()}
    q.update({"lang": lang, "outputFormat": "json-stat2"})
    time.sleep(0.5)  # SCB allows 30 calls per 10 s per address
    return get(f"{SCB}/{table}/data?" + urllib.parse.urlencode(q, safe="()[]*,"))


def scb_meta(table: str, lang: str) -> dict:
    time.sleep(0.5)
    return get(f"{SCB}/{table}/metadata?lang={lang}")


class Cube:
    """Index into a json-stat2 answer by dimension codes."""

    def __init__(self, js: dict):
        self.ids, self.v = js["id"], js["value"]
        self.idx = []
        for i in self.ids:
            x = js["dimension"][i]["category"]["index"]
            self.idx.append({c: n for n, c in enumerate(x)} if isinstance(x, list) else x)
        self.stride, s = [0] * len(self.ids), 1
        for k in range(len(self.ids) - 1, -1, -1):
            self.stride[k], s = s, s * js["size"][k]

    def codes(self, dim: str) -> list[str]:
        x = self.idx[self.ids.index(dim)]
        return sorted(x, key=x.get)

    def get(self, **o) -> float | None:
        i = 0
        for k, d in enumerate(self.ids):
            n = self.idx[k].get(o[d]) if d in o else 0
            if n is None:
                return None
            i += n * self.stride[k]
        return self.v[i]


def main() -> int:
    en, sv = scb_meta("TAB5932", "en"), scb_meta("TAB5932", "sv")
    gen, gsv = scb_meta("TAB5709", "en"), scb_meta("TAB5709", "sv")
    lab = lambda m, d: m["dimension"][d]["category"]["label"]  # noqa: E731
    secs = lambda m: [[k, m["dimension"]["Sektor"]["category"]["label"][k]] for k in sorted(m["dimension"]["Sektor"]["category"]["index"], key=m["dimension"]["Sektor"]["category"]["index"].get)]  # noqa: E731
    new_years = sorted(int(y) for y in en["dimension"]["Tid"]["category"]["index"])
    years = list(range(2014, NEW_FROM)) + new_years
    occ_codes = [c for c in lab(en, "Yrke2012") if c not in NOT_OCC]

    occ: dict[str, list] = {c: [[[None] * len(years) for _ in MEASURES] for _ in SEXES] for c in ["0000", *occ_codes]}
    for table, cc in DISP.items():
        cb = Cube(scb_data(table, {"Sektor": [SECTOR], "Yrke2012": ["*"], "Kon": SEXES, "ContentsCode": list(cc.values()), "Tid": ["*"]}))
        for y in cb.codes("Tid"):
            yi = years.index(int(y))
            for c in occ:
                for si, s in enumerate(SEXES):
                    for mi, m in enumerate(MEASURES):
                        v = cb.get(Sektor=SECTOR, Yrke2012=c, Kon=s, ContentsCode=cc[m], Tid=y)
                        if v is not None:
                            occ[c][si][mi][yi] = round(v)
    occ = {c: v for c, v in occ.items() if any(x is not None for sx in v for m in sx for x in m)}

    last = years[-1]
    table = "TAB5841" if last >= NEW_FROM else "TAB4263"
    cb = Cube(scb_data(table, {"Sektor": [SECTOR], "Yrke2012": ["*"], "Kon": ["1+2"], "UtbildningsNiva": ["TOTALT"], "ContentsCode": [EMP[table]], "Tid": [str(last)]}))
    emp = {c: round(v) for c in occ if (v := cb.get(Sektor=SECTOR, Yrke2012=c, Kon="1+2", UtbildningsNiva="TOTALT", ContentsCode=EMP[table], Tid=str(last))) is not None}

    out = {
        "generated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "updated": en.get("updated"),
        "sector": SECTOR, "sexes": SEXES, "measures": MEASURES, "years": years, "empYear": last,
        "meta": {
            "occ": {"en": lab(en, "Yrke2012"), "sv": lab(sv, "Yrke2012")},
            "grp": {"en": lab(gen, "Yrkesgrupp12"), "sv": lab(gsv, "Yrkesgrupp12")},
            "sec": {"en": secs(en), "sv": secs(sv)},
            "notes": {"en": en.get("note") or [], "sv": sv.get("note") or []},
        },
        "occ": occ, "emp": emp,
    }
    if OUT.exists():
        old = json.loads(OUT.read_text(encoding="utf-8"))
        if {k: v for k, v in old.items() if k != "generated"} == {k: v for k, v in out.items() if k != "generated"}:
            print("no new data; data/loner.json left unchanged")
            return 0
    OUT.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"wrote {OUT.name}: {len(occ) - 1} occupations, {years[0]}-{last}, {OUT.stat().st_size // 1024} KB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
