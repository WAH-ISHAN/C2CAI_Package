// src/crawler.ts
import * as cheerio from "cheerio";
import { URL } from "url";
async function crawlSite(baseUrl, maxPages = 50, sameDomainOnly = true) {
  const start = new URL(baseUrl);
  const q = [start.href];
  const seen = /* @__PURE__ */ new Set();
  const pages = [];
  while (q.length && pages.length < maxPages) {
    const u = q.shift();
    if (seen.has(u)) continue;
    seen.add(u);
    try {
      const res = await fetch(u, { headers: { "User-Agent": "C2CAI/0.1" } });
      if (!res.ok || !res.headers.get("content-type")?.includes("text/html")) continue;
      const html = await res.text();
      const $ = cheerio.load(html);
      $("script,style,noscript").remove();
      const title = $("title").text() || u;
      const main = $("main").text() || $("body").text();
      const text = main.replace(/\s+/g, " ").trim();
      pages.push({ url: u, title, text });
      const domain = start.hostname;
      $("a[href]").each((_, el) => {
        const href = $(el).attr("href");
        if (!href) return;
        try {
          const nu = new URL(href, u);
          if (sameDomainOnly && nu.hostname !== domain) return;
          if (nu.protocol.startsWith("http")) q.push(nu.href.split("#")[0]);
        } catch {
        }
      });
    } catch {
    }
  }
  return pages;
}
export {
  crawlSite
};
//# sourceMappingURL=crawler.js.map