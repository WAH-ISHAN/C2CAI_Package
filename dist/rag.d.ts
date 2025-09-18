import { PageRow } from './db.js';
import OpenAI from 'openai';

declare function pickContext(queryVec: number[], topK?: number): Promise<PageRow[]>;
declare function answerWithRAG(opts: {
    client: OpenAI;
    model: string;
    embedModel: string;
    question: string;
    pageHint?: {
        url?: string;
        title?: string;
        text?: string;
    };
    allowLangs?: string[];
}): Promise<{
    answer: string;
    sources: string[];
}>;

export { answerWithRAG, pickContext };
