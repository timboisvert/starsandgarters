# Analytics & Partner Referral Tracking — Plan

Two related goals:
1. Install Google Analytics so we can see traffic on the site at all.
2. Track which partner sites (hotels, etc.) are actually sending us visitors.

---

## 1) Google Analytics

**Currently installed: No.**

Searched the codebase for `gtag`, `googletag`, GA measurement IDs (`G-…`, `UA-…`), Google Tag Manager — nothing present. The only third-party tracker on the site is a ReachCode/rlets.com script in `src/_includes/base.njk` (lines 76-77) — that's a marketing pixel, not analytics.

Good news: there's a single base layout (`src/_includes/base.njk`) that wraps every page. One snippet there covers the whole site.

### Steps to get a GA Measurement ID (browser, not code)

1. Go to https://analytics.google.com, sign in with the account that should own the data.
2. Admin (gear icon) → Create → Account → name it "Stars & Garters" → Next.
3. Create a Property → name it "starsandgartersclub.com", set timezone (Chicago) and currency (USD) → Next, fill business details → Create.
4. Choose platform "Web" → Stream URL `https://starsandgartersclub.com`, Stream name "Web" → Create stream.
5. Copy the **Measurement ID** (looks like `G-XXXXXXXXXX`).

Once that ID is in hand, install it in `site.json` and reference it from `base.njk`.

---

## 2) Partner referral tracking

GA4 already supports this natively via **UTM parameters**.

### How it works

Each partner gets a unique URL like:

```
https://starsandgartersclub.com/?utm_source=acme-hotel&utm_medium=referral&utm_campaign=concierge-2026
```

GA4 automatically:
- Reads those params on any page they land on
- Attributes the entire session to that source
- Surfaces "acme-hotel" in Acquisition reports

Works on any page (`/calendar/?utm_source=acme-hotel` works too). Can mint as many as we want without code changes — just hand each partner their URL.

### Where it gets weaker — and the optional add-on

GA4 attributes within a session. If a visitor lands via UTM, bounces, then comes back direct later, attribution can shift.

Optional first-touch persistence script in `base.njk`: on page load, if `utm_source` is in the URL, store it in a cookie (~90 day TTL). Attribution survives across pages even if URL params are dropped, and the value can be read in GA as a custom user property. ~15 lines of JS.

### What NOT to do

- Don't rely on HTTP `Referer` headers — stripped by HTTPS policies and `rel="noopener"` links.
- Don't build a custom server-side log — overkill; UTM + GA gives us everything.

---

## Other observations

- **Privacy/consent banner**: GA4 sets cookies. No state law currently forces a banner for a Chicago-audience site. If we ever expand or care about EU visitors, revisit this.
- **ReachCode script**: It's loading on every page; unclear who owns it or what it does. Worth confirming we still want it before adding more trackers.

---

## Order of work when we pick this back up

1. Tim creates the GA4 property and gets the Measurement ID.
2. Install GA4 in `base.njk` via `site.json`.
3. Add the first-touch UTM persistence script (optional but recommended for partner attribution).
4. Draft UTM URLs for current partners — Tim provides the list of partners and campaign names.
