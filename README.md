# Valley Pulse

A React + TypeScript Progressive Web App for real-time weather, air quality, and local news for Fresno and Tulare Counties, California.

## Features

- **Real-time Weather** - Current conditions, high/low temps from Open-Meteo
- **Air Quality Index** - US AQI with color-coded status
- **Local News** - RSS feeds from ABC30, KSEE24, KMPH
- **PWA Support** - Install on your phone, works offline
- **Dark Mode** - Easy on the eyes, always

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Vite PWA Plugin

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)

### Installation

1. Clone this repo or download the files

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173 in your browser

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

## Deploy to Vercel

1. Push your code to GitHub

2. Go to [vercel.com](https://vercel.com)

3. Import your GitHub repo

4. Click Deploy - that's it!

Vercel will automatically detect it's a Vite project and configure everything.

## APIs Used

- [Open-Meteo Weather API](https://open-meteo.com/) - Free weather data
- [Open-Meteo Air Quality API](https://open-meteo.com/) - Free AQI data
- Local news RSS feeds via CORS proxies

## License

MIT
