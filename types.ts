
export enum TradeSignal {
  BUY = 'BUY',
  SELL = 'SELL',
  NEUTRAL = 'NEUTRAL',
  HOLD = 'HOLD'
}

// Supported AI Model Personas
export type AIModelType = 'gemini' | 'deepseek' | 'grok' | 'qwen' | 'chatgpt';

export interface ApiKeys {
  gemini?: string;
  deepseek?: string;
  grok?: string;
  qwen?: string;
  chatgpt?: string;
}

export interface MarketItem {
  id: string;
  timestamp: string; // ISO string
  title: string;
  summary: string;
  source: string;
  relatedCoins: string[];
  onChainInsight?: string; // Specific chain data analysis
  signal: TradeSignal;
  confidence: number; // 0-100, AI confidence in the trading signal
  sourceCredibility: number; // 0-10, AI score for source reliability/verifiability
  url?: string; // Link to source if available from grounding
}

export interface MarketReport {
  items: MarketItem[];
  overallSentiment: string;
  lastUpdated: string;
  usedModel?: AIModelType;
}

export interface CoinPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}
