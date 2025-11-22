import React, { useState, useEffect } from 'react';
import { sendTestMessage } from '../services/telegramService';
import { ApiKeys } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  telegramConfig: TelegramConfig;
  apiKeys: ApiKeys;
  onSave: (tgConfig: TelegramConfig, keys: ApiKeys) => void;
}

export interface TelegramConfig {
  enabled: boolean;
  botToken: string;
  chatId: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  telegramConfig, 
  apiKeys,
  onSave 
}) => {
  const [activeTab, setActiveTab] = useState<'telegram' | 'ai'>('telegram');
  
  const [localTgConfig, setLocalTgConfig] = useState<TelegramConfig>(telegramConfig);
  const [localApiKeys, setLocalApiKeys] = useState<ApiKeys>(apiKeys);
  
  const [isTestingTg, setIsTestingTg] = useState(false);
  const [tgTestStatus, setTgTestStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (isOpen) {
      setLocalTgConfig(telegramConfig);
      setLocalApiKeys(apiKeys);
      setTgTestStatus('idle');
    }
  }, [isOpen, telegramConfig, apiKeys]);

  if (!isOpen) return null;

  const handleTgTest = async () => {
    if (!localTgConfig.botToken || !localTgConfig.chatId) return;
    setIsTestingTg(true);
    setTgTestStatus('idle');
    const success = await sendTestMessage(localTgConfig.botToken, localTgConfig.chatId);
    setTgTestStatus(success ? 'success' : 'error');
    setIsTestingTg(false);
  };

  const handleSave = () => {
    onSave(localTgConfig, localApiKeys);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full shadow-2xl transform transition-all flex flex-col max-h-[85vh]">
        
        <div className="p-6 pb-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">设置</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 mb-4 border-b border-slate-800">
            <button 
              onClick={() => setActiveTab('telegram')}
              className={`pb-2 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'telegram' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              Telegram 推送
            </button>
            <button 
              onClick={() => setActiveTab('ai')}
              className={`pb-2 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'ai' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              AI API 配置
            </button>
          </div>
        </div>

        <div className="p-6 pt-0 overflow-y-auto">
          
          {/* Telegram Tab */}
          {activeTab === 'telegram' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                <span className="text-sm font-medium text-slate-200">开启自动推送</span>
                <button 
                  onClick={() => setLocalTgConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${localTgConfig.enabled ? 'bg-blue-600' : 'bg-slate-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localTgConfig.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Bot Token</label>
                <input 
                  type="password" 
                  value={localTgConfig.botToken}
                  onChange={(e) => setLocalTgConfig(prev => ({ ...prev, botToken: e.target.value }))}
                  placeholder="123456:ABC-DEF..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Chat ID</label>
                <input 
                  type="text" 
                  value={localTgConfig.chatId}
                  onChange={(e) => setLocalTgConfig(prev => ({ ...prev, chatId: e.target.value }))}
                  placeholder="123456789"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleTgTest}
                  disabled={isTestingTg || !localTgConfig.botToken || !localTgConfig.chatId}
                  className={`text-xs font-medium px-3 py-2 rounded-lg transition-colors border border-slate-700 ${isTestingTg ? 'text-slate-500 cursor-wait' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                >
                  {isTestingTg ? '发送中...' : '📡 发送测试消息'}
                </button>
                {tgTestStatus === 'success' && <span className="text-xs text-emerald-400">✅ 成功</span>}
                {tgTestStatus === 'error' && <span className="text-xs text-rose-400">❌ 失败</span>}
              </div>
            </div>
          )}

          {/* AI API Key Tab */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 mb-2 bg-slate-800/50 p-2 rounded">
                ⚠️ 配置非 Gemini 模型时，请确保填入对应的 API Key。数据将保存在本地浏览器中。
              </p>

              {/* Gemini */}
              <div>
                <label className="block text-xs font-medium text-blue-400 mb-1">Gemini API Key (默认)</label>
                <input 
                  type="password"
                  value={localApiKeys.gemini || ''}
                  onChange={(e) => setLocalApiKeys(prev => ({ ...prev, gemini: e.target.value }))}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                />
              </div>

              {/* DeepSeek */}
              <div>
                <label className="block text-xs font-medium text-indigo-400 mb-1">DeepSeek API Key</label>
                <input 
                  type="password"
                  value={localApiKeys.deepseek || ''}
                  onChange={(e) => setLocalApiKeys(prev => ({ ...prev, deepseek: e.target.value }))}
                  placeholder="sk-..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                />
              </div>

              {/* ChatGPT */}
              <div>
                <label className="block text-xs font-medium text-teal-400 mb-1">OpenAI API Key</label>
                <input 
                  type="password"
                  value={localApiKeys.chatgpt || ''}
                  onChange={(e) => setLocalApiKeys(prev => ({ ...prev, chatgpt: e.target.value }))}
                  placeholder="sk-..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-teal-500 outline-none"
                />
              </div>

              {/* Grok */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Grok API Key (xAI)</label>
                <input 
                  type="password"
                  value={localApiKeys.grok || ''}
                  onChange={(e) => setLocalApiKeys(prev => ({ ...prev, grok: e.target.value }))}
                  placeholder="xai-..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-slate-500 outline-none"
                />
              </div>
              
              {/* Qwen */}
               <div>
                <label className="block text-xs font-medium text-emerald-400 mb-1">DashScope API Key (通义千问)</label>
                <input 
                  type="password"
                  value={localApiKeys.qwen || ''}
                  onChange={(e) => setLocalApiKeys(prev => ({ ...prev, qwen: e.target.value }))}
                  placeholder="sk-..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                />
              </div>

            </div>
          )}

        </div>
        
        <div className="bg-slate-950/50 p-4 rounded-b-2xl border-t border-slate-800 flex justify-end gap-3 mt-auto">
           <button 
             onClick={onClose}
             className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
           >
             取消
           </button>
           <button 
             onClick={handleSave}
             className="px-4 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg shadow-blue-900/20 transition-all active:scale-95"
           >
             保存全部
           </button>
        </div>
      </div>
    </div>
  );
};