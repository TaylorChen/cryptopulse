import React from 'react';
import { MarketItem, TradeSignal } from '../types';

interface TimelineProps {
  items: MarketItem[];
  onItemClick: (item: MarketItem) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ items, onItemClick }) => {
  const getSignalBadge = (signal: TradeSignal) => {
    switch (signal) {
      case TradeSignal.BUY: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case TradeSignal.SELL: return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case TradeSignal.NEUTRAL: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      case TradeSignal.HOLD: return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    }
  };

  return (
    <div className="relative container mx-auto px-4 py-8 max-w-3xl">
      <div className="absolute left-8 sm:left-1/2 top-0 bottom-0 w-px bg-slate-800 transform -translate-x-1/2"></div>
      
      {items.map((item, index) => (
        <div key={item.id || index} className={`relative mb-12 flex flex-col sm:flex-row ${index % 2 === 0 ? 'sm:flex-row-reverse' : ''}`}>
          
          {/* Timeline Dot */}
          <div className="absolute left-8 sm:left-1/2 transform -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 border-4 border-slate-800 z-10">
            <div className={`w-2.5 h-2.5 rounded-full ${
              item.signal === TradeSignal.BUY ? 'bg-emerald-500' : 
              item.signal === TradeSignal.SELL ? 'bg-rose-500' : 'bg-slate-400'
            }`}></div>
          </div>

          {/* Content Side */}
          <div className="ml-20 sm:ml-0 sm:w-1/2 sm:px-8">
            <div 
              onClick={() => onItemClick(item)}
              className="group bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 rounded-xl p-5 transition-all duration-300 cursor-pointer shadow-lg backdrop-blur-sm"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-500 font-mono">
                  {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getSignalBadge(item.signal)}`}>
                  {item.signal}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-200 mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                {item.title}
              </h3>
              
              <p className="text-sm text-slate-400 line-clamp-3 mb-3">
                {item.summary}
              </p>
              
              <div className="flex items-center justify-between mt-2 border-t border-slate-800 pt-3">
                <div className="flex items-center space-x-2">
                   {item.onChainInsight && (
                      <span title="On-Chain Data Available" className="flex items-center justify-center w-5 h-5 rounded bg-indigo-500/20 text-indigo-400">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" /></svg>
                      </span>
                   )}
                   <span className="text-xs text-slate-500 uppercase tracking-wider">{item.source}</span>
                </div>
                <div className="flex -space-x-1">
                  {item.relatedCoins.slice(0, 3).map((coin, i) => (
                    <div key={i} className="w-5 h-5 rounded-full bg-slate-700 border border-slate-900 flex items-center justify-center text-[8px] text-white font-bold">
                      {coin[0]}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {items.length === 0 && (
        <div className="text-center text-slate-500 py-20">
          Waiting for latest market data...
        </div>
      )}
    </div>
  );
};
