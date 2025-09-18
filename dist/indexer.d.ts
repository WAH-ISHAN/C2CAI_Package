import OpenAI from 'openai';
export { createC2CAIServer } from './server.js';
export { C2CAIWidget } from './client/widget.js';
import 'express-serve-static-core';

declare function indexPages(client: OpenAI, pages: {
    url: string;
    title: string;
    text: string;
}[], embedModel: string): Promise<void>;

export { indexPages };
