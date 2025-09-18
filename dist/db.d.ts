type PageRow = {
    url: string;
    title: string;
    content: string;
    embedding: number[];
};
declare function upsertPage(p: PageRow): Promise<void>;
declare function getAllPages(): Promise<PageRow[]>;
declare function logChat(rec: {
    id: string;
    ts: number;
    lang: string;
    user: string;
    assistant: string;
    sources: string[];
}): Promise<void>;
declare function cosineSim(a: number[], b: number[]): number;

export { type PageRow, cosineSim, getAllPages, logChat, upsertPage };
