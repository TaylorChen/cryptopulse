
import React from 'react';
import { MarketItem, TradeSignal } from '../types';

interface DetailModalProps {
  item: MarketItem;
  onClose: () => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({ item, onClose }) => {
  const getSignalConfig = (signal: TradeSignal) => {
    switch (signal) {
      case TradeSignal.BUY: return { color: 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10', label: '买入' };
      case TradeSignal.SELL: return { color: 'text-rose-400 border-rose-500/50 bg-rose-500/10', label: '卖出' };
      case TradeSignal.NEUTRAL: return { color: 'text-slate-400 border-slate-500/50 bg-slate-500/10', label: '观望' };
      case TradeSignal.HOLD: return { color: 'text-amber-400 border-amber-500/50 bg-amber-500/10', label: '持有' };
      default: return { color: 'text-slate-400', label: signal };
    }
  };

  const signalConfig = getSignalConfig(item.signal);

  const getCredibilityInfo = (score: number) => {
    if (score >= 9) return { label: '极高 (链上/官方)', color: 'text-emerald-400', bg: 'bg-emerald-500' };
    if (score >= 7) return { label: '高 (权威媒体)', color: 'text-emerald-300', bg: 'bg-emerald-400' };
    if (score >= 5) return { label: '中等 (常规分析)', color: 'text-amber-400', bg: 'bg-amber-500' };
    return { label: '低 (需谨慎核实)', color: 'text-rose-400', bg: 'bg-rose-500' };
  };

  const credInfo = getCredibilityInfo(item.sourceCredibility || 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-black"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-mono text-slate-500">{new Date(item.timestamp).toLocaleString('zh-CN')}</span>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4 leading-snug">{item.title}</h2>
          
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="px-2 py-1 text-xs font-semibold rounded bg-slate-800 text-slate-300 border border-slate-700">
              {item.source}
            </span>
            {item.relatedCoins.map(coin => (
              <span key={coin} className="px-2 py-1 text-xs font-semibold rounded bg-blue-900/30 text-blue-400 border border-blue-800/50">
                {coin}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Signal Box */}
            <div className={`p-4 rounded-xl border ${signalConfig.color} flex flex-col items-center justify-center`}>
              <span className="text-xs opacity-80 mb-1 uppercase tracking-wide">AI 投资建议</span>
              <span className="text-2xl font-bold tracking-wider mb-2">{signalConfig.label}</span>
              <div className="w-full bg-slate-800 h-1.5 mt-1 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-current transition-all duration-500" 
                  style={{ width: `${item.confidence}%` }}
                ></div>
              </div>
              <span className="text-[10px] mt-1 opacity-70">置信度: {item.confidence}%</span>
            </div>

            {/* Credibility Box */}
            <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700 flex flex-col items-center justify-center">
              <span className="text-xs text-slate-400 mb-1 uppercase tracking-wide">来源可信度</span>
              <span className={`text-2xl font-bold tracking-wider mb-2 ${credInfo.color}`}>{item.sourceCredibility}<span className="text-sm opacity-50">/10</span></span>
               <div className="w-full bg-slate-800 h-1.5 mt-1 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${credInfo.bg} transition-all duration-500`} 
                  style={{ width: `${(item.sourceCredibility || 0) * 10}%` }}
                ></div>
              </div>
              <span className={`text-[10px] mt-1 ${credInfo.color} opacity-90`}>{credInfo.label}</span>
            </div>

            {/* OnChain Box */}
            <div className="md:col-span-1 flex flex-col gap-2">
               {item.onChainInsight ? (
                  <div className="h-full p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex flex-col justify-center">
                     <div className="flex items-center mb-1 text-indigo-400">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                         <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                       </svg>
                       <span className="font-semibold text-xs">链上验证</span>
                     </div>
                     <span className="text-xs text-slate-300">已关联链上数据</span>
                  </div>
               ) : (
                  <div className="h-full p-4 rounded-xl bg-slate-800/20 border border-slate-700 border-dashed flex items-center justify-center text-slate-500 text-xs">
                     暂无链上数据
                  </div>
               )}
            </div>
          </div>

          {item.onChainInsight && (
            <div className="mb-6 p-4 rounded-lg bg-indigo-900/10 border border-indigo-500/20">
                <h4 className="text-sm font-semibold text-indigo-300 mb-2">链上数据洞察详情</h4>
                <p className="text-slate-300 text-sm leading-relaxed font-mono text-xs">
                  {item.onChainInsight}
                </p>
            </div>
          )}

          <div className="prose prose-invert max-w-none">
            <h3 className="text-lg font-semibold text-slate-200 mb-2">深度分析与摘要</h3>
            <p className="text-slate-300 leading-relaxed whitespace-pre-line text-sm">
              {item.summary}
            </p>
          </div>

          {item.url && (
            <div className="mt-8 pt-4 border-t border-slate-800 text-right">
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                阅读原始来源
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
