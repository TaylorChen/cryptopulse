import React from 'react';
import { AIModelType } from '../types';

interface HeaderProps {
  lastUpdated: string | null;
  onRefresh: () => void;
  isLoading: boolean;
  selectedModel?: AIModelType;
  onModelSelect?: (model: AIModelType) => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  lastUpdated, 
  onRefresh, 
  isLoading, 
  selectedModel = 'gemini',
  onModelSelect = () => {},
  onOpenSettings = () => {},
}) => {

  const models: {id: AIModelType, label: string, icon: string}[] = [
    { id: 'gemini', label: 'Gemini', icon: '✨' },
    { id: 'deepseek', label: 'DeepSeek', icon: '🧠' },
    { id: 'grok', label: 'Grok', icon: '🚀' },
    { id: 'qwen', label: '千问', icon: '🐼' },
    { id: 'chatgpt', label: 'ChatGPT', icon: '🤖' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 15.293 6.293A1 1 0 0115 7z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                CryptoPulse
              </h1>
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">全网行情捕获助手</div>
            </div>
          </div>
          
          {/* Model Selector */}
          <div className="flex items-center overflow-x-auto no-scrollbar bg-slate-950/50 p-1 rounded-lg border border-slate-800">
             {models.map((m) => (
               <button
                 key={m.id}
                 onClick={() => onModelSelect(m.id)}
                 disabled={isLoading}
                 className={`
                    flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap
                    ${selectedModel === m.id 
                      ? 'bg-slate-700 text-white shadow-sm' 
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                 `}
               >
                 <span>{m.icon}</span>
                 <span>{m.label}</span>
               </button>
             ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between md:justify-end space-x-3 text-xs">
            <span className="text-slate-500 hidden lg:inline-block mr-2">
              {lastUpdated ? `更新于: ${new Date(lastUpdated).toLocaleTimeString('zh-CN')}` : '准备就绪'}
            </span>
            
            {/* Settings Button */}
            <button
               onClick={onOpenSettings}
               className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700 transition-all"
               title="Telegram 推送设置"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
               </svg>
            </button>

            <button 
              onClick={onRefresh}
              disabled={isLoading}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all
                ${isLoading 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 active:scale-95'}
              `}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{isLoading ? '扫描' : '立即捕获'}</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};