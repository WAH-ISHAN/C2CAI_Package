type Page = {
    url: string;
    title: string;
    text: string;
};
declare function crawlSite(baseUrl: string, maxPages?: number, sameDomainOnly?: boolean): Promise<Page[]>;

export { crawlSite };
