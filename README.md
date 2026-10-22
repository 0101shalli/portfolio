# Shalli Leroi — Portfolio & Blog

Personal portfolio and blog built with [Astro](https://astro.build), deployed on [Vercel](https://vercel.com),
with a browser-based blog editor at **`/admin`** powered by [Decap CMS](https://decapcms.org).

- ⚡️ Static, fast pages with SEO meta tags, Open Graph cards, sitemap and RSS feed
- 🌗 Light/dark theme (follows the OS, with a toggle)
- 📱 Responsive layout with a mobile hamburger menu
- ✍️ Markdown blog with tags, reading time, drafts, cover and inline images
- 🏆 "Accomplished work" pages with a write-up, links and screenshot gallery
- 📨 Contact form in a pop-up (sends email through Resend)
- 🛠️ `/admin` editor to publish blog posts and accomplished work, with image uploads

## Project structure

```
api/                    Vercel functions: /admin GitHub login (auth.js, callback.js), contact form (contact.js)
public/admin/           Decap CMS editor (config.yml = what you can edit)
public/images/          Static images; CMS uploads go to public/images/uploads
src/content/blog/       Blog posts (one Markdown file per post)
src/content/projects/   Accomplished work shown on / and /work/<slug>
src/data/site.ts        Your name, tagline, links, skills — edit this first
src/pages/              Routes (index, work, blog, about, contact, rss.xml, 404)
```

## Local development

Requires Node.js 22.12+.

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # production build into dist/
npm run preview    # serve the production build
```

To use the blog editor locally (no GitHub login needed), run both commands in separate terminals and
open http://localhost:4321/admin:

```bash
npm run cms        # starts the Decap local proxy
npm run dev
```

## Publishing a blog post or accomplished work

**From the browser:** go to `https://your-domain/admin` and sign in with GitHub. The sidebar (and the
**New** button) offers two things to publish:

- **📝 Blog posts** — articles at `/blog`
- **🏆 Accomplished work** — projects at `/work`, each with its own page, links and an image gallery

To add images, set a **cover image**, or click the image button in the editor toolbar to upload a picture
anywhere in the text. Uploads are saved to `public/images/uploads`. Click **Publish**: Decap commits to
`main`, and Vercel redeploys automatically (~1 minute).

**From code:** add `src/content/blog/my-post.md`:

```md
---
title: My post
description: A one-sentence summary.
pubDate: 2026-10-20
tags: [javascript]
draft: false
---

Your content in Markdown…
```

Posts with `draft: true` appear in `npm run dev` but not on the live site.

## Deploying to Vercel

1. Push this repo to GitHub, then on Vercel choose **Add New → Project → Import** `0101shalli/portfolio`.
   Vercel detects Astro automatically. No settings need to change.
2. **Custom domain:** Project → Settings → Domains → add `darksideshalli.com`, then update the DNS records at
   your registrar as Vercel instructs. Then turn off GitHub Pages for this repo
   (Settings → Pages) so the two hosts don't conflict. Set `SITE_URL=https://darksideshalli.com` in
   Vercel → Settings → Environment Variables.

### Blog editor (`/admin`) setup — one time

The editor logs in with GitHub through the two small functions in `api/`.

1. Create a GitHub OAuth App at <https://github.com/settings/developers> → **New OAuth App**:
   - Homepage URL: `https://darksideshalli.com`
   - Authorization callback URL: `https://darksideshalli.com/api/callback`
2. In Vercel → Settings → Environment Variables, add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`
   from that app (and `GITHUB_OAUTH_SCOPE=repo,user` if the repo is private). Redeploy.
3. Visit `/admin` and sign in. Only GitHub accounts with write access to the repo can publish.

### Contact form setup — one time

The "Email me" / "Say hello" buttons open a pop-up form that sends you an email through
[Resend](https://resend.com) (free tier: 3,000 emails/month).

1. Sign up at resend.com **with the address that should receive messages** (e.g. shallileroi@gmail.com),
   then create an API key.
2. In Vercel → Settings → Environment Variables, add `RESEND_API_KEY` and
   `CONTACT_TO_EMAIL=shallileroi@gmail.com`. Redeploy.
3. Optional: verify `darksideshalli.com` in Resend and set `CONTACT_FROM_EMAIL` so mail comes from your domain.

Until this is set up, the form shows a message pointing visitors to your email address instead. The form
only works on Vercel (or `npx vercel dev`), not under `npm run dev`.

See `.env.example` for every variable.
