type C2CConfig = {
    site: {
        baseUrl: string;
        maxPages: number;
        sameDomainOnly: boolean;
    };
    dbPath: string;
    topK: number;
    allowLanguages: string[];
};
declare function loadConfig(): C2CConfig;
declare const env: {
    OPENAI_API_KEY: string;
    MODEL: string;
    EMBED_MODEL: string;
};

export { type C2CConfig, env, loadConfig };
