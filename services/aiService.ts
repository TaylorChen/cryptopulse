import { GoogleGenAI } from "@google/genai";
import { MarketReport, AIModelType, ApiKeys } from "../types";

// --- Configuration & Helpers ---

// Helper to parse JSON from Markdown code blocks
const extractJson = (text: string): any => {
  try {
    const match = text.match(/```json([\s\S]*?)```/);
    if (match && match[1]) {
      return JSON.parse(match[1]);
    }
    const firstOpen = text.indexOf('{');
    const lastClose = text.lastIndexOf('}');
    if (firstOpen !== -1 && lastClose !== -1) {
      const potentialJson = text.substring(firstOpen, lastClose + 1);
      return JSON.parse(potentialJson);
    }
    throw new Error("No JSON found");
  } catch (e) {
    console.error("Failed to parse JSON from AI response", e);
    return null;
  }
};

// Prompt Construction
const getSystemPrompt = (model: AIModelType): string => {
  const baseJsonStructure = `
    JSON 结构 (必须严格遵守):
    {
      "overallSentiment": "市场情绪总结",
      "items": [
        {
          "id": "unique_id",
          "timestamp": "ISO8601_time",
          "title": "标题",
          "summary": "摘要",
          "source": "来源",
          "relatedCoins": ["BTC"],
          "onChainInsight": "链上数据或null",
          "signal": "BUY/SELL/NEUTRAL/HOLD",
          "confidence": 90,
          "sourceCredibility": 8
        }
      ]
    }
  `;

  const commonContext = `
    当前标准时间 (UTC): ${new Date().toISOString()}
    你的任务是分析加密货币市场。
    请输出简体中文 JSON。
    ${baseJsonStructure}
  `;

  switch (model) {
    case 'deepseek':
      return `你现在是 **DeepSeek (深度求索)**。
      风格：极致理性、冷峻、逻辑严密。专注于链上数据逻辑和数学概率。
      注意：作为API模型，你可能无法实时联网，请基于你掌握的最新的知识库进行深度逻辑推演和分析。
      ${commonContext}`;
    
    case 'grok':
      return `你现在是 **Grok**。
      风格：幽默、犀利、反传统。关注社区情绪和MEME趋势。
      ${commonContext}`;
      
    case 'qwen':
      return `你现在是 **通义千问**。
      风格：宏观视野，专注于亚洲市场和宏观政策解读。
      ${commonContext}`;
      
    case 'chatgpt':
      return `你现在是 **ChatGPT** (OpenAI)。
      风格：专业、客观、华尔街机构风格。
      ${commonContext}`;
      
    case 'gemini':
    default:
      return `你是一位拥有全网视野的顶级加密货币市场情报专家。
      风格：快速、准确、覆盖面广。
      **必须使用 Google Search 工具获取最新实时资讯。**
      ${commonContext}`;
  }
};

// --- Provider Implementations ---

// 1. Google Gemini Implementation (Native SDK with Search & Retry Logic)
const callGemini = async (apiKey: string, prompt: string): Promise<MarketReport | null> => {
  const MAX_RETRIES = 3;
  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }], // Gemini gets Real-time Search
          temperature: 0.3,
        },
      });

      const text = response.text;
      if (!text) throw new Error("Empty response");

      const parsedData = extractJson(text);
      if (!parsedData || !parsedData.items) throw new Error("Invalid JSON");

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      
      // Enhance with Search Metadata
      const enrichedItems = parsedData.items.map((item: any, index: number) => {
          let url = undefined;
          if (groundingChunks && groundingChunks.length > index) {
              url = groundingChunks[index].web?.uri;
          }
          // Robust timestamp logic
          let date = new Date(item.timestamp);
          if (isNaN(date.getTime())) date = new Date();

          return { ...item, timestamp: date.toISOString(), url };
      });

      enrichedItems.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return {
        items: enrichedItems,
        overallSentiment: parsedData.overallSentiment,
        lastUpdated: new Date().toISOString(),
        usedModel: 'gemini'
      };
    } catch (error) {
      console.error(`Gemini API Attempt ${attempts + 1} failed:`, error);
      attempts++;
      if (attempts >= MAX_RETRIES) {
        console.error("Gemini API Max retries reached");
        return null;
      }
      // Exponential backoff: 1s, 2s, 4s...
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts - 1)));
    }
  }
  return null;
};

// 2. OpenAI Compatible Implementation (DeepSeek, Grok, Qwen, ChatGPT)
const callOpenAICompatible = async (
  modelType: AIModelType, 
  apiKey: string, 
  baseURL: string, 
  modelName: string,
  prompt: string
): Promise<MarketReport | null> => {
  try {
    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: "请分析当前 Crypto 市场并给出报告。" }
        ],
        temperature: 0.5,
        stream: false,
        // Note: Not all providers support response_format: { type: "json_object" }
        // We rely on the prompt instruction for JSON
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) throw new Error("No content in response");

    const parsedData = extractJson(content);
    if (!parsedData || !parsedData.items) throw new Error("Invalid JSON structure");

    // Fix timestamps since these models don't have real-time search to get exact article times
    // We rely on their hallucination or internal clock, but sanitize it.
    const enrichedItems = parsedData.items.map((item: any) => {
       let date = new Date(item.timestamp);
       if (isNaN(date.getTime())) date = new Date();
       return { ...item, timestamp: date.toISOString() };
    });

    return {
      items: enrichedItems,
      overallSentiment: parsedData.overallSentiment,
      lastUpdated: new Date().toISOString(),
      usedModel: modelType
    };

  } catch (error) {
    console.error(`${modelType} API Error:`, error);
    return null;
  }
};

// --- Main Facade ---

export const fetchMarketAnalysis = async (
  modelType: AIModelType, 
  apiKeys: ApiKeys
): Promise<MarketReport | null> => {
  
  const prompt = getSystemPrompt(modelType);

  switch (modelType) {
    case 'gemini':
      // Priority: User Setting > Env Var
      const geminiKey = apiKeys.gemini || process.env.API_KEY;
      if (!geminiKey) {
        console.error("Missing Gemini API Key");
        return null;
      }
      return callGemini(geminiKey, prompt);

    case 'deepseek':
      if (!apiKeys.deepseek) {
        console.error("Missing DeepSeek API Key");
        return null;
      }
      return callOpenAICompatible(
        'deepseek', 
        apiKeys.deepseek, 
        'https://api.deepseek.com', 
        'deepseek-chat', 
        prompt
      );

    case 'chatgpt':
      if (!apiKeys.chatgpt) {
        console.error("Missing OpenAI API Key");
        return null;
      }
      return callOpenAICompatible(
        'chatgpt', 
        apiKeys.chatgpt, 
        'https://api.openai.com/v1', 
        'gpt-4o', 
        prompt
      );

    case 'grok':
      if (!apiKeys.grok) {
        console.error("Missing Grok API Key");
        return null;
      }
      return callOpenAICompatible(
        'grok', 
        apiKeys.grok, 
        'https://api.x.ai/v1', 
        'grok-beta', 
        prompt
      );

    case 'qwen':
      if (!apiKeys.qwen) {
        console.error("Missing Qwen API Key");
        return null;
      }
      return callOpenAICompatible(
        'qwen', 
        apiKeys.qwen, 
        'https://dashscope.aliyuncs.com/compatible-mode/v1', 
        'qwen-turbo', 
        prompt
      );

    default:
      return null;
  }
};