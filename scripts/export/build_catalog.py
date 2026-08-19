import json, os

HERE = os.path.dirname(__file__)
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))

CATEGORIES = [
    {"id":"c48df78d-e590-4c5c-8dee-b31a93b130d1","name":"Productivity & Assistants","slug":"productivity-assistants","description":"Voice-powered tools to get things done faster","icon":"zap","display_order":1},
    {"id":"9957abd0-f52a-48c2-9c76-0178bd375129","name":"Health & Wellness","slug":"health-wellness","description":"Voice apps for fitness, meditation, and health tracking","icon":"heart-pulse","display_order":2},
    {"id":"514e082d-3613-4eb5-8382-12b24c53acdb","name":"Smart Home & IoT","slug":"smart-home-iot","description":"Control your connected devices with voice","icon":"home","display_order":3},
    {"id":"b398e421-93c3-4b8a-857e-95f02960dc79","name":"Communication & Social","slug":"communication-social","description":"Voice-first messaging and social platforms","icon":"message-circle","display_order":4},
    {"id":"6655dc5c-b4e2-4c9a-8d8d-acac9eada551","name":"Entertainment & Media","slug":"entertainment-media","description":"Voice-controlled music, podcasts, and media","icon":"music","display_order":5},
    {"id":"c1891c55-563c-4785-a51e-95d50e532196","name":"Education & Learning","slug":"education-learning","description":"Learn languages and skills through voice interaction","icon":"graduation-cap","display_order":6},
    {"id":"7e15652d-2866-40f4-a577-a4cfe4e28d5d","name":"Navigation & Travel","slug":"navigation-travel","description":"Voice-guided navigation and travel planning","icon":"map","display_order":7},
    {"id":"b9d91a21-3c6a-4cc7-960d-f155ce8e4b05","name":"Finance & Shopping","slug":"finance-shopping","description":"Voice commerce and financial management","icon":"wallet","display_order":8},
    {"id":"9ed95481-8bdb-403c-9987-aab5253d3247","name":"Accessibility","slug":"accessibility","description":"Voice technology making the world more accessible","icon":"accessibility","display_order":9},
    {"id":"f91eb1e7-3204-46c0-893a-5562ca5effad","name":"Developer Tools","slug":"developer-tools","description":"Voice APIs, SDKs, and developer resources","icon":"code","display_order":10},
]

SUPABASE_LOGO = "https://wllwzzmubsqzovrrucgk.supabase.co/storage/v1/object/public/app-assets/seeded/seeing-ai-logo.jpg"
LOCAL_LOGO = "/app-logos/seeing-ai-logo.jpg"

raw = json.load(open(os.path.join(HERE, "apps_raw.json")))
apps = []
for a in raw:
    tags = []
    for t in (a.get("app_tags") or []):
        tg = t.get("tags")
        if tg:
            tags.append({"name": tg["name"], "slug": tg["slug"]})
    a.pop("app_tags", None)
    if a.get("logo_url") == SUPABASE_LOGO:
        a["logo_url"] = LOCAL_LOGO
    a["tags"] = tags
    apps.append(a)

# Sort apps by created_at desc as a stable default
apps.sort(key=lambda x: x.get("created_at") or "", reverse=True)

out = {"categories": CATEGORIES, "apps": apps}
data_dir = os.path.join(ROOT, "src", "data")
os.makedirs(data_dir, exist_ok=True)
with open(os.path.join(data_dir, "catalog.json"), "w") as f:
    json.dump(out, f, ensure_ascii=False, indent=0)

print(f"categories: {len(CATEGORIES)}  apps: {len(apps)}")
print(f"featured: {sum(1 for a in apps if a['featured'])}")
print(f"coming_soon: {sum(1 for a in apps if a['is_coming_soon'])}")
print(f"with_tags: {sum(1 for a in apps if a['tags'])}")
print(f"supabase logos remaining: {sum(1 for a in apps if 'supabase' in (a.get('logo_url') or ''))}")
print(f"wrote {os.path.join(data_dir,'catalog.json')}")
