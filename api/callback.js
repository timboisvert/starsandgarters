// Step 2 of GitHub OAuth for Sveltia CMS: exchange the code for a token and
// hand it back to the CMS window using the Decap/Netlify-CMS postMessage protocol.
export default async function handler(req, res) {
  const { code, state } = req.query;

  const cookies = Object.fromEntries(
    (req.headers.cookie || "").split(";").filter(Boolean).map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, v.join("=")];
    })
  );

  if (!code || !state || state !== cookies.oauth_state) {
    res.status(400).send("Invalid OAuth state. Please try signing in again.");
    return;
  }

  let result;
  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: process.env.GITHUB_OAUTH_ID,
        client_secret: process.env.GITHUB_OAUTH_SECRET,
        code,
      }),
    });
    const data = await tokenRes.json();
    result = data.error
      ? { status: "error", content: data }
      : { status: "success", content: { token: data.access_token, provider: "github" } };
  } catch (err) {
    result = { status: "error", content: { error: String(err) } };
  }

  res.setHeader("Content-Type", "text/html");
  res.status(200).send(renderPage(result.status, JSON.stringify(result.content)));
}

function renderPage(status, payloadJson) {
  // payloadJson is embedded as a JS string literal, then concatenated into the message.
  return `<!doctype html><html><body><script>
  (function () {
    function receiveMessage(e) {
      window.opener.postMessage(
        'authorization:github:${status}:' + ${JSON.stringify(payloadJson)},
        e.origin
      );
      window.removeEventListener('message', receiveMessage, false);
    }
    window.addEventListener('message', receiveMessage, false);
    window.opener.postMessage('authorizing:github', '*');
  })();
  </script></body></html>`;
}
