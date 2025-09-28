import {
  retrieveFromDB
} from "./chunk-FFCAIR6W.js";
import {
  OPENAI_API_KEY,
  config
} from "./chunk-PJ6TVNZO.js";

// src/rag.ts
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
var llm = new ChatOpenAI({
  openAIApiKey: OPENAI_API_KEY,
  modelName: config.openai.model,
  temperature: config.openai.temperature
});
async function generateResponse(query, lang = "en") {
  const docs = await retrieveFromDB(query);
  const context = docs.map((doc) => doc.pageContent).join("\n");
  const salesTip = config.sales.recommendPrompt;
  const prompt = ChatPromptTemplate.fromMessages([
    ["human", `${config.promptTemplate.replace("{salesTip}", salesTip)} Respond in ${lang}.`]
  ]);
  const messages = await prompt.formatMessages({ context, question: query });
  const response = await llm.invoke(messages);
  if (config.sales.enableLeadCapture && query.toLowerCase().includes("contact") || query.toLowerCase().includes("buy")) {
    return `${response.content}

For more details, share your email!`;
  }
  return response.content;
}

export {
  generateResponse
};
//# sourceMappingURL=chunk-CT4XIIIX.js.map