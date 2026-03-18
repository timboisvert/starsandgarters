import json, re, sys

def extract_schemas(filepath):
    with open(filepath) as f:
        html = f.read()
    raw = re.findall(r'<script type="application/ld\+json">\s*(.*?)\s*</script>', html, re.DOTALL)
    schemas = []
    for s in raw:
        s = s.strip()
        if s:
            schemas.append(json.loads(s))
    return schemas

# 1. Show page (masterminds)
print("=" * 60)
print("SHOW PAGE: /show/masterminds/")
print("=" * 60)
schemas = extract_schemas('_site/show/masterminds/index.html')
for data in schemas:
    if '@graph' in data:
        events = data['@graph']
        print(f"  @graph with {len(events)} Event(s):")
        for e in events:
            print(f"    - {e['name']}")
            print(f"      startDate: {e['startDate']}")
            print(f"      offers: {e.get('offers', {}).get('url', 'N/A')}")
            print(f"      location.geo: {e.get('location', {}).get('geo', {}).get('latitude', 'N/A')}")
    else:
        print(f"  @type: {data.get('@type')}")

# 2. Event page (Twilight)
print()
print("=" * 60)
print("EVENT PAGE: /show/laugh-along-live/twilight/")
print("=" * 60)
schemas = extract_schemas('_site/show/laugh-along-live/twilight/index.html')
for data in schemas:
    if data.get('@type') == 'Event':
        print(f"  name: {data['name']}")
        print(f"  startDate: {data['startDate']}")
        print(f"  eventAttendanceMode: {data.get('eventAttendanceMode', 'MISSING')}")
        print(f"  eventStatus: {data.get('eventStatus', 'MISSING')}")
        print(f"  offers.url: {data.get('offers', {}).get('url', 'MISSING')}")
        print(f"  offers.price: {data.get('offers', {}).get('price', 'MISSING')}")
        print(f"  location.geo: {data.get('location', {}).get('geo', {}).get('latitude', 'MISSING')}")
        print(f"  organizer: {data.get('organizer', {}).get('name', 'MISSING')}")

# 3. Homepage
print()
print("=" * 60)
print("HOMEPAGE: /")
print("=" * 60)
schemas = extract_schemas('_site/index.html')
print(f"  Total schema blocks: {len(schemas)}")
for data in schemas:
    t = data.get('@type', 'unknown')
    print(f"  - @type: {t}, keys: {list(data.keys())}")
    if t == 'PerformingArtsTheater':
        print(f"    name: {data.get('name')}")
    elif t == 'ItemList':
        items = data.get('itemListElement', [])
        print(f"    {len(items)} items")
        for item in items[:5]:
            ev = item.get('item', {})
            print(f"      #{item.get('position')}: {ev.get('name')} @ {ev.get('startDate')}")
        if len(items) > 5:
            print(f"      ... and {len(items) - 5} more")
    elif '@graph' in data:
        print(f"    @graph with {len(data['@graph'])} items")
    else:
        print(f"    FULL: {json.dumps(data)[:300]}")

# 4. Calendar
print()
print("=" * 60)
print("CALENDAR: /calendar/")
print("=" * 60)
schemas = extract_schemas('_site/calendar/index.html')
print(f"  Total schema blocks: {len(schemas)}")
for data in schemas:
    t = data.get('@type', 'unknown')
    print(f"  - @type: {t}, keys: {list(data.keys())}")
    if t == 'ItemList':
        items = data.get('itemListElement', [])
        print(f"    {len(items)} items")
        for item in items[:5]:
            ev = item.get('item', {})
            print(f"      #{item.get('position')}: {ev.get('name')} @ {ev.get('startDate')}")
        if len(items) > 5:
            print(f"      ... and {len(items) - 5} more")
    elif '@graph' in data:
        print(f"    @graph with {len(data['@graph'])} items")
    else:
        print(f"    FULL: {json.dumps(data)[:300]}")

# 5. Check a show with no upcoming events
print()
print("=" * 60)
print("SHOW PAGE (no events): /show/date-night-live/")
print("=" * 60)
schemas = extract_schemas('_site/show/date-night-live/index.html')
if schemas:
    for data in schemas:
        if '@graph' in data:
            print(f"  @graph with {len(data['@graph'])} events")
        else:
            print(f"  @type: {data.get('@type')}")
else:
    print("  No schemas found (expected if no upcoming events)")

print()
print("VALIDATION COMPLETE")
