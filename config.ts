import { AIModelType } from './types';

export const APP_CONFIG = {
  // Default AI Model Platform
  // Options: 'gemini' | 'deepseek' | 'grok' | 'qwen' | 'chatgpt'
  DEFAULT_MODEL: 'gemini' as AIModelType,

  // Auto-refresh interval in milliseconds (10 minutes)
  REFRESH_INTERVAL: 600000, 
};