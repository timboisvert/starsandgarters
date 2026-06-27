# Editing the site without a computer or Claude

The site is built from a few data files in this repo. When any change, Vercel
rebuilds and republishes within a minute or two — no terminal, no deploy step.

This site has its own editor at **https://starsandgarterstheater.com/admin**
(Sveltia CMS). It signs in with your GitHub account and saves edits straight back
into this repo. It works from a phone browser — bookmark `/admin` to your home
screen.

The editable data lives in `content/events.json`, `content/closures.json`, and
`content/shows.json`. The CMS edits those for you; the site keeps reading them
exactly as before.

## One-time setup (an admin does this once)

The editor needs a GitHub OAuth app and two secrets on Vercel. See
[admin-setup.md](admin-setup.md) for the full steps. Once that's done, anyone you
add as a collaborator on the GitHub repo can log in at `/admin`.

## Everyday tasks

Open `/admin` and sign in with GitHub. You'll see **Schedule** (Events,
Closures) and **Catalog** (Shows).

### Cancel a show tonight
- **Schedule → Events / Showtimes**, find the date, delete that entry, Save.
  (Optional: also add the date under **Closures** if the venue is fully dark.)

### Move a showtime
- Open the event, change **Date** or **Time**, Save. Order doesn't matter — the
  site sorts by date itself.

### Mark a day closed
- **Schedule → Theater Closures**, add an entry with the date and label, Save.

### Change a show (ticket link, description, poster)
- **Catalog → Shows**, pick the show, edit, Save.

### Add a brand-new show
- A new show needs **two** parts:
  1. **Catalog → Shows**: add the show with a unique **slug**.
  2. **Schedule → Events / Showtimes**: add one entry per date and pick that show.
- Put its poster image in the `posters` folder and enter just the filename in the
  **Poster filename** field.

## What happens after Save

The CMS commits to GitHub, Vercel rebuilds, and the live site updates in a couple
of minutes. A GitHub check also verifies the data is valid JSON on every change.
