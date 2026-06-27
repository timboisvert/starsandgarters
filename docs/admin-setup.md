# /admin (Sveltia CMS) — one-time setup

The editor at `/admin` is served from this site and authenticates with GitHub via
two small serverless functions in `api/`. To make login work you need a GitHub
OAuth app and two environment variables on Vercel.

## 1. Create a GitHub OAuth app

1. GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Fill in:
   - **Application name:** Stars & Garters CMS
   - **Homepage URL:** `https://starsandgarterstheater.com`
   - **Authorization callback URL:** `https://starsandgarterstheater.com/api/callback`
3. Create it, then **generate a client secret**. Copy the **Client ID** and the
   **Client secret** (you won't see the secret again).

## 2. Add the secrets to Vercel

In the Vercel project → **Settings → Environment Variables**, add (all
environments):

| Name | Value |
| --- | --- |
| `GITHUB_OAUTH_ID` | the Client ID |
| `GITHUB_OAUTH_SECRET` | the Client secret |

Redeploy so the functions pick them up.

## 3. Verify

1. Confirm the functions deployed: visiting
   `https://starsandgarterstheater.com/api/auth` should **redirect to GitHub**
   (not 404). If it 404s, Vercel isn't serving the `api/` directory — add a
   `vercel.json` with `{ "functions": { "api/*.js": {} } }` or check the project's
   build settings, then redeploy.
2. Go to `https://starsandgarterstheater.com/admin`, click **Sign in with
   GitHub**, authorize, and confirm you can open **Events** and **Save** a change.
3. After saving, check the repo for a new commit and that Vercel redeploys.

## Who can edit

Anyone with **write access to the GitHub repo** (`timboisvert/starsandgarters`)
can log in. Add collaborators in the repo's **Settings → Collaborators**.

## Notes / things to verify on first run

- The **Show** dropdown on events uses a `relation` widget pointing at
  `content/shows.json`. If the dropdown is empty, change that field in
  `admin/config.yml` to a plain `string` widget as a fallback.
- If you'd rather not run the OAuth functions, the alternative is the maintained
  Cloudflare Worker `sveltia-cms-auth`; point `backend.base_url` in
  `admin/config.yml` at it instead. The in-repo functions avoid that extra service.
