// Step 1 of GitHub OAuth for Sveltia CMS: redirect the user to GitHub to authorize.
// Requires env vars GITHUB_OAUTH_ID and GITHUB_OAUTH_SECRET (set in Vercel).
import crypto from "node:crypto";

export default function handler(req, res) {
  const clientId = process.env.GITHUB_OAUTH_ID;
  if (!clientId) {
    res.status(500).send("Missing GITHUB_OAUTH_ID environment variable.");
    return;
  }

  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = req.headers["x-forwarded-proto"] || "https";
  const redirectUri = `${proto}://${host}/api/callback`;
  const state = crypto.randomBytes(16).toString("hex");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "repo,user",
    state,
    allow_signup: "false",
  });

  res.setHeader(
    "Set-Cookie",
    `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`
  );
  res.writeHead(302, {
    Location: `https://github.com/login/oauth/authorize?${params.toString()}`,
  });
  res.end();
}
