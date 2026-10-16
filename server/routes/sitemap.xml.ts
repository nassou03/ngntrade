const URLS = [
  { loc: "https://ngntrade.vercel.app/", priority: "1.0", changefreq: "weekly" },
  {
    loc: "https://ngntrade.vercel.app/analyzer",
    priority: "0.9",
    changefreq: "weekly",
  },
  {
    loc: "https://ngntrade.vercel.app/markets",
    priority: "0.8",
    changefreq: "daily",
  },
  {
    loc: "https://ngntrade.vercel.app/calendar",
    priority: "0.8",
    changefreq: "daily",
  },
  {
    loc: "https://ngntrade.vercel.app/offre",
    priority: "0.9",
    changefreq: "weekly",
  },
  {
    loc: "https://ngntrade.vercel.app/premium",
    priority: "0.6",
    changefreq: "monthly",
  },
  {
    loc: "https://ngntrade.vercel.app/copilot",
    priority: "0.5",
    changefreq: "monthly",
  },
];

export default defineEventHandler((event) => {
  setHeader(event, "Content-Type", "application/xml; charset=utf-8");
  setHeader(event, "Cache-Control", "public, max-age=3600");
  const body = URLS.map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
});
