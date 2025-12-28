# 🚀 MediaFetch

A premium, universal media downloader with a **dynamic adaptive theme engine**. MediaFetch intelligently detects the platform from your URL (YouTube, TikTok, Instagram, Twitter) and transforms its entire aesthetic to match the source.

## ✨ Features

- **🎨 Adaptive Theme Engine**: The UI fluidly shifts its accent colors, background glows, and layout theme based on the pasted link.
- **🔊 High-Fidelity Audio**: Real-time FFmpeg transcoding ensures true 192kbps MP3 extraction from any video source.
- **🎥 Master Quality Video**: Automatically fetches the best available MP4 formats (up to 4K/1080p) without quality loss.
- **⚡ Liquid Transitions**: Ultra-smooth 1.2s ease-in-out transitions between themes for a high-end SaaS experience.
- **🔗 Multi-Platform Support**:
  - **YouTube**: Standard & Shorts support.
  - **TikTok**: Clean audio/video extraction.
  - **Instagram**: Reels and video support.
  - **Twitter (X)**: Fast media preservation.
- **🛡️ Secure & Lightweight**: Zero tracking, no accounts needed, and built on robust open-source binaries.

## 🛠️ Tech Stack

### Frontend
- **React 18** + **Vite**
- **Tailwind CSS** (Custom dynamic utility system)
- **Lucide React** (Premium iconography)
- **CSS Variable Theme Engine** (Liquid UI logic)

### Backend
- **Node.js** + **Express**
- **yt-dlp**: The most powerful media extraction utility.
- **FFmpeg**: Real-time audio processing and merging.
- **Fluent-FFmpeg**: Stream-based media pipelines.

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [FFmpeg](https://ffmpeg.org/) installed and in your system PATH (The app also includes a static binary fallback).

### 1. Clone the Repository
```bash
git clone https://github.com/brrrr1/MediaFetch.git
cd MediaFetch
```

### 2. Setup Backend
```bash
cd backend
npm install
npm start
```
*The backend runs on `http://localhost:3000`*

### 3. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
```
*The frontend will be available at `http://localhost:5175`*

## 📖 Usage
1. Open the app in your browser.
2. Paste a link from YouTube, TikTok, or Instagram.
3. Watch the UI transform to match the platform.
4. Select **MP4 Video** or **MP3 Audio**.
5. Hit **Download** and your file will be processed instantly.

---

*Built with precision for the modern web.*
