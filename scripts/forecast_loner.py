"""Forecast median monthly pay per occupation for the next three years and write data/loner-forecast.json.

Reads data/loner.json (written by update_loner.py). Swedish pay moves together because of the national
wage agreements, so each occupation's own recent growth is shrunk toward its occupation group's and the
national growth, and part of last year's jump above the national growth is expected to reverse
(single-year medians are noisy). The weights, the reversal and the uncertainty band are chosen by a rolling-origin backtest: the model
is fitted on data up to year T, forecasts T+1..T+3, and is scored against what SCB later published.
Weights are tuned on the earlier origins and reported on the later ones, which the tuning never saw.

Run: `python scripts/forecast_loner.py` (needs numpy).
"""
from __future__ import annotations

import itertools
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import numpy as np

DATA = Path(__file__).resolve().parent.parent / "data"
SRC, OUT = DATA / "loner.json", DATA / "loner-forecast.json"
H = 3                       # horizons, years ahead
WIN = 5                     # years of growth an estimate looks back over
LEVEL = 0.80                # central share of outcomes the band should hold
TUNE_ORIGINS = range(2019, 2022)
TEST_ORIGINS = range(2022, 2025)
MED = 1


def load():
    d = json.loads(SRC.read_text(encoding="utf-8"))
    years = d["years"]
    emp = d["emp"]
    series = {}  # (code, sex) -> log median per year, nan when missing
    for code, by_sex in d["occ"].items():
        for si, sex in enumerate(d["sexes"]):
            v = np.array([np.nan if x is None else float(x) for x in by_sex[si][MED]])
            if np.isfinite(v).sum() >= 4:
                series[(code, sex)] = np.log(v)
    return d, years, emp, series


def robust_growth(y: np.ndarray, t: int) -> float | None:
    """Median yearly log growth over the WIN years up to index t; the median shrugs off one-off recodes such as 2018's."""
    seg = y[max(0, t - WIN): t + 1]
    diffs = np.diff(seg)
    diffs = diffs[np.isfinite(diffs)]
    return float(np.median(diffs)) if len(diffs) >= 3 else None


def volatility(y: np.ndarray, nat: np.ndarray, t: int) -> float:
    """How far an occupation's yearly growth strays from the national growth (MAD-based), floored for stable jobs."""
    d = np.diff(y[: t + 1]) - np.diff(nat[: t + 1])
    d = d[np.isfinite(d)]
    if len(d) < 3:
        return 0.02
    return max(0.006, 1.4826 * float(np.median(np.abs(d - np.median(d)))))


class Model:
    def __init__(self, years, emp, series):
        self.years, self.emp, self.series = years, emp, series
        self.nat = {s: series[("0000", s)] for s in ("1+2", "2", "1") if ("0000", s) in series}

    def parents(self, t: int, sex: str):
        """Employment-weighted robust growth of each 3-digit occupation group at index t."""
        acc: dict[str, list] = {}
        for (code, s), y in self.series.items():
            if s != sex or code == "0000" or not np.isfinite(y[t]):
                continue
            g = robust_growth(y, t)
            if g is not None:
                acc.setdefault(code[:3], []).append((g, self.emp.get(code, 1) or 1))
        return {k: float(np.average([g for g, _ in v], weights=[w for _, w in v])) for k, v in acc.items()}

    def point(self, code, sex, t, w_occ, w_grp, rev, grp_cache):
        y, nat = self.series[(code, sex)], self.nat.get(sex)
        if nat is None or not np.isfinite(y[t]):
            return None
        g_occ, g_nat = robust_growth(y, t), robust_growth(nat, t)
        if g_occ is None or g_nat is None:
            return None
        g_grp = grp_cache.get(code[:3], g_nat)
        g = w_occ * g_occ + w_grp * g_grp + (1 - w_occ - w_grp) * g_nat
        excess = (y[t] - y[t - 1]) - (nat[t] - nat[t - 1]) if t and np.isfinite(y[t - 1]) else 0.0
        return y[t] + g * np.arange(1, H + 1) - rev * excess


def backtest(m: Model, origins, w_occ, w_grp, rev=0.0, naive=False):
    """Log errors (actual - forecast) per horizon, plus each error's occupation volatility."""
    errs = {h: [] for h in range(1, H + 1)}
    for T in origins:
        t = m.years.index(T)
        for sex in m.nat:
            grp = m.parents(t, sex)
            for (code, s), y in m.series.items():
                if s != sex or code == "0000":
                    continue
                if naive:
                    p = naive_point(y, t)
                else:
                    p = m.point(code, sex, t, w_occ, w_grp, rev, grp)
                if p is None:
                    continue
                vol = volatility(y, m.nat[sex], t)
                for h in range(1, H + 1):
                    if t + h < len(m.years) and np.isfinite(y[t + h]):
                        errs[h].append((y[t + h] - p[h - 1], vol))
    return errs


