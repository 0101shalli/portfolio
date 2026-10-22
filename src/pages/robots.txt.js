export function GET({ site }) {
  return new Response(
    `User-agent: *\nDisallow: /admin/\nAllow: /\n\nSitemap: ${new URL('sitemap-index.xml', site)}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
}
