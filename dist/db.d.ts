import * as _langchain_core_documents from '@langchain/core/documents';
import { Document } from '@langchain/core/documents';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';

declare function initDB(docs: Document[]): Promise<void>;
declare function retrieveFromDB(query: string, k?: number): Promise<_langchain_core_documents.DocumentInterface<Record<string, any>>[]>;
declare function getDB(): MemoryVectorStore | null;

export { getDB, initDB, retrieveFromDB };
