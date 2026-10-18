"""Fetch the three newest Wildsite Substack posts and write posts.json.
Runs in GitHub Actions (see .github/workflows/substack.yml). Standard library only.
Tries Substack's archive JSON first (clean titles, subtitles, covers), then falls back to the RSS feed."""
import json, re, urllib.request, xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime

BASE = "https://wildsite.substack.com"
UA = {"User-Agent": "erin-marie.com feed refresh"}

def from_api():
    req = urllib.request.Request(BASE + "/api/v1/archive?sort=new&limit=3", headers=UA)
    data = json.load(urllib.request.urlopen(req, timeout=30))
    return [{"title": (p.get("title") or "").strip(), "subtitle": (p.get("subtitle") or "").strip(),
             "url": p.get("canonical_url", ""), "date": p.get("post_date", ""), "image": p.get("cover_image") or ""}
            for p in data][:3]

def from_rss():
    req = urllib.request.Request(BASE + "/feed", headers=UA)
    root = ET.fromstring(urllib.request.urlopen(req, timeout=30).read())
    out = []
    for item in root.iter("item"):
        t = lambda tag: (item.findtext(tag) or "").strip()
        enc = item.find("enclosure")
        try: date = parsedate_to_datetime(t("pubDate")).isoformat()
        except Exception: date = ""
        out.append({"title": t("title"), "subtitle": re.sub(r"<[^>]+>", "", t("description"))[:200],
                    "url": t("link"), "date": date, "image": enc.get("url") if enc is not None else ""})
        if len(out) == 3: break
    return out

try:
    posts = from_api()
except Exception as e:
    print("archive API failed, using RSS:", e)
    posts = from_rss()
json.dump(posts, open("posts.json", "w"), indent=2, ensure_ascii=False)
print(f"wrote {len(posts)} posts")
