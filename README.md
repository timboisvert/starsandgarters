# Stars & Garters

Static site built with Eleventy + Tailwind CSS.

## Commands

```sh
bun run dev    # Dev server with hot reload
bun run build  # Build to _site/
```

## Adding a show

Edit `src/_data/shows.json` and add a new entry with:
- `slug` - URL-friendly name
- `title` - Display name
- `schedule` - When it runs
- `poster` - Filename in /posters (or null)
