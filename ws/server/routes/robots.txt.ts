export default defineEventHandler((event) => {
  setHeader(event, "Content-Type", "text/plain; charset=utf-8");
  setHeader(event, "Cache-Control", "public, max-age=3600");
  return [
    "User-agent: *",
    "Allow: /",
    "",
    "Sitemap: https://ngntrade.vercel.app/sitemap.xml",
    "",
  ].join("\n");
});