def naive_point(y, t):
    """The page's earlier projection: compound growth over the last five years with data, carried forward."""
    ok = [(i, v) for i, v in enumerate(y[: t + 1]) if np.isfinite(v)]
    if len(ok) < 2 or ok[-1][0] != t:
        return None
    first = next((p for p in ok if p[0] >= t - WIN), ok[0])
    if first[0] == t:
        return None
    g = (y[t] - first[1]) / (t - first[0])
    return y[t] + g * np.arange(1, H + 1)


def mape(errs):
    return {h: round(float(np.mean(np.abs(np.expm1(np.array([e for e, _ in v]))))) * 100, 2) for h, v in errs.items() if v}


def band_quantiles(errs):
    """Quantiles of volatility-scaled errors per horizon; the band is point * exp(q * volatility)."""
    a = (1 - LEVEL) / 2
    return {h: [float(np.quantile([e / s for e, s in v], a)), float(np.quantile([e / s for e, s in v], 1 - a))] for h, v in errs.items() if v}


def coverage(errs, q):
    out = {}
    for h, v in errs.items():
        if v and h in q:
            inside = [q[h][0] * s <= e <= q[h][1] * s for e, s in v]
            out[h] = round(100 * float(np.mean(inside)), 1)
    return out


def main() -> int:
    d, years, emp, series = load()
    m = Model(years, emp, series)
    grid = [(a, b, r) for a, b in itertools.product(np.linspace(0, 1, 6), repeat=2) if a + b <= 1 + 1e-9 for r in (0, 0.25, 0.5, 0.75)]
    score = lambda e: float(np.mean([abs(x) for v in e.values() for x, _ in v]))  # noqa: E731
    w_occ, w_grp, rev = (round(float(x), 2) for x in min(grid, key=lambda abr: score(backtest(m, TUNE_ORIGINS, *abr))))

    q_tune = band_quantiles(backtest(m, TUNE_ORIGINS, w_occ, w_grp, rev))
    test = backtest(m, TEST_ORIGINS, w_occ, w_grp, rev)
    test_naive = backtest(m, TEST_ORIGINS, 0, 0, naive=True)
    report = {
        "tunedOn": [TUNE_ORIGINS.start, TUNE_ORIGINS.stop - 1], "testedOn": [TEST_ORIGINS.start, TEST_ORIGINS.stop - 1],
        "weights": {"occupation": w_occ, "group": w_grp, "national": round(1 - w_occ - w_grp, 2), "reversal": rev},
        "mape": {"model": mape(test), "naive": mape(test_naive)},
        "coverage": coverage(test, q_tune), "level": LEVEL,
        "n": {h: len(v) for h, v in test.items()},
    }
    # The published band uses every origin, so the newest years shape it too.
    q = band_quantiles(backtest(m, list(TUNE_ORIGINS) + list(TEST_ORIGINS), w_occ, w_grp, rev))

    t = len(years) - 1
    f: dict[str, dict] = {}
    for sex in m.nat:
        grp = m.parents(t, sex)
        for (code, s), y in series.items():
            if s != sex:
                continue
            p = m.point(code, sex, t, w_occ, w_grp, rev, grp)
            if p is None:
                continue
            vol = volatility(y, m.nat[sex], t)
            rows = [[int(round(np.exp(p[h - 1]) / 100) * 100), int(round(np.exp(p[h - 1] + q[h][0] * vol) / 100) * 100), int(round(np.exp(p[h - 1] + q[h][1] * vol) / 100) * 100)] for h in range(1, H + 1)]
            f.setdefault(code, {})[sex] = rows

    out = {
        "generated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "base": years[-1], "years": [years[-1] + h for h in range(1, H + 1)], "sector": d["sector"],
        "method": "national median growth blended with occupation and group growth, minus part of last year's excess jump; weights and band from a rolling-origin backtest",
        "backtest": report, "f": f,
    }
    if OUT.exists():
        old = json.loads(OUT.read_text(encoding="utf-8"))
        # Compared in saved form: the horizon keys are ints in memory and strings in the file.
        if {k: v for k, v in old.items() if k != "generated"} == {k: v for k, v in json.loads(json.dumps(out)).items() if k != "generated"}:
            print("no change; data/loner-forecast.json left unchanged")
            return 0
    OUT.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=1))
    print(f"wrote {OUT.name}: {len(f)} occupations, {OUT.stat().st_size // 1024} KB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
