// src/crawler.ts
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import { config } from './config.js';

export async function crawlAndSplit(siteUrl: string): Promise<any[]> {
  const { chunkSize, chunkOverlap, maxPages } = config.crawler;
  let allDocs: any[] = [];

  try {
    // Try sitemap
    const sitemapRes = await axios.get(`${siteUrl}/sitemap.xml`);
    const parser = await parseStringPromise(sitemapRes.data);
    const urls = parser.urlset.url.slice(0, maxPages).map((u: any) => u.loc[0]);
    
    for (const url of urls) {
      const loader = new CheerioWebBaseLoader(url, { selector: "p, h1, h2, h3, .content, .product" });
      const docs = await loader.load();
      allDocs.push(...docs);
    }
  } catch (e) {
    // Fallback single page
    console.log('Sitemap not found, crawling main page.');
    const loader = new CheerioWebBaseLoader(siteUrl);
    const docs = await loader.load();
    allDocs = [docs];
  }

  const splitter = new RecursiveCharacterTextSplitter({ chunkSize, chunkOverlap });
  return await splitter.splitDocuments(allDocs);
}