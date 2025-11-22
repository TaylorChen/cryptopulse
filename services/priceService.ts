import { CoinPrice } from "../types";

// CoinGecko Free API root
const COINGECKO_API = "https://api.coingecko.com/api/v3";

export const fetchTopCoins = async (): Promise<CoinPrice[]> => {
  try {
    // Fetch top 20 coins by market cap
    const response = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h`
    );
    
    if (!response.ok) {
        // Fallback if rate limited
        console.warn("CoinGecko rate limit or error");
        return [];
    }

    const data = await response.json();
    return data.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      current_price: coin.current_price,
      price_change_percentage_24h: coin.price_change_percentage_24h,
      image: coin.image
    }));
  } catch (error) {
    console.error("Error fetching coin prices:", error);
    return [];
  }
};
