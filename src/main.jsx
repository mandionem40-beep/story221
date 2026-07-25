import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { preloadAllVideos } from '@/lib/video-preloader'
import { setupPWA } from '@/lib/pwa-setup'

// Start preloading all known showcase/universe videos the instant the app
// boots — before React even renders a single page. This ensures the browser
// HTTP cache is warm by the time any AutoVideo component mounts.
preloadAllVideos();

// PWA: inject manifest + register service worker for installability + offline
setupPWA();

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)