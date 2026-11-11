import { createRoot } from 'react-dom/client';
import App from './frontend/app/App.tsx';
import './index.css';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<App />);
}

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* non-blocking */
    });
  });
}
