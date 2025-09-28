declare let config: {
    openai: {
        model: string;
        temperature: number;
    };
    crawler: {
        chunkSize: number;
        chunkOverlap: number;
        maxPages: number;
    };
    voice: {
        defaultLang: string;
        languages: string[];
    };
    sales: {
        enableLeadCapture: boolean;
        recommendPrompt: string;
    };
    promptTemplate: string;
};
declare const OPENAI_API_KEY: string | undefined;
declare const PORT: number;
declare const SITE_URL: string;

export { OPENAI_API_KEY, PORT, SITE_URL, config };
