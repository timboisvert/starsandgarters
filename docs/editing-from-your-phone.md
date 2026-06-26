# Editing the site without a computer or Claude

The whole site is built from a few data files in this repo. When any of them
changes, Vercel automatically rebuilds and publishes the live site within a
minute or two — no terminal, no deploy step, nothing to run.

**Pages CMS** gives you a phone-friendly way to make those changes. It's a free,
open-source editor that signs in with your GitHub account and saves your edits
straight back into this repo.

## One-time setup

1. On a computer, go to **https://app.pagescms.org** and sign in with the GitHub
   account that owns `timboisvert/starsandgarters`.
2. When prompted, **install the Pages CMS GitHub App** and grant it access to the
   `starsandgarters` repository only.
3. Open the `starsandgarters` project in Pages CMS. It reads `.pages.yml` from
   this repo and shows three sections: **Events / Showtimes**, **Theater
   Closures**, and **Shows**.

That's it. Afterward you can use it from your phone's browser — bookmark
app.pagescms.org to your home screen.

## Everyday tasks

### Cancel a show tonight
- Open **Events / Showtimes**, find the date, and **delete that entry**, then Save.
  (Optionally also add the date under **Theater Closures** if the venue is fully
  dark.)

### Move a showtime to a different date or time
- Open the event under **Events / Showtimes**, change the **Date** or **Time**,
  Save. Entries don't need to stay in order — the site sorts by date itself.

### Mark a day as closed
- Open **Theater Closures**, add an entry with the **Date** and the label
  "Theater Closed", Save.

### Change a show's details (ticket link, description, poster)
- Open **Shows**, pick the show, edit the fields, Save.

### Add a brand-new show
- A new show needs **two** parts:
  1. In **Shows**, add the show (give it a unique **slug**).
  2. In **Events / Showtimes**, add one entry per date and pick that show.
- Upload its poster image to the `posters` folder (you can do this in Pages CMS
  or directly on GitHub), and enter just the filename in the **Poster filename**
  field.

## What happens after you Save

Pages CMS commits the change to GitHub. Vercel sees the commit and rebuilds and
publishes the site automatically. Give it a couple of minutes, then refresh the
live site.

## Safety net

A GitHub check (`.github/workflows/validate-data.yml`) verifies the data files are
valid every time they change. Editing through Pages CMS keeps them valid
automatically; the check mainly protects against hand-edits made directly on
GitHub.
