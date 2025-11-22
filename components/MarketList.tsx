
import React, { useState, useMemo } from 'react';
import { MarketItem, TradeSignal } from '../types';

interface MarketListProps {
  items: MarketItem[];
  onItemClick: (item: MarketItem) => void;
}

type SortOption = 'date-desc' | 'date-asc' | 'confidence-desc';
type FilterOption = 'ALL' | TradeSignal;

export const MarketList: React.FC<MarketListProps> = ({ items, onItemClick }) => {
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [filterBy, setFilterBy] = useState<FilterOption>('ALL');

  const getSignalBadge = (signal: TradeSignal) => {
    switch (signal) {
      case TradeSignal.BUY: return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', label: '买入' };
      case TradeSignal.SELL: return { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', label: '卖出' };
      case TradeSignal.NEUTRAL: return { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', label: '观望' };
      case TradeSignal.HOLD: return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', label: '持有' };
      default: return { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', label: '未知' };
    }
  };

  const getCredibilityColor = (score: number) => {
    if (score >= 8) return 'text-emerald-400';
    if (score >= 5) return 'text-amber-400';
    return 'text-rose-400';
  };

  // Formatting helper to make date order clear
  const formatDisplayTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
        return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else {
        // Show Month/Day for previous days
        return date.toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  const processedItems = useMemo(() => {
    let result = [...items];

    // Filter
    if (filterBy !== 'ALL') {
      result = result.filter(item => item.signal === filterBy);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'confidence-desc') {
        return b.confidence - a.confidence;
      }
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortBy === 'date-desc' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [items, sortBy, filterBy]);

  return (
    <div className="container mx-auto px-4 max-w-4xl space-y-4">
      
      {/* Controls Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-xl backdrop-blur-sm sticky top-[70px] z-30 shadow-lg">
         
         {/* Filter Control */}
         <div className="flex items-center gap-2 w-full sm:w-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <select 
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as FilterOption)}
              className="bg-slate-800 text-slate-300 text-xs font-medium rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none focus:border-blue-500 hover:border-slate-600 transition-colors w-full sm:w-auto cursor-pointer"
            >
              <option value="ALL">全部信号 (All Signals)</option>
              <option value={TradeSignal.BUY}>🟢 买入 (BUY)</option>
              <option value={TradeSignal.SELL}>🔴 卖出 (SELL)</option>
              <option value={TradeSignal.HOLD}>🟠 持有 (HOLD)</option>
              <option value={TradeSignal.NEUTRAL}>⚪ 观望 (NEUTRAL)</option>
            </select>
         </div>

         {/* Sort Control */}
         <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-slate-800 text-slate-300 text-xs font-medium rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none focus:border-blue-500 hover:border-slate-600 transition-colors w-full sm:w-auto cursor-pointer"
            >
              <option value="date-desc">🕒 最新发布 (Newest)</option>
              <option value="date-asc">🕰️ 最早发布 (Oldest)</option>
              <option value="confidence-desc">🔥 最高置信度 (Confidence)</option>
            </select>
         </div>
      </div>

      {items.length === 0 ? (
         <div className="text-center text-slate-500 py-20">
            等待最新市场数据...
         </div>
      ) : processedItems.length === 0 ? (
         <div className="text-center text-slate-500 py-20 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
            没有符合当前筛选条件的行情信息
         </div>
      ) : (
         processedItems.map((item) => {
            const style = getSignalBadge(item.signal);
            const timeDisplay = formatDisplayTime(item.timestamp);
            const credibilityColor = getCredibilityColor(item.sourceCredibility);

            return (
              <div 
                key={item.id}
                onClick={() => onItemClick(item)}
                className="group bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl p-4 transition-all duration-200 cursor-pointer flex flex-col sm:flex-row gap-4 sm:gap-6 shadow-sm hover:shadow-md hover:bg-slate-800/50"
              >
                {/* Left: Time & Signal */}
                <div className="flex sm:flex-col items-center sm:items-start justify-between sm:justify-center min-w-[100px] sm:border-r border-slate-800 sm:pr-6 gap-3">
                   <div className="text-slate-400 font-mono text-lg font-medium tracking-tight whitespace-nowrap">
                     {timeDisplay}
                   </div>
                   <span className={`px-3 py-1 rounded-md text-xs font-bold border ${style.bg} ${style.text} ${style.border}`}>
                     {style.label}
                   </span>
                </div>

                {/* Right: Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <h3 className="text-lg font-bold text-slate-200 group-hover:text-blue-400 transition-colors truncate pr-4 flex-1">
                      {item.title}
                    </h3>
                  </div>
                  
                  <p className="text-slate-400 text-sm line-clamp-2 mb-3 leading-relaxed">
                    {item.summary}
                  </p>

                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                       <span className="text-xs text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 truncate max-w-[120px]" title={item.source}>
                          {item.source}
                       </span>
                       
                       {/* Source Credibility Indicator */}
                       <div className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800" title={`信息可信度评分: ${item.sourceCredibility}/10`}>
                         <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${credibilityColor}`} viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                         </svg>
                         <span className={`text-xs font-medium ${credibilityColor}`}>
                           {item.sourceCredibility}
                         </span>
                       </div>

                       {item.onChainInsight && (
                          <div className="flex items-center text-indigo-400 text-xs" title="包含链上数据">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                            </svg>
                            链上数据
                          </div>
                       )}
                    </div>
                    
                    <div className="flex gap-1">
                       {item.relatedCoins.slice(0, 4).map(coin => (
                         <span key={coin} className="text-[10px] font-bold text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">
                           {coin}
                         </span>
                       ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
      )}
    </div>
  );
};
