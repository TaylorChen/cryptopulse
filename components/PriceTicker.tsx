import React from 'react';
import { CoinPrice } from '../types';

interface PriceTickerProps {
  prices: CoinPrice[];
}

export const PriceTicker: React.FC<PriceTickerProps> = ({ prices }) => {
  if (prices.length === 0) return null;

  return (
    <div className="w-full bg-slate-950 border-b border-slate-800 overflow-hidden py-2">
      <div className="relative flex overflow-x-hidden group">
        <div className="py-1 animate-marquee whitespace-nowrap flex items-center space-x-8 px-4">
          {prices.concat(prices).map((coin, idx) => (
            <div key={`${coin.id}-${idx}`} className="flex items-center space-x-2 text-sm">
              <span className="font-bold text-slate-300">{coin.symbol}</span>
              <span className="text-slate-400">${coin.current_price.toLocaleString()}</span>
              <span className={`text-xs font-medium ${coin.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {coin.price_change_percentage_24h >= 0 ? '↑' : '↓'} {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
        {/* Duplicate for seamless loop - handled by css animation usually, but simplifying here by mapping twice above */}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .group:hover .animate-marquee {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};
