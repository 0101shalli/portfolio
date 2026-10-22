// Sends messages from the site's contact form through Resend (https://resend.com).
// Needs RESEND_API_KEY and CONTACT_TO_EMAIL; see .env.example.

const LIMITS = { name: 100, email: 200, subject: 150, message: 5000 };

const escapeHtml = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const oneLine = (s) => s.replace(/[\r\n]+/g, ' ').trim();

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'Method not allowed.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) {
    return json(res, 503, { error: 'The contact form is not set up yet.' });
  }

  let body = req.body ?? {};
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return json(res, 400, { error: 'Invalid request.' });
    }
  }

  const field = (k) => (typeof body[k] === 'string' ? body[k].trim() : '');
  const name = oneLine(field('name'));
  const email = oneLine(field('email'));
  const subject = oneLine(field('subject'));
  const message = field('message');

  // Honeypot: real visitors never see or fill the "website" field.
  if (field('website')) return json(res, 200, { ok: true });

  if (!name || !email || !message) return json(res, 400, { error: 'Please fill in your name, email and message.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(res, 400, { error: 'Please enter a valid email address.' });
  for (const [k, max] of Object.entries(LIMITS)) {
    if (field(k).length > max) return json(res, 400, { error: `Your ${k} is too long (max ${max} characters).` });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL ?? 'Portfolio <onboarding@resend.dev>',
        to: [to],
        reply_to: email,
        subject: `Portfolio: ${subject || 'New message'} — from ${name}`,
        text: `From: ${name} <${email}>\n\n${message}`,
        html: `<p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
<p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
      }),
    });
    if (!response.ok) {
      console.error('Resend error', response.status, await response.text());
      return json(res, 502, { error: 'Your message could not be sent. Please try again later.' });
    }
    return json(res, 200, { ok: true });
  } catch (err) {
    console.error('Resend request failed', err);
    return json(res, 502, { error: 'Your message could not be sent. Please try again later.' });
  }
}
