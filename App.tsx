import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { PriceTicker } from './components/PriceTicker';
import { MarketList } from './components/MarketList';
import { DetailModal } from './components/DetailModal';
import { SettingsModal, TelegramConfig } from './components/SettingsModal';
import { sendMarketNotification } from './services/telegramService';
import { fetchMarketAnalysis } from './services/aiService';
import { fetchTopCoins } from './services/priceService';
import { MarketItem, CoinPrice, AIModelType, ApiKeys } from './types';
import { APP_CONFIG } from './config';

const App: React.FC = () => {
  const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
  const [prices, setPrices] = useState<CoinPrice[]>([]);
  const [sentiment, setSentiment] = useState<string>("AI 正在初始化全网连接...");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
  
  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Telegram Config
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>({
    enabled: false,
    botToken: '',
    chatId: ''
  });

  // API Keys Config
  const [apiKeys, setApiKeys] = useState<ApiKeys>({});

  // Tracking last notified time
  const lastNotifiedTimeRef = useRef<number>(Date.now());
  const isFirstLoadRef = useRef<boolean>(true);

  // Model State
  const [selectedModel, setSelectedModel] = useState<AIModelType>(APP_CONFIG.DEFAULT_MODEL);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedTgConfig = localStorage.getItem('telegram_config');
    if (savedTgConfig) {
      try { setTelegramConfig(JSON.parse(savedTgConfig)); } catch (e) {}
    }

    const savedApiKeys = localStorage.getItem('api_keys');
    if (savedApiKeys) {
      try { setApiKeys(JSON.parse(savedApiKeys)); } catch (e) {}
    }
  }, []);

  const handleSaveSettings = (tgConfig: TelegramConfig, keys: ApiKeys) => {
    setTelegramConfig(tgConfig);
    setApiKeys(keys);
    localStorage.setItem('telegram_config', JSON.stringify(tgConfig));
    localStorage.setItem('api_keys', JSON.stringify(keys));
  };

  const checkAndNotifyTelegram = async (items: MarketItem[]) => {
    if (!telegramConfig.enabled || !telegramConfig.botToken || !telegramConfig.chatId) return;

    if (isFirstLoadRef.current) {
      if (items.length > 0) {
        const maxTime = Math.max(...items.map(i => new Date(i.timestamp).getTime()));
        lastNotifiedTimeRef.current = maxTime;
      }
      isFirstLoadRef.current = false;
      return;
    }

    const newItems = items.filter(item => {
      const itemTime = new Date(item.timestamp).getTime();
      return itemTime > lastNotifiedTimeRef.current;
    });

    newItems.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    if (newItems.length > 0) {
      for (const item of newItems) {
        await sendMarketNotification(telegramConfig.botToken, telegramConfig.chatId, item);
        lastNotifiedTimeRef.current = Math.max(lastNotifiedTimeRef.current, new Date(item.timestamp).getTime());
        await new Promise(r => setTimeout(r, 500)); 
      }
    }
  };

  const loadData = useCallback(async (modelOverride?: AIModelType) => {
    const modelToUse = modelOverride || selectedModel;
    
    // Quick check if key exists for non-Gemini models
    if (modelToUse !== 'gemini' && !apiKeys[modelToUse]) {
       setSentiment(`请先在设置中配置 ${modelToUse.toUpperCase()} API Key`);
       setIsSettingsOpen(true);
       return;
    }

    setIsLoading(true);
    setSentiment(`正在连接 ${modelToUse.toUpperCase()} API 获取深度分析...`);
    
    try {
      const [analysisData, pricesData] = await Promise.all([
        fetchMarketAnalysis(modelToUse, apiKeys),
        fetchTopCoins()
      ]);

      if (analysisData) {
        setMarketItems(analysisData.items);
        setSentiment(analysisData.overallSentiment || `${modelToUse.toUpperCase()} 分析完成`);
        setLastUpdated(analysisData.lastUpdated);
        
        checkAndNotifyTelegram(analysisData.items);
      } else {
        setSentiment(`数据获取失败 (请检查 API Key 或网络)`);
      }

      if (pricesData) {
        setPrices(pricesData);
      }
    } catch (e) {
      console.error("Load data failed", e);
      setSentiment("连接中断，请检查网络配置。");
    }

    setIsLoading(false);
  }, [selectedModel, telegramConfig, apiKeys]);

  // Initial load
  useEffect(() => {
    // Small delay to ensure keys are loaded from localstorage before first fetch
    const timer = setTimeout(() => {
        loadData();
    }, 500);

    const intervalId = setInterval(() => {
      console.log("Auto-refreshing market data...");
      loadData(); 
    }, APP_CONFIG.REFRESH_INTERVAL);

    return () => {
        clearInterval(intervalId);
        clearTimeout(timer);
    };
  }, [loadData]); 

  const handleModelChange = (model: AIModelType) => {
    if (model === selectedModel) return;
    setSelectedModel(model);
    // Pass model directly to ensure immediate use in closure
    loadData(model);
  };

  const getModelDisplayName = (model: AIModelType) => {
     switch(model) {
       case 'deepseek': return 'DeepSeek R1';
       case 'grok': return 'Grok AI';
       case 'qwen': return '通义千问';
       case 'chatgpt': return 'ChatGPT-4o';
       default: return 'Gemini Flash';
     }
  };

  const getModelColor = (model: AIModelType) => {
     switch(model) {
       case 'deepseek': return 'text-indigo-400';
       case 'grok': return 'text-slate-100';
       case 'qwen': return 'text-emerald-400';
       case 'chatgpt': return 'text-teal-400';
       default: return 'text-blue-400';
     }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 pb-10">
      <Header 
        lastUpdated={lastUpdated} 
        onRefresh={() => loadData()} 
        isLoading={isLoading} 
        selectedModel={selectedModel}
        onModelSelect={handleModelChange}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      
      <PriceTicker prices={prices} />

      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {/* AI Sentiment Banner */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-blue-600 rounded-full blur-[60px] opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
               <span className={`text-xs font-bold uppercase tracking-widest border px-2 py-0.5 rounded-full bg-slate-950/50 border-slate-600 ${getModelColor(selectedModel)}`}>
                 {getModelDisplayName(selectedModel)} 
               </span>
               <span className="text-[10px] text-slate-500 animate-pulse">● API 直连模式</span>
            </div>
            <p className="text-lg md:text-xl text-slate-100 font-light leading-relaxed tracking-wide">
              "{sentiment}"
            </p>
          </div>
        </div>

        {/* Main List */}
        <div className="relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 px-2 gap-4">
                 <h2 className="text-2xl font-bold text-white flex items-center">
                    <span className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full mr-3 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
                    全网实时行情列表
                 </h2>
            </div>
            <MarketList items={marketItems} onItemClick={setSelectedItem} />
        </div>
      </main>

      {selectedItem && (
        <DetailModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
        />
      )}

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        telegramConfig={telegramConfig}
        apiKeys={apiKeys}
        onSave={handleSaveSettings}
      />
      
      {/* Loading Overlay */}
      {isLoading && marketItems.length === 0 && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center transition-all">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-slate-800 rounded-full mb-4"></div>
              <div className="absolute top-0 left-0 w-20 h-20 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
            </div>
            <p className="text-blue-400 animate-pulse font-medium tracking-wide mt-4">
               {getModelDisplayName(selectedModel)} 正在连接 API 分析...
            </p>
            <p className="text-slate-500 text-xs mt-2">数据源：{selectedModel === 'gemini' ? 'Google Search' : `${getModelDisplayName(selectedModel)} 知识库`}</p>
        </div>
      )}
    </div>
  );
};

export default App;