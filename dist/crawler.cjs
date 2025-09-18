"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/crawler.ts
var crawler_exports = {};
__export(crawler_exports, {
  crawlSite: () => crawlSite
});
module.exports = __toCommonJS(crawler_exports);
var cheerio = __toESM(require("cheerio"), 1);
var import_url = require("url");
async function crawlSite(baseUrl, maxPages = 50, sameDomainOnly = true) {
  const start = new import_url.URL(baseUrl);
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
          const nu = new import_url.URL(href, u);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  crawlSite
});
//# sourceMappingURL=crawler.cjs.map