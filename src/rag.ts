// src/rag.ts
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { retrieveFromDB } from './db.js';
import { config, OPENAI_API_KEY } from './config.js';

const llm = new ChatOpenAI({ 
  openAIApiKey: OPENAI_API_KEY,
  modelName: config.openai.model,
  temperature: config.openai.temperature 
});

export async function generateResponse(query: string, lang: string = 'en') {
  const docs = await retrieveFromDB(query);
  const context = docs.map(doc => doc.pageContent).join('\n');
  const salesTip = config.sales.recommendPrompt;
  
  const prompt = ChatPromptTemplate.fromMessages([
    ['human', `${config.promptTemplate.replace('{salesTip}', salesTip)} Respond in ${lang}.`]
  ]);

  const messages = await prompt.formatMessages({ context, question: query });
  const response = await llm.invoke(messages);
  
  // Lead capture if sales-related
  if (config.sales.enableLeadCapture && query.toLowerCase().includes('contact') || query.toLowerCase().includes('buy')) {
    return `${response.content}\n\nFor more details, share your email!`;
  }
  
  return response.content;
}