// Step 2 of the GitHub OAuth flow: exchange the code for a token and hand it back
// to the Decap CMS window that opened the popup (same origin only).

function page(origin, status, payload) {
  const message = JSON.stringify(`authorization:github:${status}:${JSON.stringify(payload)}`);
  const target = JSON.stringify(origin);
  // Escape "<" so nothing in the payload can close the script tag.
  const safe = (s) => s.replace(/</g, '\\u003c');
  return `<!doctype html><html><body><p>Completing sign-in…</p><script>
(function () {
  var origin = ${safe(target)};
  function receive(e) {
    if (e.origin !== origin) return;
    window.removeEventListener('message', receive);
    window.opener.postMessage(${safe(message)}, origin);
  }
  window.addEventListener('message', receive);
  window.opener.postMessage('authorizing:github', origin);
})();
</script></body></html>`;
}

function readCookie(req, name) {
  const match = (req.headers.cookie ?? '').match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match?.[1];
}

export default async function handler(req, res) {
  const host = req.headers['x-forwarded-host'] ?? req.headers.host;
  const proto = req.headers['x-forwarded-proto'] ?? 'https';
  const origin = `${proto}://${host}`;
  const { code, state } = Object.fromEntries(new URL(req.url, origin).searchParams);

  const send = (status, payload) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Set-Cookie', 'decap_oauth_state=; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
    res.statusCode = 200;
    res.end(page(origin, status, payload));
  };

  if (!code || !state || state !== readCookie(req, 'decap_oauth_state')) {
    send('error', { message: 'Invalid or expired login attempt. Please try again.' });
    return;
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${origin}/api/callback`,
      }),
    });
    const data = await response.json();
    if (!data.access_token) {
      send('error', { message: data.error_description ?? 'GitHub did not return an access token.' });
      return;
    }
    send('success', { token: data.access_token, provider: 'github' });
  } catch {
    send('error', { message: 'Could not reach GitHub. Please try again.' });
  }
}
