# 🚀 CryptoPulse - 全网加密货币行情捕获助手

<div align="center">
  <img src="https://img.shields.io/badge/Built%20With-React-blue" alt="React">
  <img src="https://img.shields.io/badge/AI-Multi%20Model-purple" alt="AI Models">
  <img src="https://img.shields.io/badge/Style-TailwindCSS-38bdf8" alt="Tailwind">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
</div>

<br />

**CryptoPulse** 是一款聚合型实时加密货币行情情报助手。它支持 **多模型直连 (Direct API Connect)**，允许用户根据偏好选择 Google Gemini、DeepSeek、OpenAI (ChatGPT)、Grok 或通义千问作为底层分析引擎。
<img width="2880" height="2072" alt="screencapture-localhost-3000-2025-11-22-21_31_10" src="https://github.com/user-attachments/assets/bc103128-30c8-4a8f-95b4-34340066d57e" />

## ✨ 核心功能

- **🧠 多模型直连架构 (New)**
  - **Gemini (默认/推荐)**: 唯一支持 **实时联网 (Google Search Grounding)** 的模型，能够抓取最新几分钟内的资讯。
  - **DeepSeek-V3/R1**: 通过官方 API 直连，发挥其极致的逻辑推理和链上数据分析能力（基于内部知识库）。
  - **ChatGPT (GPT-4o)**: 通过 OpenAI API 直连，提供华尔街机构风格的宏观分析。
  - **Grok / 通义千问**: 支持 xAI 和 阿里云 DashScope 接口直连。

- **⚡ 实时全网情报捕获 (Gemini 模式)**
  - 当使用 Gemini 时，利用 Google Search 能力实时抓取过去 24 小时内的最新资讯。
  - 智能过滤并按时间倒序排列，识别链上异动（Whale Alert）和官方公告。

- **🔐 数据隐私与安全**
  - **API Key 本地存储**: 您配置的 DeepSeek/OpenAI 等 API Key 仅保存在您浏览器的 **LocalStorage** 中，绝不会上传至任何第三方服务器。
  - 支持通过环境变量配置默认的 Gemini Key 用于快速部署。

- **📱 Telegram 实时推送**
  - 配置 Telegram Bot，将高价值的行情预警推送到手机。
  - 智能增量推送逻辑，避免重复打扰。

- **📈 实时价格行情**
  - 集成 CoinGecko API，实时展示头部代币的价格走势。

## 🛠️ 技术栈

- **前端框架**: React 19, TypeScript
- **样式库**: Tailwind CSS
- **AI SDK**: 
  - `@google/genai` (用于 Gemini)
  - `fetch` REST API (用于 DeepSeek, OpenAI 等兼容接口)
- **数据源**: Google Search (via Gemini), CoinGecko (Price)

## 🚀 快速开始

### 1. 环境准备
确保安装了 Node.js (v18+) 和 npm/yarn。

### 2. 获取代码与安装
```bash
git clone https://github.com/TaylorChen/cryptopulse.git
cd cryptopulse
npm install
```

### 3. 配置默认 Gemini Key (可选但推荐)
为了让应用“开箱即用”（默认使用 Gemini 模式），建议配置环境变量。
在项目根目录创建 `.env` 文件：
```env
API_KEY=你的_GOOGLE_GEMINI_API_KEY
```

### 4. 启动开发服务器
```bash
npm start
```
访问 `http://localhost:3000`。

## ⚙️ 模型与 API 配置指南

应用启动后，点击右上角的 **齿轮图标 (设置)** -> **"AI API 配置"** 标签页。

| 模型 | 配置方式 | 特性说明 |
| :--- | :--- | :--- |
| **Gemini** | 环境变量 `API_KEY` 或 设置页输入 | ✅ **支持实时联网搜索**，数据最新鲜。 |
| **DeepSeek** | 设置页输入 API Key | ❌ 无联网。擅长深度逻辑分析和代码/合约审计视角。 |
| **ChatGPT** | 设置页输入 API Key | ❌ 无联网。擅长宏观经济分析。 |
| **Grok** | 设置页输入 API Key | ❌ 无联网。风格犀利。 |
| **通义千问** | 设置页输入 API Key | ❌ 无联网。懂亚洲市场。 |

> **注意**: 非 Gemini 模型目前基于其训练截止日期的知识库或上下文推演进行分析，无法像 Gemini 那样直接搜索 Google 获取几分钟前的新闻。

## 📦 部署方式 (Vercel)

1. 将代码推送到 GitHub。
2. 在 Vercel 中导入项目。
3. 在 **Environment Variables** 中添加默认 Key：
   - Key: `API_KEY`
   - Value: `你的_GOOGLE_GEMINI_API_KEY`
4. 部署即可。用户访问时，可以在前端界面输入他们自己的 DeepSeek/OpenAI Key 使用其他模型。

## ⚠️ 免责声明

本项目提供的信息仅供参考，**不构成任何投资建议**。加密货币市场波动巨大，请在做出任何投资决定前自行研究 (DYOR)。

## 📄 开源协议

MIT License
