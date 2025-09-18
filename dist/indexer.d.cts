import OpenAI from 'openai';
export { createC2CAIServer } from './server.cjs';
export { C2CAIWidget } from './client/widget.cjs';
import 'express-serve-static-core';

declare function indexPages(client: OpenAI, pages: {
    url: string;
    title: string;
    text: string;
}[], embedModel: string): Promise<void>;

export { indexPages };
