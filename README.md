# Sverige Live

Dashboards on Swedish open data. They update when the agencies publish.

**Live site: https://rajathpi.github.io/sverige-live/**

| Dashboard | What it shows | Data | How it stays current |
|---|---|---|---|
| [Economy](https://rajathpi.github.io/sverige-live/economy/) | Inflation (CPIF, CPI) against the policy rate, unemployment, house prices by region, business and consumer confidence, EUR/SEK, and a calendar of the next releases | SCB, Sveriges Riksbank, Konjunkturinstitutet | GitHub Action, three times every weekday |
| [Göteborg](https://rajathpi.github.io/sverige-live/goteborg/) | Weather now and the next 48 hours, Sweden's electricity production by source this hour, the SE3 electricity price, police reports | SMHI, Svenska kraftnät, Polisen, elprisetjustnu.se | Fetched in the browser, refreshed while the page is open |
| [Kommuner](https://rajathpi.github.io/sverige-live/kommuner/) | All 290 municipalities on a map for taxes, schools, elder care, health, jobs and safety; pick any and compare them | Kolada (RKA) | Fetched in the browser on every visit |

Plain HTML, CSS and JavaScript with [D3](https://d3js.org) for the charts. No build step, no tracking, no API keys. The look (Mona Sans, Hubot Sans, the light/dark switch) is the theme kit from [Studio Hub](https://github.com/rajathpi/studio-hub).

## How the data stays live

Some agencies send the CORS headers a web page needs, so those pages call the
APIs directly from your browser:

- SMHI open data, Svenska kraftnät's control room, Polisen's events API and Kolada are fetched by `goteborg/` and `kommuner/` every time the page opens, and refreshed on a timer while it stays open (paused when the tab is hidden).

The Riksbank's SWEA API and Konjunkturinstitutet's statistics database cannot be
called from a browser, so the economy figures are collected by a scheduled job:

- [`.github/workflows/update-data.yml`](.github/workflows/update-data.yml) runs [`scripts/update_economy.py`](scripts/update_economy.py) at 07:20, 09:20 and 14:20 UTC on weekdays. That catches SCB's 08:00 releases, the Riksbank's 09:30 decisions and Konjunkturinstitutet's morning publications within a couple of hours.
- The script writes [`data/economy.json`](data/economy.json) and only commits when a number actually changed, so the history shows one commit per real release.
- Upcoming Riksbank decisions are read from the Riksbank's public calendar. SCB and Konjunkturinstitutet dates are estimated from each agency's regular rhythm and shown as "≈ expected".

Run it yourself (Python 3.9+, standard library plus optional `certifi`):

```bash
python scripts/update_economy.py
```

## Repository layout

```
index.html                  landing page with a live figure from each dashboard
assets/css/kit.css          Studio Hub theme kit: fonts, light/dark tokens, theme switch
assets/css/base.css         layout, cards, KPI tiles, charts
assets/js/theme.js          the light/dark switch (shares its setting with Studio Hub)
assets/js/core.js           shared helpers: fetch with timeout and cache, formatting, tooltip
assets/geo/kommuner.geojson simplified municipality borders
economy/                    Economy (reads data/economy.json)
goteborg/                   Göteborg (live browser fetches)
kommuner/                   Kommuner (live Kolada fetches)
data/economy.json           written by the scheduled job
scripts/update_economy.py   fetches SCB, Riksbank and Konjunkturinstitutet series
.github/workflows/          the schedule
```

## Run locally

Any static server works; the pages use relative paths and `fetch`, so opening the files directly from disk will not load the data.

```bash
python -m http.server 8000
```

Then open http://localhost:8000/.

## Data sources and terms

The code is MIT licensed (see [LICENSE](LICENSE)). The data belongs to the publishers below; each dashboard names its source next to every chart.

| Source | Used for | Terms |
|---|---|---|
| [SCB, Statistics Sweden](https://www.scb.se/en/) (PxWebApi 2.0) | CPIF, CPI, Labour Force Survey, real estate price index | Open data, CC0 |
| [Sveriges Riksbank](https://www.riksbank.se/en-gb/statistics/) (SWEA API, calendar) | Policy rate, EUR/SEK, decision dates | Free to use with the source named |
| [Konjunkturinstitutet](https://www.konj.se/english.html) (statistics database) | Economic Tendency Indicator, consumer confidence | Free to use with the source named |
| [SMHI Open Data](https://www.smhi.se/data) | Observations at Göteborg A, SNOW1g point forecast | CC BY 4.0 |
| [Svenska kraftnät](https://www.svk.se/om-kraftsystemet/kontrollrummet/) | Production by source and consumption, from the control room | Public data, source named |
| [Polisen](https://polisen.se/om-polisen/om-webbplatsen/oppna-data/) | Police events | Open data, source named |
| [Kolada](https://www.kolada.se) (RKA, API v3) | Municipal key figures | Open data, source named |
| [elprisetjustnu.se](https://www.elprisetjustnu.se) | SE3 spot price (community service built on Nord Pool data, not an official source) | Free API, source named |
| [okfse/sweden-geojson](https://github.com/okfse/sweden-geojson) | Municipality borders, simplified from Valmyndigheten's data | Free to reuse |

If a source changes its API, the affected card shows an error and the rest of the page keeps working.
