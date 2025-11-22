import { MarketItem, TradeSignal } from '../types';

const TG_API_URL = 'https://api.telegram.org/bot';

export const sendTestMessage = async (token: string, chatId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${TG_API_URL}${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: '🎉 CryptoPulse 连接成功！您将在此接收最新的行情推送。',
        parse_mode: 'Markdown',
      }),
    });
    return response.ok;
  } catch (error) {
    console.error('Telegram Test Failed:', error);
    return false;
  }
};

export const sendMarketNotification = async (token: string, chatId: string, item: MarketItem) => {
  const getSignalIcon = (signal: TradeSignal) => {
    switch (signal) {
      case TradeSignal.BUY: return '🟢 买入';
      case TradeSignal.SELL: return '🔴 卖出';
      case TradeSignal.NEUTRAL: return '⚪ 观望';
      case TradeSignal.HOLD: return '🟠 持有';
      default: return '🔵';
    }
  };

  const time = new Date(item.timestamp).toLocaleTimeString('zh-CN', {hour: '2-digit', minute:'2-digit'});
  
  // Truncate summary if too long
  const MAX_SUMMARY_LENGTH = 300;
  let displaySummary = item.summary;
  if (displaySummary.length > MAX_SUMMARY_LENGTH) {
    displaySummary = displaySummary.substring(0, MAX_SUMMARY_LENGTH) + '...';
  }

  // Format message with Markdown
  // We construct the link part conditionally based on item.url existence
  const linkPart = item.url 
    ? `🔗 [阅读全文 (Read more)](${item.url})` 
    : '';

  const message = `
*${getSignalIcon(item.signal)}* | ${time}

*${item.title}*

${displaySummary}

🧠 *AI置信度:* ${item.confidence}%
📊 *来源评分:* ${item.sourceCredibility}/10
${linkPart}
  `;

  try {
    await fetch(`${TG_API_URL}${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    });
  } catch (error) {
    console.error(`Failed to send notification for item ${item.id}`, error);
  }
};