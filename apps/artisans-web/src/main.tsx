// Import logger first to suppress console.log in production
import './utils/logger';

import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Exportar componentes para que estén disponibles
export { default as MaturityCalculator } from './pages/MaturityCalculator.tsx';

const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
