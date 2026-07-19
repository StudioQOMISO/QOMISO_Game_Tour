import csv
import json
import re
import unicodedata
import urllib.request
from io import StringIO
from pathlib import Path

import pandas as pd


WORKSPACE = Path(__file__).resolve().parents[1]
BASELINE = WORKSPACE / "data" / "rider_parameters_300_pre_rebalance.csv"
OUTPUT = WORKSPACE / "data" / "world_championship_achievements_300.json"
SOURCES = {
    "road": "https://en.wikipedia.org/wiki/UCI_Road_World_Championships_%E2%80%93_Men%27s_road_race",
    "itt": "https://en.wikipedia.org/wiki/UCI_Road_World_Championships_%E2%80%93_Men%27s_time_trial",
    "official": "https://www.uci.org/discipline/road/6TBjsDD8902tud440iv1Cu?discipline=ROA&tab=results",
}


def normalize(value):
    ascii_value = unicodedata.normalize("NFD", str(value)).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]", "", ascii_value.lower())


def clean_name(value):
    return re.sub(r"\s*\([A-Z]{3}\).*", "", str(value)).strip()


def fetch_tables(url):
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    html = urllib.request.urlopen(request, timeout=30).read().decode("utf-8")
    return pd.read_html(StringIO(html))


with BASELINE.open(encoding="utf-8", newline="") as handle:
    baseline_rows = list(csv.DictReader(handle))

names = {normalize(row["name"]): row["name"] for row in baseline_rows}
aliases = {
    normalize("Michał Kwiatkowski"): "Michal Kwiatkowski",
    normalize("Gustav Larsson"): "Gustav Erik Larsson",
}
records = {
    name: {
        "name": name,
        "road": {"gold": 0, "silver": 0, "bronze": 0, "years": []},
        "itt": {"gold": 0, "silver": 0, "bronze": 0, "years": []},
    }
    for name in names.values()
}

road_table = fetch_tables(SOURCES["road"])[1]
itt_table = fetch_tables(SOURCES["itt"])[2]

for table, event in ((road_table, "road"), (itt_table, "itt")):
    for _, row in table.iterrows():
        match = re.match(r"\d{4}", str(row.iloc[0]))
        if not match:
            continue
        year = int(match.group())
        for medal in ("Gold", "Silver", "Bronze"):
            source_key = normalize(clean_name(row[medal]))
            name = names.get(source_key) or aliases.get(source_key)
            if not name:
                continue
            key = medal.lower()
            records[name][event][key] += 1
            records[name][event]["years"].append({"year": year, "medal": key})

matched = [
    record
    for record in records.values()
    if sum(record[event][medal] for event in ("road", "itt") for medal in ("gold", "silver", "bronze"))
]
payload = {
    "snapshot": "2025 final",
    "sources": SOURCES,
    "riders": matched,
}
OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps({"riders": len(matched), "output": str(OUTPUT)}, ensure_ascii=False))
